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


module.exports = { createShift, getShiftsByUserId, getFutureShiftsByUserId, deleteShiftById, updateShift, deleteOldShifts };