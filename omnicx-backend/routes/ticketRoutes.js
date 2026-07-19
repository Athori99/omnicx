const express = require("express");
const router = express.Router();
const pool = require("../db"); // Sesuaikan dengan path database kamu

// Menampilkan seluruh tiket untuk mengisi tabel frontend
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tickets ORDER BY id DESC");
    res.json(result.rows || result[0]); // Menyesuaikan dengan library db mysql/pg
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Menyimpan tiket baru dari form frontend ke database
router.post("/", async (req, res) => {
  const { title, description, status } = req.body;

  try {
    // Jalankan query tanpa koma penutup yang menggantung
    const result = await pool.query(
      "INSERT INTO tickets (title, description, status) VALUES ($1, $2, $3) RETURNING *",
      [title, description, status || "open"],
    );

    res.status(201).json({
      message: "Tiket berhasil ditambahkan",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Detail Error PostgreSQL:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// RUTE STATISTIK TIKET (Ini yang dipanggil frontend)
router.get("/stats", async (req, res) => {
  try {
    // 1. Hitung total tiket open
    const openQuery = await pool.query(
      "SELECT COUNT(*) FROM tickets WHERE status = 'open'",
    );
    // 2. Hitung total tiket resolved
    const resolvedQuery = await pool.query(
      "SELECT COUNT(*) FROM tickets WHERE status = 'resolved'",
    );
    // 3. Hitung total tiket closed
    const closedQuery = await pool.query(
      "SELECT COUNT(*) FROM tickets WHERE status = 'closed'",
    );

    // Ambil nilai count (tergantung return package database mysql/pg kamu, umumnya rows[0] atau [0])
    const openCount = parseInt(
      openQuery.rows ? openQuery.rows[0].count : openQuery[0].count || 0,
    );
    const resolvedCount = parseInt(
      resolvedQuery.rows
        ? resolvedQuery.rows[0].count
        : resolvedQuery[0].count || 0,
    );
    const closedCount = parseInt(
      closedQuery.rows ? closedQuery.rows[0].count : closedQuery[0].count || 0,
    );

    res.json({
      open: openCount,
      resolved: resolvedCount,
      closed: closedCount,
    });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Rute ambil semua data tiket (jika ada)
router.get("/", async (req, res) => {
  // ... kode ambil semua tiket
});
// ==========================================
// RUTE TAMBAH TIKET BARU (PERBAIKAN AMAN)
// ==========================================
router.post("/", async (req, res) => {
  const { title, description, status } = req.body;

  // Log untuk memastikan data terkirim dari Vue frontend
  console.log("Data masuk ke backend:", req.body);

  try {
    // Jalankan query dengan tanda parameter PostgreSQL $1, $2, $3
    const result = await pool.query(
      "INSERT INTO tickets (title, description, status) VALUES ($1, $2, $3) RETURNING *",
      [title, description, status || "open"],
    );

    // Validasi penanganan data secara aman agar tidak memicu crash 500
    const newTicket =
      result.rows && result.rows.length > 0 ? result.rows[0] : null;

    res.status(201).json({
      message: "Tiket berhasil ditambahkan",
      ticket: newTicket,
      ticketId: newTicket ? newTicket.id : null,
    });
  } catch (error) {
    console.error("Detail Error PostgreSQL:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// ==========================================
// RUTE UPDATE STATUS TIKET (PUT)
// ==========================================
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Mengambil status baru ('open', 'resolved', 'closed')

  try {
    const text = "UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *";
    const values = [status, id];

    const result = await pool.query(text, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tiket tidak ditemukan" });
    }

    res.status(200).json({
      message: "Status tiket berhasil diperbarui",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Error saat update status:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. RUTE HAPUS TIKET (POSTGRESQL)
// ==========================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Menggunakan $1 untuk parameter PostgreSQL
    await pool.query("DELETE FROM tickets WHERE id = $1", [id]);
    res.json({ message: `Tiket dengan ID ${id} berhasil dihapus` });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res
      .status(500)
      .json({ error: "Gagal menghapus tiket dari database PostgreSQL" });
  }
});
module.exports = router;
