const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

console.log('Connecting with:');
console.log('HOST:', process.env.DB_HOST);
console.log('USER:', process.env.DB_USER);
console.log('DB:', process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const promisePool = pool.promise();

module.exports = promisePool;