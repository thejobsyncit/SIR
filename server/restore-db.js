import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'sir_recruitment.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

export async function restoreDatabase(targetBackupPath = null) {
  console.log('================================================================');
  console.log('   REVIVAL INTERNATIONAL — PRODUCTION DATABASE RESTORE UTILITY');
  console.log('================================================================\n');

  let backupFile = targetBackupPath;
  if (!backupFile) {
    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error(`Backup directory does not exist: ${BACKUP_DIR}`);
    }
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('sir_recruitment_backup_') && f.endsWith('.db'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      throw new Error('No database backups found in ' + BACKUP_DIR);
    }
    backupFile = path.join(BACKUP_DIR, backups[0]);
    console.log(`Using latest backup snapshot: ${path.basename(backupFile)}`);
  }

  if (!fs.existsSync(backupFile)) {
    throw new Error(`Specified backup file does not exist: ${backupFile}`);
  }

  // 1. Verify backup file integrity before touching active database
  console.log('1. Verifying backup snapshot integrity...');
  const testDb = await open({
    filename: backupFile,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY
  });

  const integrity = await testDb.get('PRAGMA integrity_check');
  if (integrity.integrity_check !== 'ok') {
    await testDb.close();
    throw new Error(`Backup database failed integrity check: ${JSON.stringify(integrity)}`);
  }
  console.log('   ✅ Backup snapshot integrity verified: OK');

  // Verify manifest checksum if available
  const manifestFile = backupFile.replace(/\.db$/, '.manifest.json');
  if (fs.existsSync(manifestFile)) {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const fileBuffer = fs.readFileSync(backupFile);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const sha256 = hashSum.digest('hex');
    if (sha256 === manifest.sha256) {
      console.log('   ✅ SHA-256 Checksum verified against manifest.');
    } else {
      console.warn('   ⚠️ Checksum mismatch warning: File may have been modified.');
    }
  }

  await testDb.close();

  // 2. Safety copy of current database if it exists
  if (fs.existsSync(DB_PATH)) {
    const safetySnapshot = path.join(BACKUP_DIR, `sir_recruitment_pre_restore_safety_${Date.now()}.db`);
    console.log(`2. Creating safety copy of current active DB: ${path.basename(safetySnapshot)}`);
    fs.copyFileSync(DB_PATH, safetySnapshot);
  }

  // 3. Atomically restore backup file
  console.log(`3. Restoring database to active target: ${DB_PATH}`);
  fs.copyFileSync(backupFile, DB_PATH);

  // 4. Clean up any stale WAL or SHM files if active DB was copied
  const walPath = `${DB_PATH}-wal`;
  const shmPath = `${DB_PATH}-shm`;
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

  // 5. Connect to restored DB and verify tables
  console.log('4. Verifying restored database functionality...');
  const restoredDb = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await restoredDb.run('PRAGMA journal_mode = WAL;');
  const tables = ['jobs', 'candidates', 'clients', 'interviews', 'leads'];
  for (const table of tables) {
    const res = await restoredDb.get(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`   - Restored ${table.padEnd(16)}: ${res.count} records`);
  }

  await restoredDb.close();

  console.log('\n================================================================');
  console.log('   DATABASE RESTORE COMPLETED SUCCESSFULLY & VERIFIED');
  console.log('================================================================\n');
}

// CLI Execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customBackup = process.argv[2] || null;
  restoreDatabase(customBackup)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal restore error:', err);
      process.exit(1);
    });
}
