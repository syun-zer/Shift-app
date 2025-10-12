const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function openDb() {
  return open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });
}

// 設定テーブルの初期化
(async () => {
  const db = await openDb();
  
  await db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
  
  // デフォルト値設定（必要人数: 3人）
  await db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('required_staff', '3')`);
})();

// 必要人数を取得
async function getRequiredStaffCount() {
  const db = await openDb();
  const result = await db.get(`SELECT value FROM settings WHERE key = 'required_staff'`);
  return result ? parseInt(result.value) : 3; // デフォルト3人
}

// 必要人数を設定
async function setRequiredStaffCount(count) {
  const db = await openDb();
  await db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('required_staff', ?)`, count.toString());
}

module.exports = { getRequiredStaffCount, setRequiredStaffCount };