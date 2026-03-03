import sql from "mssql";
import "dotenv/config";

const config1 = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || process.env.DB_SERVER_2,
  database: process.env.DB_DATABASE || process.env.DB_DATABASE_2,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const config2 = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER_2,
  database: process.env.DB_DATABASE_2,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


const pool1 = new sql.ConnectionPool(config1);
const pool2 = new sql.ConnectionPool(config2);
const poolConnect1 = pool1.connect();
const poolConnect2 = pool2.connect();

export { pool1, pool2, poolConnect1, poolConnect2 };