<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Dashboard Analitik Tiket</h1>
      <p>Memantau performa penyelesaian tiket secara real-time</p>
    </header>

    <!-- State Loading -->
    <div v-if="ticketStore.isLoading" class="loading-state">
      <p>Mengambil data dari server...</p>
    </div>

    <!-- State Error -->
    <div v-else-if="ticketStore.error" class="error-state">
      <p>⚠️ {{ ticketStore.error }}</p>
      <button @click="ticketStore.fetchTicketStats()">Coba Lagi</button>
    </div>

    <!-- Konten Utama Statistik -->
    <div v-else class="stats-grid">
      <!-- Card Total Tiket -->
      <div class="stat-card total">
        <h3>Total Tiket</h3>
        <p class="stat-number">{{ ticketStore.totalTickets }}</p>
      </div>

      <!-- Card Tiket Open -->
      <div class="stat-card open">
        <h3>Tiket Open</h3>
        <p class="stat-number">{{ ticketStore.stats.open }}</p>
      </div>

      <!-- Card Tiket Resolved -->
      <div class="stat-card resolved">
        <h3>Tiket Resolved</h3>
        <p class="stat-number">{{ ticketStore.stats.resolved }}</p>
      </div>

      <!-- Card Tiket Closed -->
      <div class="stat-card closed">
        <h3>Tiket Closed</h3>
        <p class="stat-number">{{ ticketStore.stats.closed }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTicketStore } from '../stores/ticketStore'

// Inisialisasi Pinia Store
const ticketStore = useTicketStore()

// Panggil API saat halaman pertama kali dimuat
onMounted(() => {
  ticketStore.fetchTicketStats()
})
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.dashboard-header p {
  color: #7f8c8d;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 6px solid #ccc;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
}

/* Kustomisasi warna border tiap card */
.stat-card.total {
  border-left-color: #3498db;
} /* Biru */
.stat-card.open {
  border-left-color: #e67e22;
} /* Oranye */
.stat-card.resolved {
  border-left-color: #2ecc71;
} /* Hijau */
.stat-card.closed {
  border-left-color: #95a5a6;
} /* Abu-abu */

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.error-state button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
