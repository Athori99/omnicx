<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Dashboard Analitik & Manajemen Tiket</h1>
      <p>Memantau performa dan mengelola resolusi tiket secara real-time</p>
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

    <!-- Konten Utama -->
    <div v-else>
      <!-- Rangkuman Statistik -->
      <div class="stats-grid">
        <div class="stat-card total">
          <h3>Total Tiket</h3>
          <p class="stat-number">{{ ticketStore.totalTickets }}</p>
        </div>
        <div class="stat-card open">
          <h3>Tiket Open</h3>
          <p class="stat-number">{{ ticketStore.stats.open }}</p>
        </div>
        <div class="stat-card resolved">
          <h3>Tiket Resolved</h3>
          <p class="stat-number">{{ ticketStore.stats.resolved }}</p>
        </div>
        <div class="stat-card closed">
          <h3>Tiket Closed</h3>
          <p class="stat-number">{{ ticketStore.stats.closed }}</p>
        </div>
      </div>

      <!-- Grid Visualisasi & Form Tambah -->
      <div class="main-content-grid">
        <!-- Seksi Grafik -->
        <div class="content-section chart-box">
          <h3>Visualisasi Status Tiket</h3>
          <div class="chart-wrapper">
            <Bar
              v-if="chartData.datasets[0].data.some((val) => val > 0)"
              :data="chartData"
              :options="chartOptions"
            />
            <p v-else class="no-data">Belum ada data grafik.</p>
          </div>
        </div>

        <!-- Form Tambah Tiket Baru (Create) -->
        <div class="content-section form-box">
          <h3>Buat Tiket Baru</h3>
          <form @submit.prevent="handleCreateTicket">
            <div class="form-group">
              <label>Judul Masalah</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Contoh: Bug Login Server"
                required
              />
            </div>
            <div class="form-group">
              <label>Deskripsi Detail</label>
              <textarea
                v-model="form.description"
                placeholder="Jelaskan masalah secara singkat..."
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label>Status Awal</label>
              <select v-model="form.status">
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Simpan Tiket</button>
          </form>
        </div>
      </div>

      <!-- SEKSI CRUD TABEL (Read, Update, Delete) -->
      <div class="content-section table-section">
        <h3>Daftar Data Tiket Masuk</h3>
        <div class="table-responsive">
          <table class="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Judul</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <!-- Pastikan di ticketStore kamu punya array tickets -->
              <tr v-for="ticket in ticketStore.tickets" :key="ticket.id">
                <td>#{{ ticket.id }}</td>
                <td class="bold-text">{{ ticket.title }}</td>
                <td>{{ ticket.description }}</td>
                <td>
                  <span :class="['status-badge', ticket.status]">{{
                    ticket.status.toUpperCase()
                  }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <!-- Update Status Cepat -->
                    <select
                      :value="ticket.status"
                      @change="handleUpdateStatus(ticket.id, $event.target.value)"
                      class="status-select"
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <!-- Hapus Tiket -->
                    <button @click="handleDeleteTicket(ticket.id)" class="btn btn-danger">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!ticketStore.tickets || ticketStore.tickets.length === 0">
                <td colspan="5" class="text-center">Tidak ada data tiket terdaftar di database.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useTicketStore } from '../stores/ticketStore'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const ticketStore = useTicketStore()

// State Form Data
const form = ref({
  title: '',
  description: '',
  status: 'open',
})

// Panggil data statistik dan list tiket saat komponen terpasang
onMounted(() => {
  ticketStore.fetchTicketStats()
  if (typeof ticketStore.fetchTickets === 'function') {
    ticketStore.fetchTickets() // Mengambil seluruh list untuk CRUD tabel
  }
})

// Handler Membuat Tiket Baru
const handleCreateTicket = async () => {
  if (typeof ticketStore.createTicket === 'function') {
    await ticketStore.createTicket(form.value)
    // Reset Form jika berhasil
    form.value = { title: '', description: '', status: 'open' }
  } else {
    alert('Fungsi createTicket belum didefinisikan di Pinia Store kamu!')
  }
}

// Handler Mengubah Status Tiket
const handleUpdateStatus = async (id, newStatus) => {
  if (typeof ticketStore.updateTicketStatus === 'function') {
    await ticketStore.updateTicketStatus(id, newStatus)
  }
}

// Handler Menghapus Tiket
const handleDeleteTicket = async (id) => {
  if (confirm('Apakah kamu yakin ingin menghapus tiket ini?')) {
    if (typeof ticketStore.deleteTicket === 'function') {
      await ticketStore.deleteTicket(id)
    }
  }
}

// Format Data Grafik
const chartData = computed(() => ({
  labels: ['Open', 'Resolved', 'Closed'],
  datasets: [
    {
      label: 'Jumlah Tiket',
      backgroundColor: ['#e67e22', '#2ecc71', '#95a5a6'],
      data: [ticketStore.stats.open, ticketStore.stats.resolved, ticketStore.stats.closed],
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
}))
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
}

.dashboard-header {
  margin-bottom: 2rem;
}
.dashboard-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}
.dashboard-header p {
  color: #7f8c8d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 6px solid #ccc;
}
.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
}
.stat-card.total {
  border-left-color: #3498db;
}
.stat-card.open {
  border-left-color: #e67e22;
}
.stat-card.resolved {
  border-left-color: #2ecc71;
}
.stat-card.closed {
  border-left-color: #95a5a6;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (max-width: 768px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
}

.content-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chart-wrapper {
  position: relative;
  height: 260px;
  width: 100%;
}

/* Form Styles */
.form-group {
  margin-bottom: 1rem;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  box-sizing: border-box;
}

/* Button Styles */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary {
  background: #3498db;
  color: white;
  width: 100%;
}
.btn-danger {
  background: #e74c3c;
  color: white;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
}

/* Table Styles */
.table-section {
  margin-top: 2rem;
}
.table-responsive {
  overflow-x: auto;
}
.ticket-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  text-align: left;
}
.ticket-table th,
.ticket-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.ticket-table th {
  background-color: #f1f2f6;
  color: #2c3e50;
}
.bold-text {
  font-weight: 600;
}

/* Badge Styles */
.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}
.status-badge.open {
  background: #ffeaa7;
  color: #d63031;
}
.status-badge.resolved {
  background: #badc58;
  color: #6ab04c;
}
.status-badge.closed {
  background: #dcdde1;
  color: #2f3640;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.status-select {
  padding: 0.3rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.text-center {
  text-align: center;
  color: #7f8c8d;
}
</style>
