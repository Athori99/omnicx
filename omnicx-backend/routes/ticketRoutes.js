const express = require("express");
const router = express.Router();
const pool = require("../db"); // Mengambil koneksi database dari folder atasnya

// 1. GET ALL TICKETS: Mengambil semua data tiket dari database
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tickets ORDER BY created_at DESC",
    );
    res.status(200).json({
      status: "success",
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Gagal mengambil data tiket:", error.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// 2. GET TICKET BY ID: Mengambil detail satu tiket spesifik
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM tickets WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Tiket tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("❌ Gagal mengambil detail tiket:", error.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});
// 3. UPDATE TICKET STATUS: Memperbarui status tiket berdasarkan ID
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Mengambil status baru dari body request (contoh: 'resolved' atau 'closed')

  // Validasi sederhana agar input status sesuai dengan aturan bisnis kita
  const validStatuses = ["open", "resolved", "closed"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: "Status tidak valid. Pilih antara: open, resolved, atau closed.",
    });
  }

  try {
    // Jalankan query UPDATE ke database PostgreSQL
    const result = await pool.query(
      "UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id],
    );

    // Jika data tiket tidak ditemukan
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Tiket tidak ditemukan" });
    }

    // Respons sukses dengan mengembalikan data tiket yang sudah terupdate
    res.status(200).json({
      status: "success",
      message: `Status tiket berhasil diperbarui menjadi ${status}`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Gagal memperbarui status tiket:", error.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});
// 4. GET TICKET STATISTICS: Menghitung jumlah tiket berdasarkan status
router.get("/analytics/stats", async (req, res) => {
  try {
    // Query untuk menghitung jumlah berdasarkan status menggunakan COUNT dan GROUP BY
    const result = await pool.query(
      `SELECT status, COUNT(*) as total 
       FROM tickets 
       GROUP BY status`,
    );

    // Template objek untuk menampung hasil agar formatnya rapi
    const stats = {
      open: 0,
      resolved: 0,
      closed: 0,
    };

    // Memasukkan hasil query dari PostgreSQL ke dalam objek stats
    result.rows.forEach((row) => {
      if (stats.hasOwnProperty(row.status)) {
        stats[row.status] = parseInt(row.total);
      }
    });

    // Menghitung total keseluruhan tiket yang ada
    const totalTickets = stats.open + stats.resolved + stats.closed;

    res.status(200).json({
      status: "success",
      data: {
        summary: stats,
        total: totalTickets,
      },
    });
  } catch (error) {
    console.error("❌ Gagal mengambil statistik tiket:", error.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});
module.exports = router;
