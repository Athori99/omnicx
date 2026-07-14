const express = require('express');
const pool = require('./db'); // Mengimpor koneksi database dari db.js
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware agar server bisa membaca data berformat JSON
app.use(express.json());

// Endpoint dasar untuk uji coba REST API awal
app.get('/', (req, res) => {
  res.send('Server OmniCX-Engine Backend berjalan dengan lancar!');
});

// Menjalankan server web
app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});