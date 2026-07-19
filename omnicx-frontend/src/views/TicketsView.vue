<template>
  <div class="tickets-container">
    <h2>Manajemen Operasional Tiket (CRUD)</h2>

    <!-- Form Tambah Tiket (CREATE) -->
    <div class="form-section">
      <h3>Buat Tiket Baru</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Judul Tiket</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Masukkan judul kendala..."
            required
          />
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea
            v-model="form.description"
            placeholder="Jelaskan detail kendala secara rinci..."
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
        <button type="submit" class="btn-submit">Simpan Tiket</button>
      </form>
    </div>

    <!-- Tabel Daftar Tiket (READ & UPDATE) -->
    <div class="table-section">
      <h3>Daftar Kendala Aktif</h3>
      <div v-if="ticketStore.isLoading" class="loading">Memuat data tiket...</div>

      <table v-else class="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul Tiket</th>
            <th>Deskripsi</th>
            <th>Status</th>
            <th>Aksi Perubahan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in ticketStore.tickets" :key="ticket.id">
            <td>{{ ticket.id }}</td>
            <td>
              <strong>{{ ticket.title }}</strong>
            </td>
            <td>{{ ticket.description || '-' }}</td>
            <td>
              <span :class="['status-badge', ticket.status]">{{
                ticket.status.toUpperCase()
              }}</span>
            </td>
            <td>
              <!-- Tombol Cepat Ubah Status (UPDATE) -->
              <button
                v-if="ticket.status !== 'resolved'"
                @click="changeStatus(ticket.id, 'resolved')"
                class="btn-action resolve"
              >
                Resolve
              </button>
              <button
                v-if="ticket.status !== 'closed'"
                @click="changeStatus(ticket.id, 'closed')"
                class="btn-action close-btn"
              >
                Close
              </button>
            </td>
          </tr>
          <tr v-if="ticketStore.tickets.length === 0">
            <td colspan="5" style="text-align: center; color: #95a5a6">
              Belum ada data tiket di database.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTicketStore } from '../stores/ticketStore'

const ticketStore = useTicketStore()

// State untuk menampung inputan form
const form = ref({
  title: '',
  description: '',
  status: 'open',
})

// Ambil data tiket saat komponen dimuat
onMounted(() => {
  ticketStore.fetchAllTickets()
})

// Handler memproses submit data baru (Create)
const handleSubmit = async () => {
  await ticketStore.createTicket({ ...form.value })
  // Reset form setelah berhasil
  form.value.title = ''
  form.value.description = ''
  form.value.status = 'open'
  alert('Tiket baru berhasil ditambahkan!')
}

// Handler mengubah status tiket (Update)
const changeStatus = async (id, status) => {
  await ticketStore.updateTicketStatus(id, status)
}
</script>

<style scoped>
.tickets-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', sans-serif;
}
.form-section,
.table-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn-submit {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
.ticket-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.ticket-table th,
.ticket-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}
.ticket-table th {
  background-color: #f8f9fa;
  color: #2c3e50;
}
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-badge.open {
  background: #ffeaa7;
  color: #d63031;
}
.status-badge.resolved {
  background: #cbf3d2;
  color: #2ecc71;
}
.status-badge.closed {
  background: #dfe6e9;
  color: #636e72;
}
.btn-action {
  padding: 0.3rem 0.6rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.btn-action.resolve {
  background: #2ecc71;
}
.btn-action.close-btn {
  background: #95a5a6;
}
.loading {
  text-align: center;
  padding: 1rem;
}
</style>
