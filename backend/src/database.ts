import dotenv from 'dotenv';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';

// O processo pode ser iniciado a partir da raiz do monorepo. Nesse caso,
// dotenv/config procura .env no diretório errado e a conexão cai nos defaults.
dotenv.config({ path: resolve(__dirname, '../.env') });

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'agrosys',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});
