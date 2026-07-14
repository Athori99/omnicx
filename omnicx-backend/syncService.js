const axios = require("axios");
const pool = require("./db");

// Fungsi inti untuk mengambil data komplain eksternal dan memasukkannya ke database
const syncExternalTickets = async () => {
  console.log("🔄 Memulai proses sinkronisasi data dari API eksternal...");

  try {
    // Sebagai simulasi API eksternal, kita gunakan open API publik (Rick and Morty)
    // untuk menarik data entitas karakter eksternal yang akan dikonversi menjadi log tiket
    const response = await axios.get(
      "https://rickandmortyapi.com/api/character?page=1",
    );
    const externalData = response.data.results;

    let processedCount = 0;

    for (const item of externalData) {
      // Periksa apakah data external_customer_id ini sudah pernah disinkronisasi sebelumnya
      const checkExist = await pool.query(
        "SELECT id FROM tickets WHERE external_customer_id = $1",
        [item.id.toString()],
      );

      if (checkExist.rows.length === 0) {
        // Jika data belum ada, masukkan ke dalam database omnicx_db
        await pool.query(
          `INSERT INTO tickets (title, description, status, priority, external_customer_id, assigned_to) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            `Tiket Komplain dari ${item.name}`,
            `Kendala pada sistem eksternal dengan status karakter: ${item.status} dan spesies: ${item.species}`,
            "open",
            item.status === "Dead" ? "high" : "medium", // Logika bisnis otomatis penentuan prioritas
            item.id.toString(),
            1, // Secara otomatis ditugaskan ke user ID 1 (Alahidin Athori)
          ],
        );
        processedCount++;
      }
    }

    // Catat keberhasilan sinkronisasi ke dalam tabel sync_logs
    await pool.query(
      "INSERT INTO sync_logs (status, records_processed) VALUES ($1, $2)",
      ["SUCCESS", processedCount],
    );
    console.log(
      `✅ Sinkronisasi selesai! ${processedCount} tiket baru berhasil diproses.`,
    );
  } catch (error) {
    // Jika terjadi kegagalan/error API, catat detail log error-nya ke database untuk monitoring stabilitas
    console.error("❌ Terjadi kesalahan saat sinkronisasi:", error.message);
    await pool.query(
      "INSERT INTO sync_logs (status, error_message) VALUES ($1, $2)",
      ["FAILED", error.message],
    );
  }
};

module.exports = { syncExternalTickets };
