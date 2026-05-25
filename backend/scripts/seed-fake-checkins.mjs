#!/usr/bin/env node
/**
 * Insert fake check-ins directly into SQLite for brightness / gallery testing.
 *
 * Brightness formula (same as frontend getDarkScreenBrightness):
 *   30% base + 1% every 2 check-ins (max 200%)
 *
 * Usage:
 *   node scripts/seed-fake-checkins.mjs
 *   node scripts/seed-fake-checkins.mjs --count=1000
 *   node scripts/seed-fake-checkins.mjs --reset --count=1000
 *   node scripts/seed-fake-checkins.mjs --db=./checkin.db
 *
 * After seeding, refresh http://localhost:3000 to see updated brightness.
 * No API / WebSocket — DB insert only.
 */

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB = join(__dirname, '..', 'checkin.db');
const UPLOADS_DIR = join(__dirname, '..', 'uploads');

const NAMES = [
  'Minh Anh',
  'Hoàng Long',
  'Thu Hà',
  'Quốc Bảo',
  'Lan Chi',
  'Đức Anh',
  'Mai Linh',
  'Tuấn Kiệt',
  'Ngọc Hân',
  'Phúc Thịnh',
];

const MESSAGES = [
  'Năng lượng mặt trời cho tương lai xanh!',
  'Plug in to evolution!',
  'Cùng nhau bật sáng thay đổi.',
  'Mỗi kết nối là một tia sáng mới.',
  'Hướng tới năng lượng sạch.',
  'Sẵn sàng cho cuộc cách mạng năng lượng.',
  'Tôi tin vào một Việt Nam xanh hơn.',
  'Kết nối để lan tỏa ánh sáng.',
];

/** Must exist in backend/uploads/ — reused for all seeded rows (browser caches one file). */
const FAKE_PHOTO = '1779565546510-509794662.PNG';

function parseArgs(argv) {
  const options = {
    db: DEFAULT_DB,
    count: 15,
    reset: false,
  };

  for (const arg of argv) {
    if (arg === '--reset') {
      options.reset = true;
      continue;
    }
    if (arg.startsWith('--count=')) {
      options.count = Math.max(1, Number.parseInt(arg.slice('--count='.length), 10) || 15);
      continue;
    }
    if (arg.startsWith('--db=')) {
      options.db = arg.slice('--db='.length);
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Insert fake check-ins directly into SQLite (no API)

Options:
  --count=N   Number of rows to insert (default: 15)
  --db=PATH   SQLite file path (default: backend/checkin.db)
  --reset     Delete all check-ins before inserting
  --help      Show this help

Examples:
  node scripts/seed-fake-checkins.mjs --reset --count=9
  node scripts/seed-fake-checkins.mjs --count=30

After running, refresh the display page to see brightness change.
`);
}

function getDarkScreenBrightness(checkinCount) {
  const steps = Math.floor(checkinCount / 2);
  return Math.min(0.3 + steps * 0.01, 2);
}

function formatBrightness(value) {
  return `${Math.round(value * 100)}%`;
}

function getCount(db) {
  return db.prepare('SELECT COUNT(*) AS count FROM checkins').get().count;
}

function resetCheckins(db) {
  db.exec('DELETE FROM checkins');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'checkins'");
}

function insertFakeCheckins(db, count, startCount) {
  const insert = db.prepare(
    'INSERT INTO checkins (name, message, photoPath, createdAt) VALUES (?, ?, ?, ?)',
  );

  const insertMany = db.transaction((n) => {
    let previousBrightness = getDarkScreenBrightness(startCount);

    for (let i = 0; i < n; i += 1) {
      const name = `${NAMES[i % NAMES.length]} #${i + 1}`;
      const message = MESSAGES[i % MESSAGES.length];
      insert.run(name, message, FAKE_PHOTO, new Date().toISOString());

      const total = startCount + i + 1;
      const brightness = getDarkScreenBrightness(total);
      const brightnessChanged = brightness !== previousBrightness;

      console.log(
        `[${i + 1}/${n}] ✓ ${name} — total ${total} → ${formatBrightness(brightness)}${
          brightnessChanged ? ' ⬆ brightness up!' : ''
        }`,
      );

      previousBrightness = brightness;
    }
  });

  insertMany(count);
}

function main() {
  const { db: dbPath, count, reset } = parseArgs(process.argv.slice(2));

  console.log('☀️  Fake check-in DB seeder');
  console.log(`   DB:    ${dbPath}`);
  console.log(`   Count: ${count}`);
  console.log(`   Photo: ${FAKE_PHOTO}`);

  const photoPath = join(UPLOADS_DIR, FAKE_PHOTO);
  if (!existsSync(photoPath)) {
    console.warn('');
    console.warn(`⚠️  Photo not found: ${photoPath}`);
    console.warn('   Copy the file into backend/uploads/ before opening the display page.');
  }

  console.log('');

  let db;
  try {
    db = new Database(dbPath);
  } catch {
    console.error(`❌ Cannot open database: ${dbPath}`);
    console.error('   Make sure the backend has been started at least once to create checkin.db');
    process.exit(1);
  }

  try {
    if (reset) {
      console.log('🗑️  Resetting all check-ins...');
      resetCheckins(db);
      console.log('   Done.\n');
    }

    const startCount = getCount(db);
    const startBrightness = getDarkScreenBrightness(startCount);
    console.log(
      `📊 Current: ${startCount} check-ins → brightness ${formatBrightness(startBrightness)}`,
    );
    console.log('   Refresh http://localhost:3000 after seeding to see changes.\n');

    insertFakeCheckins(db, count, startCount);

    const finalCount = getCount(db);
    const finalBrightness = getDarkScreenBrightness(finalCount);

    console.log('');
    console.log(`✅ Done. ${finalCount} total check-ins → brightness ${formatBrightness(finalBrightness)}`);
    console.log('');
    console.log('Brightness reference:');
    console.log('  0–1 check-ins  → 30%');
    console.log('  2–3 check-ins  → 31%');
    console.log('  4–5 check-ins  → 32%');
    console.log('  ... +1% every 2 check-ins, max 200%');
  } finally {
    db.close();
  }
}

main();
