const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Root@1234",
    database: "find_my_movie",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;