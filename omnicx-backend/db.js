const { Pool } = require('pg');
require('dotenv').config();

// Konfigurasi koneksi menggunakan variabel dari file .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Uji koneksi ke database saat backend pertama kali dinyalakan
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Gagal terhubung ke database PostgreSQL:', err.stack);
  }
  console.log('✅ Berhasil terhubung ke database PostgreSQL (omnicx_db)');
  release();
});

module.exports = pool;