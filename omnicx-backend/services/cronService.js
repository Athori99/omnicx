const cron = require("node-cron");
const { Pool } = require("pg"); // Sesuaikan dengan lokasi import pool database kamu

// Menjadwalkan tugas otomatis berjalan SEATAP / SETIAP 5 MENIT
// Pola (* * * * *): Menit, Jam, Hari dari Bulan, Bulan, Hari dari Minggu
cron.schedule("*/5 * * * *", async () => {
  console.log("=== Memulai Sinkronisasi Otomatis (Cron Job) ===");

  const startTime = new Date();
  let recordsProcessed = 0;
  let status = "success";
  let errorMessage = null;

  try {
    // 1. Tempatkan logika sinkronisasi kamu di sini (misal fetch API eksternal)
    // Contoh dummy: Kita anggap berhasil memproses 5 data baru
    recordsProcessed = 5;

    console.log(`Sinkronisasi berhasil memproses ${recordsProcessed} data.`);
  } catch (error) {
    status = "failed";
    errorMessage = error.message;
    console.error("Cron job mengalami error:", errorMessage);
  } finally {
    // 2. Catat riwayat aktivitas ke tabel sync_logs secara otomatis
    try {
      const logText = `
        INSERT INTO sync_logs (sync_time, status, records_processed, error_message)
        VALUES ($1, $2, $3, $4)
      `;
      const logValues = [startTime, status, recordsProcessed, errorMessage];

      await pool.query(logText, logValues);
      console.log("Riwayat sinkronisasi telah disimpan ke database.");
    } catch (dbErr) {
      console.error("Gagal menyimpan log ke database:", dbErr.message);
    }
  }
});
