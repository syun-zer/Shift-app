const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function openDb() {
  return open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });
}

(async () => {
  const db = await openDb();

  await db.run(`CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    date DATETIME
    )`);
})();

async function createShift(userId, date) {
  const db = await openDb();
  const query = `INSERT INTO shifts (
  userId,date
  )VALUES(?,?)`;
  await db.run(query, userId, date);
}

async function getShiftsByUserId(userId) {
  const db = await openDb();
  return await db.all(`SELECT * FROM shifts
    WHERE userId = ? ORDER BY date ASC`, userId);
}

async function getFutureShiftsByUserId(userId) {
  const db = await openDb();
  const currentTime = new Date().toISOString();
  return await db.all(`SELECT * FROM shifts
    WHERE userId = ? AND date >= ? ORDER BY date ASC`, userId, currentTime);
}

async function deleteShiftById(id) {
  const db = await openDb();
  return await db.run("DELETE FROM shifts WHERE id =?", id);
}

async function updateShift(id, newDate) {
  const db = await openDb();
  return await db.run(
    `UPDATE shifts SET date = ? WHERE id = ?`,
    newDate, id
  );
}

async function deleteOldShifts(daysOld = 50) {
  const db = await openDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await db.run(
    `DELETE FROM shifts WHERE date < ?`,
    cutoffDate.toISOString()
  );
  
  console.log(`Deleted ${result.changes} shifts older than ${daysOld} days (before ${cutoffDate.toISOString()})`);
  return result.changes;
}

// Step 2: 指定月の全ユーザーのシフトを取得
async function getAllUsersShiftsForMonth(year, month) {
  const db = await openDb();
  
  // 月の最初の日と最後の日を計算
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
  
  console.log(`Getting shifts for ${year}/${month}: ${startDate} to ${endDate}`);
  
  return await db.all(`
    SELECT s.*, u.username 
    FROM shifts s 
    JOIN users u ON s.userId = u.id 
    WHERE s.date >= ? AND s.date < ?
    ORDER BY s.date, u.username
  `, startDate, endDate);
}


module.exports = { 
  createShift, 
  getShiftsByUserId, 
  getFutureShiftsByUserId, 
  deleteShiftById, 
  updateShift, 
  deleteOldShifts,
  getAllUsersShiftsForMonth 
};