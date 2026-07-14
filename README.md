# OmniCX - Integrated Ticketing Platform & Real-Time API Synchronization

OmniCX is a robust, production-ready Node.js backend engine designed to integrate, automate, and synchronize complaint ticketing data from external REST APIs into a local PostgreSQL database in real-time. Built with software architecture best practices in mind, this engine enforces _Data Idempotency_ to prevent duplication, features _Automated Business Logic_ for dynamic ticket prioritization, and implements an audit-ready _Logging & Fault Tolerance System_ to monitor integration stability.

---

# 🚀 Key Features

- _Automated Sync Service_: Asynchronous, non-blocking data fetching from third-party REST APIs utilizing `Axios` and Node.js async/await patterns.
- _Data Idempotency Engine_: Intelligent duplication-check pipeline that validates external records before insertion, ensuring a clean and optimal database state.
- _Dynamic Business Rule Logic_: Automated assessment of incoming payload metadata to dynamically assign ticket priority tiers (`high`, `medium`, `low`) at database level.
- _Fail-Safe Logging & Audit Trail_: Graceful error handling (`try-catch` blocks) coupled with transaction-level logging to the `sync_logs` table for proactive system monitoring.

---

# 🛠️ Tech Stack & Architecture

| Technology             | Purpose                                                       |
| :--------------------- | :------------------------------------------------------------ |
| _Node.js_              | Backend Runtime Environment                                   |
| _Express.js_           | REST API Routing & Controller Framework                       |
| _PostgreSQL_           | Relational Database Management System (RDBMS)                 |
| _node-postgres (`pg`)_ | High-performance, pure JavaScript client for PostgreSQL       |
| _Axios_                | Promise-based HTTP client for external API consumption        |
| _Dotenv_               | Secure Environment Variables Manager (Security Best Practice) |
| _Nodemon_              | Hot-reloading development utility                             |

---

# 📂 Project Structure

````text
omnicx/
├── omnicx-backend/
│   ├── db.js           # Database Connection Pool Configuration
│   ├── index.js        # Server Entry Point & Lifecycle Orchestrator
│   ├── syncService.js  # Main Core Sync Service Engine
│   ├── schema.sql      # Database Blueprint / Data Definition Language (DDL)
│   ├── package.json    # Application Manifest & Dependencies List
│   └── .env            # Environment Configuration (Local Only - gitignored)
├── .gitignore          # Repository Exclusion Boundaries
└── README.md           # Master Documentation File

## ⚙️ Cara Menjalankan di Komputer Lokal

### 1. Kloning & Instalasi Dependensi
```bash
git clone [https://github.com/Athori99/omnicx.git](https://github.com/Athori99/omnicx.git)
cd omnicx/omnicx-backend
npm install

2. Konfigurasi Environment (.env)
Buat file bernama .env di dalam folder omnicx-backend, lalu isi dengan kredensial database

Cuplikan kode
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password_postgresql_anda
DB_DATABASE=omnicx_db

3. Inisialisasi Database
Jalankan perintah SQL yang ada di dalam file schema.sql pada pgAdmin Anda untuk membuat tabel tickets dan sync_logs.

4. Jalankan Server
npx nodemon index.js

5.Verify Execution
🚀 Server Backend berjalan di http://localhost:5000
✅ Berhasil terhubung ke database PostgreSQL (omnicx_db)
🔄 Memulai proses sinkronisasi data dari API eksternal...
✅ Sinkronisasi selesai! 20 tiket baru berhasil diproses.
````
