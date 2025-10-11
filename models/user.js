const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function openDb() {
  return open({
    filename:'./db.sqlite',
    driver: sqlite3.Database
  });
}

(async ()=> {
  const db = await openDb();

  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT)`);

  const userExists = await db.get(`SELECT * FROM users WHERE username = ?`,['user1']);

  if(!userExists) {
    const query = "INSERT INTO users (username,password) VALUES(?,?)";
    await db.run(query,['user1','sample']);
    await db.run(query,['taro','yamada']);
    await db.run(query,['hanako','flower']);
    await db.run(query,['sachiko','happy']);
  }
})();

async function findUserByUsername(username) {
  const db = await openDb();
  return await db.get(
    "SELECT * FROM users WHERE username = ?",username);
}

async function findUserById(id) {
  const db = await openDb();
  return await db.get(
    "SELECT * FROM users WHERE id = ?",id);
}

async function getAllUsers() {
  const db = await openDb();
  return await db.all("SELECT id, username FROM users ORDER BY username");
}

module.exports = { findUserByUsername, findUserById, getAllUsers };