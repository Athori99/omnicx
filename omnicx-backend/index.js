const express = require("express");
const pool = require("./db");
const { syncExternalTickets } = require("./syncService"); // Impor modul sinkronisasi
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server OmniCX-Engine Backend berjalan dengan lancar!");
});

app.listen(PORT, async () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);

  // Menjalankan fungsi sinkronisasi otomatis tepat saat server menyala
  await syncExternalTickets();
});
