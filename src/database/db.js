const mysql = require("mysql2/promise");
const fs = require("fs");

const parseBoolean = (value) =>
    ["1", "true", "yes", "required"].includes(String(value || "").toLowerCase());

const getSslConfig = () => {
    if (!parseBoolean(process.env.DB_SSL) && !process.env.DB_SSL_CA && !process.env.DB_SSL_CA_PATH) {
        return undefined;
    }

    const ca = process.env.DB_SSL_CA_PATH
        ? fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8")
        : process.env.DB_SSL_CA;

    return {
        ca,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false"
    };
};

const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const getUrlConfig = (value) => {
    const url = new URL(value);

    return {
        host: url.hostname,
        port: Number(url.port || 3306),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: decodeURIComponent(url.pathname.replace(/^\//, "")),
        ssl: getSslConfig()
    };
};

const poolConfig = connectionUrl ? getUrlConfig(connectionUrl) : {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "find_my_movie",
    ssl: getSslConfig(),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10)
};

poolConfig.waitForConnections = true;
poolConfig.connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 10);

const pool = mysql.createPool(poolConfig);

module.exports = pool;
