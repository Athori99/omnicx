const cron = require("node-cron");
const pool = require("pg"); // Sesuaikan path database kamu
const axios = require("axios");

// Jalankan otomatis setiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  console.log(
    "=== [CRON JOB] Memulai Sinkronisasi Real-Time dengan Rick and Morty API ===",
  );

  const startTime = new Date();
  let recordsProcessed = 0;
  let status = "success";
  let errorMessage = null;

  try {
    // 1. Ambil data dari API external
    const response = await axios.get(
      "https://rickandmortyapi.com/api/character",
    );
    const characters = response.data.results;

    // Ambil sampel 5 karakter pertama agar log tidak terlalu penuh dan beban database aman
    const sampleCharacters = characters.slice(0, 5);

    for (const char of sampleCharacters) {
      // Kita buat format judul dan deskripsi tiket berdasarkan data API
      const title = `Kendala Sistem: ${char.name}`;
      const description = `Kendala pada sistem eksternal dengan status karakter: ${char.status} dan spesies: ${char.species}`;
      const ticketStatus = "open";

      // 2. Cek apakah tiket dengan judul/nama ini sudah pernah disinkronkan sebelumnya
      // Ini mencegah database kamu penuh dengan data duplikat setiap 5 menit
      const checkExist = await pool.query(
        "SELECT id FROM tickets WHERE title = $1",
        [title],
      );

      if (checkExist.rows.length === 0) {
        // Jika belum ada, masukkan sebagai tiket baru
        const insertQuery = `
          INSERT INTO tickets (title, description, status) 
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertQuery, [title, description, ticketStatus]);
        recordsProcessed++;
      }
    }

    console.log(
      `[CRON JOB] Sinkronisasi selesai. Berhasil menambahkan ${recordsProcessed} tiket baru.`,
    );
  } catch (error) {
    status = "failed";
    errorMessage = error.message;
    console.error(
      "[CRON JOB] Terjadi error saat sinkronisasi API:",
      errorMessage,
    );
  } finally {
    // 3. Catat riwayat aktivitas ke tabel sync_logs secara otomatis
    try {
      const logText = `
        INSERT INTO sync_logs (sync_time, status, records_processed, error_message)
        VALUES ($1, $2, $3, $4)
      `;
      const logValues = [startTime, status, recordsProcessed, errorMessage];

      await pool.query(logText, logValues);
      console.log(
        "[CRON JOB] Riwayat sinkronisasi telah sukses dicatat ke tabel sync_logs.",
      );
    } catch (dbErr) {
      console.error(
        "[CRON JOB] Gagal mencatat log ke database:",
        dbErr.message,
      );
    }
  }
});
