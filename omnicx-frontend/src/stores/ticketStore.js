import { defineStore } from 'pinia'
import axios from 'axios'

// Pastikan base URL menunjuk ke port backend Node.js kamu (misal port 5000)
const API_URL = 'http://localhost:5000/api/tickets'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    tickets: [],
    stats: { open: 0, resolved: 0, closed: 0 },
    isLoading: false,
    error: null,
  }),

  getters: {
    totalTickets(state) {
      return state.stats.open + state.stats.resolved + state.stats.closed
    },
  },

  actions: {
    // 1. Ambil Semua Data Tiket untuk Tabel
    async fetchTickets() {
      this.isLoading = true
      try {
        const response = await axios.get(API_URL)
        this.tickets = response.data
      } catch (err) {
        this.error = 'Gagal mengambil daftar tiket dari server.'
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },
    async updateTicketStatus(ticketId, newStatus) {
      try {
        const response = await axios.put(`${API_URL}/${ticketId}/status`, { status: newStatus })

        await this.fetchTickets()
        if (typeof this.fetchTicketStats === 'function') {
          await this.fetchTicketStats()
        }

        return response.data
      } catch (err) {
        // Tambahkan baris ini untuk melihat detail penolakan dari server
        console.error(
          'Detail error saat UPDATE status:',
          err.response ? err.response.data : err.message,
        )
        alert('Gagal memperbarui status tiket.')
        throw err
      }
    },

    // 2. Ambil Data Statistik Tiket untuk Grafik
    async fetchTicketStats() {
      try {
        const response = await axios.get(`${API_URL}/stats`)
        this.stats = response.data
      } catch (err) {
        console.error('Gagal mengambil statistik tiket:', err)
      }
    },

    // 3. Tambah Tiket Baru (CREATE)
    async createTicket(ticketData) {
      try {
        // 1. Kirim data ke backend dan tampung hasil responsnya
        const response = await axios.post(API_URL, ticketData)
        // 2. Lakukan sinkronisasi ulang data secara aman
        if (typeof this.fetchTickets === 'function') {
          await this.fetchTickets()
        }

        if (typeof this.fetchTicketStats === 'function') {
          await this.fetchTicketStats()
        }

        // Kembalikan data respons sukses ke komponen Vue
        return response.data
      } catch (err) {
        // Cetak error asli dari Axios di console browser untuk melihat respons PostgreSQL
        console.error(
          'Detail error dari server saat POST:',
          err.response ? err.response.data : err.message,
        )

        // Tetap pertahankan alert bawaan kamu untuk UI
        alert('Gagal menyimpan tiket baru ke server.')
        throw err
      }
    },
    // 4. Hapus Tiket (DELETE)
    async deleteTicket(id) {
      try {
        await axios.delete(`${API_URL}/${id}`)

        // PENTING: Panggil ulang data agar baris tabel yang dihapus langsung hilang
        await this.fetchTickets()
        await this.fetchTicketStats()
      } catch (err) {
        console.error(err)
        alert('Gagal menghapus tiket dari server.')
      }
    },

    // 5. Update Status Tiket via Dropdown Cepat (UPDATE)
    async updateTicketStatus(ticketId, newStatus) {
      try {
        // Pastikan URL-nya bersih terbentuk menjadi /api/tickets/26/status
        const response = await axios.put(`${API_URL}/${ticketId}/status`, { status: newStatus })

        await this.fetchTickets()
        if (typeof this.fetchTicketStats === 'function') {
          await this.fetchTicketStats()
        }

        return response.data
      } catch (err) {
        console.error(
          'Detail error saat UPDATE status:',
          err.response ? err.response.data : err.message,
        )
        alert('Gagal memperbarui status tiket.')
        throw err
      }
    },
  },
})
