const express = require("express");
const pool = require("./db");
const { syncExternalTickets } = require("./syncService");
const ticketRoutes = require("./routes/ticketRoutes"); // 1. Impor route tiket baru
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

// 2. Pasang middleware route tiket (setiap akses ke /api/tickets akan diurus oleh ticketRoutes)
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.send("Server OmniCX-Engine Backend berjalan dengan lancar!");
});

app.listen(PORT, async () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
  await syncExternalTickets();
});
