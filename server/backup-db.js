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

export async function createDatabaseBackup() {
  console.log('================================================================');
  console.log('   REVIVAL INTERNATIONAL — PRODUCTION DATABASE BACKUP UTILITY');
  console.log('================================================================\n');

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file not found at: ${DB_PATH}`);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // 1. Open Database & Check Integrity
  console.log(`1. Connecting to active database: ${DB_PATH}`);
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log('2. Running PRAGMA integrity_check...');
  const integrity = await db.get('PRAGMA integrity_check');
  if (integrity.integrity_check !== 'ok') {
    await db.close();
    throw new Error(`Database integrity check failed: ${JSON.stringify(integrity)}`);
  }
  console.log('   ✅ Database integrity verified: OK');

  // Check Journal Mode
  const journalMode = await db.get('PRAGMA journal_mode');
  console.log(`   ✅ Journal Mode: ${journalMode.journal_mode}`);

  // 2. Count records across all business tables
  console.log('3. Auditing business entity record counts...');
  const tables = ['jobs', 'candidates', 'clients', 'interviews', 'leads', 'organization_contacts', 'enquiry_activities', 'follow_ups'];
  const tableCounts = {};

  for (const table of tables) {
    try {
      const res = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
      tableCounts[table] = res.count;
      console.log(`   - ${table.padEnd(24)}: ${res.count} records`);
    } catch (err) {
      tableCounts[table] = 0;
      console.log(`   - ${table.padEnd(24)}: [Table not yet initialized]`);
    }
  }

  // 3. Generate Timestamped Backup Filename
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `sir_recruitment_backup_${dateStr}.db`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  console.log(`\n4. Creating safe atomic backup using VACUUM INTO...`);
  try {
    // VACUUM INTO produces an atomic, clean, compacted copy safe under concurrent WAL writes
    await db.run(`VACUUM INTO ?`, [backupFilePath]);
    console.log(`   ✅ VACUUM INTO completed successfully: ${backupFilePath}`);
  } catch (vacuumErr) {
    console.warn(`   VACUUM INTO not supported or failed (${vacuumErr.message}). Falling back to file copy...`);
    fs.copyFileSync(DB_PATH, backupFilePath);
  }

  await db.close();

  // 4. Calculate SHA-256 Checksum of the Backup
  const fileBuffer = fs.readFileSync(backupFilePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const sha256 = hashSum.digest('hex');
  const sizeBytes = fs.statSync(backupFilePath).size;

  // 5. Generate Manifest
  const manifest = {
    backupFileName,
    backupFilePath,
    timestamp: new Date().toISOString(),
    sizeBytes,
    sizeKb: (sizeBytes / 1024).toFixed(2),
    sha256,
    integrityCheck: 'passed',
    journalMode: journalMode.journal_mode,
    tableCounts
  };

  const manifestPath = path.join(BACKUP_DIR, `sir_recruitment_backup_${dateStr}.manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`\n================================================================`);
  console.log(`   BACKUP COMPLETED & VERIFIED:`);
  console.log(`   File: ${backupFileName} (${(sizeBytes / 1024).toFixed(1)} KB)`);
  console.log(`   SHA-256: ${sha256}`);
  console.log(`   Manifest: ${path.basename(manifestPath)}`);
  console.log(`================================================================\n`);

  return manifest;
}

// CLI Execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createDatabaseBackup()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal backup error:', err);
      process.exit(1);
    });
}
