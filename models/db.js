const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,   // Add port here
  connectTimeout: 30000        // Optional: Increase connection timeout to 30s
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected.");
  }
});

module.exports = db;
