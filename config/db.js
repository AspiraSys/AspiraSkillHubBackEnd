const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectTimeout: 30000,   
    waitForConnections: true,
    connectionLimit: 10,    
    queueLimit: 0
});

setInterval(() => {
    connection.query('SELECT 1', (err, results) => {
        if (err) {
            console.error('Keep-alive query failed:', err.message); // Only log if there is an error
        }
    });
}, 30000); 


connection.getConnection((err, conn) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database.');
        conn.release(); // Release connection back to the pool
    }
});


module.exports = connection;
