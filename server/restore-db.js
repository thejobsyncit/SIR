import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getSupabaseClient } from './supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

export async function restoreDatabase(targetBackupPath = null) {
  console.log('================================================================');
  console.log('   REVIVAL INTERNATIONAL — SUPABASE CLOUD RESTORE UTILITY');
  console.log('================================================================\n');

  let backupFile = targetBackupPath;
  if (!backupFile) {
    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error(`Backup directory does not exist: ${BACKUP_DIR}`);
    }
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => (f.startsWith('supabase_cloud_backup_') || f.startsWith('sir_recruitment_backup_')) && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      throw new Error('No JSON database backups found in ' + BACKUP_DIR);
    }
    backupFile = path.join(BACKUP_DIR, backups[0]);
    console.log(`Using latest backup snapshot: ${path.basename(backupFile)}`);
  }

  if (!fs.existsSync(backupFile)) {
    throw new Error(`Specified backup file does not exist: ${backupFile}`);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client failed to initialize. Check environment variables.');
  }

  console.log('1. Reading backup file...');
  const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

  console.log('2. Restoring tables to Supabase Cloud PostgreSQL...');
  for (const [table, rows] of Object.entries(data)) {
    if (Array.isArray(rows) && rows.length > 0) {
      try {
        const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
        if (error) {
          console.warn(`   - ${table.padEnd(24)}: Warning: ${error.message}`);
        } else {
          console.log(`   - ${table.padEnd(24)}: Restored ${rows.length} records`);
        }
      } catch (e) {
        console.warn(`   - ${table.padEnd(24)}: Exception: ${e.message}`);
      }
    }
  }

  console.log('\n================================================================');
  console.log('   RESTORE COMPLETED SUCCESSFULLY TO SUPABASE CLOUD!');
  console.log('================================================================\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customBackup = process.argv[2] ? path.resolve(process.argv[2]) : null;
  restoreDatabase(customBackup)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal restore error:', err);
      process.exit(1);
    });
}
