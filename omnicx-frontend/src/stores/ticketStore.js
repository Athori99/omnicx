import { defineStore } from 'pinia'
import axios from 'axios'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    stats: {
      open: 0,
      resolved: 0,
      closed: 0,
    },
    totalTickets: 0,
    isLoading: false,
    error: null,
  }),

  actions: {
    // Fungsi untuk memanggil API statistik tiket dari backend
    async fetchTicketStats() {
      this.isLoading = true
      this.error = null
      try {
        const response = await axios.get('http://localhost:5000/api/tickets/analytics/stats')
        if (response.data.status === 'success') {
          this.stats = response.data.data.summary
          this.totalTickets = response.data.data.total
        }
      } catch (err) {
        this.error = err.message || 'Gagal mengambil data statistik'
        console.error('❌ Error fetching stats:', err)
      } finally {
        this.isLoading = false
      }
    },
  },
})
