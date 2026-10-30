# Panduan Belajar Mandiri — Aplikasi Manajemen Tugas Pribadi

**Catatan perjalanan belajar dari aplikasi React lokal hingga CRUD yang terhubung ke Supabase melalui Prisma ORM**  
**Tanggal pembaruan:** 30 Oktober 2026  
**Bahasa:** Indonesia  
**Tujuan:** menjadi bahan belajar mandiri yang dapat dibaca ulang sambil membuka proyek di Antigravity.

---

## Cara menggunakan catatan ini

Baca berurutan. Jangan menyalin semua kode sekaligus tanpa memahami bagian yang sedang dipelajari. Untuk setiap perubahan, biasakan melakukan empat hal:

1. **Pahami tujuan:** perubahan apa yang ingin dibuat?
2. **Temukan file:** file mana yang bertanggung jawab atas pekerjaan itu?
3. **Ubah sedikit demi sedikit:** jangan mengganti banyak fungsi sekaligus.
4. **Uji dan amati:** jalankan pemeriksaan TypeScript, uji melalui browser atau `curl`, lalu periksa hasilnya di Supabase.

> **Aturan aman:** jangan menjalankan `prisma migrate reset` pada database yang berisi data penting. Jangan mengirim isi `.env`, `DATABASE_URL`, password, atau hash password ke orang lain atau ke chat. Jangan menaruh kredensial database di kode browser.

## Daftar isi

1. Gambaran proyek dan hasil yang telah dicapai
2. Teknologi yang digunakan dan fungsi masing-masing
3. Istilah dasar database
4. Struktur folder proyek
5. Model database User dan Task
6. Konfigurasi lingkungan dan koneksi Supabase
7. Prisma ORM v7 dan Prisma Client
8. React: Client Component, state, dan effect
9. HTTP, API, endpoint, request, dan response
10. GET, POST, PATCH, DELETE, serta kode status
11. Alur lengkap sistem dari browser sampai database
12. Penjelasan operasi CRUD pada proyek
13. Skrip pengguna uji dan tugas uji
14. Perintah terminal yang perlu dikuasai
15. Error yang pernah ditemukan dan cara mendiagnosisnya
16. Keamanan dan pekerjaan yang belum selesai
17. Peta belajar berikutnya dan latihan mandiri
18. Glosarium istilah
19. Referensi resmi

---

# 1. Gambaran proyek dan hasil yang telah dicapai

## 1.1 Apa yang sedang dibuat?

Proyek ini adalah **aplikasi Manajemen Tugas Pribadi**. Pengguna dapat mencatat kegiatan atau pekerjaan, melihat daftar tugas, mengubah judul, menandai tugas selesai atau belum selesai, dan menghapus tugas.

Pada awal latihan, dashboard menggunakan data contoh yang disimpan di React state. Data itu hanya berada di memori aplikasi browser. Setelah halaman dimuat ulang, state dibuat ulang sehingga perubahan yang belum dikirim ke database dapat hilang.

Kemudian proyek dihubungkan ke Supabase PostgreSQL menggunakan Prisma ORM. Sekarang data tugas dapat disimpan sebagai record database dan dibaca kembali setelah refresh.

## 1.2 Status yang sudah berhasil diuji

Berdasarkan hasil uji yang dilaporkan selama pembelajaran:

| Bagian | Hasil | Bukti pengujian yang pernah dilakukan |
|---|---|---|
| Koneksi PostgreSQL Supabase | Berhasil | Skrip/tes Node dapat terhubung dan query database berjalan |
| Validasi Prisma schema | Berhasil | `npx prisma validate` menampilkan schema valid |
| Prisma Client | Berhasil dibuat | `npx prisma generate` menghasilkan client di `generated/prisma` |
| Pengguna uji | Berhasil dibuat | Skrip menghasilkan ID pengguna dan email uji |
| Tugas uji | Berhasil dibuat | `prisma.task.create()` mengembalikan data tugas |
| API GET | Berhasil | `curl` menerima `200 OK` dan array tugas |
| API POST | Berhasil | `curl` menerima `201 Created` dan tugas baru |
| API PATCH judul | Berhasil | `curl` menerima `200 OK` dan judul berubah |
| API DELETE | Berhasil | Pengujian penghapusan dan pemeriksaan Supabase berhasil menurut pengguna |
| Dashboard membaca database | Berhasil | Dua tugas dari Supabase tampil di dashboard utama |
| Tambah dari dashboard | Berhasil | Tugas tetap ada setelah browser di-refresh |
| Edit dari dashboard | Berhasil | Judul baru tetap ada setelah refresh |
| Hapus dari dashboard | Berhasil | Record terhapus dan tidak muncul lagi setelah refresh |
| Centang selesai | Berhasil | Status tetap berubah setelah refresh dan nilai `completed` tersimpan |

**Catatan:** status di atas adalah riwayat hasil yang telah dilaporkan. Sebelum rilis atau demo, jalankan kembali seluruh pengujian karena kode mungkin berubah setelah catatan ini dibuat.

## 1.3 Apa yang belum dianggap selesai?

Aplikasi ini belum siap digunakan oleh banyak pengguna secara publik. API saat latihan masih menggunakan satu email pengguna uji dari `.env` (`TEST_USER_EMAIL`) dan pemeriksaan `NODE_ENV === "development"`. Ini cocok untuk latihan lokal, bukan sistem autentikasi produksi.

Pekerjaan yang masih perlu dilakukan sebelum publikasi antara lain:

- Register dan login pengguna sungguhan.
- Sesi atau token autentikasi yang aman.
- Mengambil identitas pemilik tugas dari sesi login, bukan dari satu variabel pengguna uji.
- Pemeriksaan izin pada setiap operasi baca, tambah, edit, centang, dan hapus.
- Meninjau hak akses database, kebijakan Row Level Security (RLS) Supabase, dan pemisahan kredensial development/production.
- Menguji validasi, penanganan error, dan skenario dua pengguna.

---

# 2. Teknologi yang digunakan dan fungsi masing-masing

Bayangkan aplikasi seperti sebuah kantor:

- **Next.js** adalah bangunan aplikasi: mengatur halaman dan endpoint server.
- **React** adalah bagian antarmuka: tombol, input, daftar, dan tampilan yang berubah.
- **TypeScript** adalah pemeriksa tipe: membantu menemukan kesalahan bentuk data sebelum program dijalankan.
- **Prisma ORM** adalah penerjemah/alat kerja database: kode seperti `prisma.task.findMany()` diterjemahkan menjadi query database.
- **Supabase PostgreSQL** adalah tempat penyimpanan data permanen.
- **Node.js** adalah lingkungan yang menjalankan JavaScript/TypeScript di komputer atau server.

## 2.1 Ringkasan teknologi dan paket

| Teknologi/paket | Fungsi dalam proyek | Contoh penggunaan |
|---|---|---|
| Next.js 16 | Framework web berbasis React; menyediakan App Router dan Route Handlers | `src/app/page.tsx`, `src/app/api/tasks/route.ts` |
| React | Membuat antarmuka dan menangani interaksi | `useState`, `useEffect`, `onClick`, `onChange` |
| TypeScript | Menentukan dan memeriksa tipe data | `type Task`, `number`, `string`, `boolean` |
| Supabase | Layanan yang menyediakan PostgreSQL terkelola | Table Editor, SQL Editor, Connect |
| PostgreSQL | Sistem database relasional tempat tabel User dan Task berada | Tabel `User`, `Task` |
| Prisma ORM | Menghubungkan kode aplikasi dengan database lewat model dan query | `prisma.task.create()` |
| `prisma` (CLI) | Perintah terminal untuk validasi, generate, status, dan migrasi | `npx prisma validate` |
| `@prisma/client` dan client hasil generate | API Prisma yang dipakai kode aplikasi | `new PrismaClient({ adapter })` |
| `@prisma/adapter-pg` | Adapter Prisma v7 untuk driver PostgreSQL | `new PrismaPg({ connectionString })` |
| `pg` | Driver Node.js PostgreSQL yang digunakan adapter | Koneksi melalui adapter `PrismaPg` |
| `dotenv` | Memuat nilai dari `.env` ke `process.env` pada skrip Node | `import "dotenv/config"` |
| `bcryptjs` | Mengubah password menjadi hash sebelum disimpan | `await bcrypt.hash(password, 12)` |
| `tsx` | Menjalankan file TypeScript langsung dari terminal | `npx tsx scripts/create-test-user.ts` |
| `curl` | Mengirim request HTTP dari terminal untuk menguji API | `curl -i http://localhost:3000/api/tasks` |
| Tailwind CSS | Utility CSS untuk mengatur tampilan jika sudah dikonfigurasi proyek | `className="rounded-xl p-4"` |

### Jangan tertukar: Supabase, PostgreSQL, dan Prisma

- **PostgreSQL** adalah mesin database.
- **Supabase** menyediakan/menjalankan PostgreSQL beserta dashboard dan fitur tambahan.
- **Prisma** adalah ORM yang digunakan kode server untuk membaca dan mengubah data PostgreSQL.

Prisma bukan tempat data disimpan. Data tetap berada di database PostgreSQL milik proyek Supabase.

---

# 3. Istilah dasar database

## 3.1 Database

Database adalah kumpulan data yang disimpan dan dikelola secara terstruktur. Dalam proyek ini, database PostgreSQL berada di Supabase.

## 3.2 Tabel (table)

Tabel adalah tempat menyimpan kumpulan record dengan jenis data yang serupa. Contoh: tabel `User` menyimpan akun, sedangkan tabel `Task` menyimpan tugas.

## 3.3 Baris / record / row

Satu baris adalah satu data. Satu akun adalah satu record di `User`. Satu tugas adalah satu record di `Task`.

## 3.4 Kolom / field

Kolom adalah atribut yang dimiliki setiap record. Contoh tabel `Task` memiliki kolom `title`, `category`, dan `completed`.

## 3.5 Primary key (`id`)

Primary key adalah identitas unik untuk membedakan satu record dari record lain. Pada model kita, `id` menjadi primary key dan nilainya dibuat otomatis dengan `autoincrement()`.

Contoh:

| id | title |
|---:|---|
| 1 | Belajar Prisma |
| 2 | Mengerjakan laporan |

ID 1 dan 2 menunjukkan dua record yang berbeda.

## 3.6 Foreign key (`userId`)

Foreign key adalah kolom yang merujuk ke primary key pada tabel lain. Di tabel `Task`, `userId` menghubungkan tugas ke `User.id`.

Contoh:

| Task.id | Task.title | Task.userId |
|---:|---|---:|
| 1 | Belajar Prisma | 1 |
| 2 | Mengerjakan laporan | 1 |

Kedua tugas tersebut dimiliki pengguna dengan ID 1.

## 3.7 Relasi one-to-many

Satu pengguna dapat mempunyai banyak tugas. Ini disebut relasi **one-to-many** (satu ke banyak).

- Satu `User` dapat terhubung ke banyak `Task`.
- Satu `Task` pada rancangan ini mempunyai satu pemilik `User`.

## 3.8 Unique

`@unique` memastikan nilai suatu kolom tidak boleh sama pada lebih dari satu record. Email pengguna dibuat unik supaya satu email tidak dapat digunakan untuk dua akun.

## 3.9 Index

Index membantu database menemukan data dengan lebih efisien untuk pola pencarian tertentu. Model `Task` memiliki index gabungan pada `userId` dan `createdAt`.

## 3.10 Nullable dan optional

Dalam Prisma, `String?` berarti kolom string boleh bernilai `null`. Pada model kita, `description String?` berarti deskripsi tugas boleh dikosongkan.

---

# 4. Struktur folder proyek

Folder penting yang telah kita gunakan:

```text
manajemen-tugas/
├── prisma/
│   ├── schema.prisma          # Definisi model User dan Task
│   └── migrations/            # Riwayat migrasi (perlu diperiksa/dirapikan)
│
├── generated/
│   └── prisma/                # Prisma Client hasil generate
│       └── client.ts
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Dashboard utama
│   │   ├── db-check/
│   │   │   └── page.tsx       # Halaman latihan membaca database
│   │   └── api/
│   │       └── tasks/
│   │           └── route.ts   # API GET, POST, PATCH, DELETE
│   │
│   └── lib/
│       └── prisma.ts          # Satu instance Prisma untuk server
│
├── scripts/
│   ├── create-test-user.ts    # Membuat pengguna uji
│   └── create-test-task.ts    # Membuat tugas uji
│
├── prisma7.config.ts          # Konfigurasi Prisma CLI v7
├── .env                       # URL database dan variabel lokal (rahasia)
├── .gitignore                 # Menghindari file sensitif masuk Git
├── package.json               # Daftar dependensi dan script proyek
└── tsconfig.json              # Konfigurasi TypeScript
```

## 4.1 Tanggung jawab tiap file

### `src/app/page.tsx`

Ini adalah dashboard utama. File ini menggunakan `"use client"` karena membutuhkan interaksi browser seperti klik tombol, input, React state, dan `useEffect`.

Tugas file ini:

- Mengelola nilai input judul tugas.
- Menampilkan daftar tugas.
- Menampilkan ringkasan total tugas, selesai, dan belum selesai.
- Mengirim request ke `/api/tasks` dengan `fetch()`.
- Memperbarui tampilan setelah server berhasil mengubah data.

File ini **tidak boleh mengimpor Prisma Client atau menjalankan query database secara langsung**, karena merupakan Client Component.

### `src/app/api/tasks/route.ts`

Ini adalah API server (Next.js Route Handler). Di sinilah kode server menerima request dari browser dan menggunakan Prisma.

Dalam satu file ini terdapat fungsi:

- `GET()` untuk membaca daftar tugas.
- `POST(request)` untuk membuat tugas.
- `PATCH(request)` untuk mengubah judul atau status tugas.
- `DELETE(request)` untuk menghapus tugas.

Next.js memilih fungsi yang sesuai berdasarkan HTTP method yang dikirimkan.

### `src/lib/prisma.ts`

File ini menyiapkan dan mengekspor Prisma Client yang dipakai Route Handler dan skrip server. Tujuannya agar seluruh bagian server menggunakan pola koneksi yang konsisten dan menghindari pembuatan banyak instance Prisma saat development.

### `prisma/schema.prisma`

File ini mendefinisikan model data dan relasi. Prisma Client dibuat berdasarkan model di file ini.

### `generated/prisma/`

Berisi kode client hasil `npx prisma generate`. Folder ini bukan database dan bukan tempat menyimpan record pengguna/tugas.

### `src/app/db-check/page.tsx`

Halaman pemeriksaan untuk membaca dan menampilkan tugas dari database. Halaman ini dibuat sebagai alat belajar, bukan dashboard utama. Setelah kebutuhan latihan selesai, halaman diagnostik sebaiknya dibatasi aksesnya atau dihapus sebelum aplikasi publik.

---

# 5. Model database User dan Task

Rancangan model yang kita pelajari berbentuk seperti berikut. Cocokkan dengan isi aktual `prisma/schema.prisma` bila ada perubahan dari versi yang pernah dibuat.

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tasks Task[]
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  category    String   @default("Pribadi")
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

## 5.1 Penjelasan model User

| Field | Makna |
|---|---|
| `id` | ID unik akun, otomatis bertambah |
| `name` | Nama yang ditampilkan |
| `email` | Email unik untuk mengenali akun/login |
| `passwordHash` | Hash password, bukan password asli |
| `createdAt` | Waktu record dibuat |
| `updatedAt` | Waktu record terakhir diubah |
| `tasks` | Relasi ke daftar tugas milik user |

## 5.2 Penjelasan model Task

| Field | Makna |
|---|---|
| `id` | ID unik tugas |
| `title` | Judul tugas |
| `description` | Deskripsi tambahan; boleh kosong |
| `category` | Kategori tugas; default `Pribadi` |
| `completed` | Status tugas; `false` = belum selesai, `true` = selesai |
| `createdAt` | Waktu tugas dibuat |
| `updatedAt` | Waktu tugas terakhir diubah |
| `userId` | ID pemilik tugas (foreign key) |
| `user` | Relasi menuju satu record User |

## 5.3 Arti beberapa anotasi Prisma

- `@id`: menjadikan field sebagai primary key.
- `@default(autoincrement())`: membuat ID angka otomatis.
- `@unique`: nilai harus unik.
- `@default(now())`: nilai default waktu saat record dibuat.
- `@updatedAt`: Prisma mengatur waktu perubahan saat record diperbarui.
- `String?`: nilai boleh `null`.
- `@relation(fields: [userId], references: [id])`: `Task.userId` merujuk pada `User.id`.
- `onDelete: Cascade`: jika user dihapus, record Task terkait akan ikut terhapus menurut aturan foreign key. Gunakan dengan sadar karena efeknya luas.
- `@@index([userId, createdAt])`: index gabungan untuk pola query yang memfilter user dan mengurutkan tanggal.

---

# 6. Konfigurasi lingkungan dan koneksi Supabase

## 6.1 Apa itu `.env`?

`.env` adalah file lokal untuk menyimpan konfigurasi lingkungan, misalnya URL koneksi database dan kredensial akun uji. Nilai dibaca sebagai environment variable melalui `process.env`.

Contoh bentuk (nilai di bawah hanya placeholder, bukan kredensial nyata):

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
TEST_USER_NAME="Pengguna Uji"
TEST_USER_EMAIL="uji.tugas@example.com"
TEST_USER_PASSWORD="GANTI_DENGAN_PASSWORD_UJI_YANG_KUAT"
```

Jangan menaruh nilai rahasia asli dalam catatan, screenshot, GitHub, atau chat.

## 6.2 Apa itu `DATABASE_URL`?

`DATABASE_URL` adalah alamat koneksi yang memberi tahu driver database:

- protokol database (misalnya `postgresql://`),
- username,
- password,
- hostname server,
- port,
- nama database.

Untuk proyek ini, connection string disalin dari Supabase Dashboard melalui tombol **Connect**. Selama latihan, kita menggunakan Session Pooler sesuai konfigurasi proyek dan port yang diberikan dashboard. Jangan menyusun hostname sendiri karena nilai host dan username pooler harus disalin persis dari dashboard.

Supabase menyediakan beberapa tipe koneksi: direct, session pooler, dan transaction pooler. Pilihan yang tepat bergantung pada lingkungan dan kebutuhan aplikasi. Lihat dokumentasi resmi Supabase sebelum mengganti connection string.

## 6.3 Mengapa `.env` tidak boleh diunggah?

Karena di dalamnya ada informasi yang dapat membuka akses database atau akun uji. Pastikan `.env` tercantum di `.gitignore`. Jangan pernah memberi awalan `NEXT_PUBLIC_` pada `DATABASE_URL` atau password database. Prefix publik dapat membuat nilai tersedia untuk kode browser.

## 6.4 Mengapa `dotenv` diperlukan pada skrip?

Node.js tidak otomatis membaca file `.env` di semua cara menjalankan skrip. Pada skrip kita digunakan:

```typescript
import "dotenv/config";
```

Setelah itu, skrip dapat membaca nilai melalui `process.env.DATABASE_URL`, `process.env.TEST_USER_EMAIL`, dan seterusnya.

Next.js mempunyai mekanisme sendiri untuk memuat environment variable pada proses development. Namun setiap skrip mandiri yang dijalankan langsung melalui Node/tsx harus memastikan environment variable tersedia.

## 6.5 Koneksi gagal `ENOTFOUND`

Ketika koneksi menghasilkan `getaddrinfo ENOTFOUND ...`, umumnya hostname tidak bisa diterjemahkan DNS. Dalam pengalaman proyek ini, pemeriksaan URI memperlihatkan hostname tidak benar karena connection string sempat tersusun/tersalin keliru. Solusi yang digunakan adalah menyalin ulang URI Session Pooler langsung dari Supabase Connect, lalu memeriksa hostname, port, dan database tanpa menampilkan password.

**Jangan pernah menampilkan keseluruhan URI pada output terminal yang akan dibagikan.**

---

# 7. Prisma ORM v7 dan Prisma Client

## 7.1 Apa itu ORM?

ORM adalah singkatan dari Object-Relational Mapping. ORM membantu kode aplikasi bekerja dengan tabel relasional menggunakan model dan fungsi bahasa pemrograman.

Tanpa ORM, developer bisa menulis SQL secara manual, misalnya:

```sql
SELECT * FROM "Task";
```

Dengan Prisma, operasi serupa dapat ditulis:

```typescript
const tasks = await prisma.task.findMany();
```

Prisma membangun query SQL berdasarkan metode dan parameter yang diberikan.

## 7.2 Perbedaan Prisma CLI, Prisma Schema, dan Prisma Client

- **Prisma CLI (`npx prisma ...`)**: alat terminal untuk validasi, generate, status migrasi, dan migrasi.
- **Prisma Schema (`schema.prisma`)**: definisi model, field, tipe, dan relasi.
- **Prisma Client**: kode hasil generate yang dipakai aplikasi untuk query database.
- **Prisma Adapter (`@prisma/adapter-pg`)**: penghubung Prisma Client v7 dengan driver PostgreSQL.

## 7.3 Mengapa Prisma v7 menggunakan adapter?

Pada Prisma ORM v7, koneksi database melalui driver JavaScript menggunakan driver adapter. Dalam proyek ini kita menggunakan PostgreSQL adapter `PrismaPg`.

Gambaran kode koneksi di `src/lib/prisma.ts`:

```typescript
import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL belum diatur. Periksa file .env");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Penjelasan:

- `import "server-only"`: memberi penanda bahwa modul hanya boleh digunakan dari sisi server.
- `PrismaPg`: adapter PostgreSQL untuk Prisma.
- `PrismaClient`: API query yang dihasilkan Prisma.
- `connectionString`: alamat koneksi dari environment variable.
- `new PrismaClient({ adapter })`: membuat Prisma Client dengan adapter.
- `globalThis`: dipakai untuk memakai ulang instance selama development, mengurangi risiko pembuatan terlalu banyak connection pool akibat reload modul.

Prinsip penting: satu aplikasi sebaiknya tidak membuat instance Prisma baru untuk setiap klik atau setiap komponen. Gunakan satu modul Prisma server yang dipakai ulang.

## 7.4 Perintah Prisma yang sudah dipelajari

```bash
npx prisma validate
```
Memeriksa apakah schema dapat dibaca dan valid. Ini **tidak membuktikan database bisa diakses**.

```bash
npx prisma generate
```
Menghasilkan Prisma Client dari model schema. Ini **tidak membuat tabel database**.

```bash
npx prisma migrate dev --name init
```
Membuat dan menjalankan migrasi pengembangan. Perintah ini dapat mengubah database dan bisa meminta reset jika mendeteksi drift.

```bash
npx prisma migrate status
```
Melihat status riwayat migrasi.

### Peringatan tentang drift dan baseline

Pada tahap awal, tabel `User` dan `Task` sudah ada di Supabase, tetapi folder migrasi lokal tidak memiliki file migrasi ketika diperiksa. `prisma migrate dev` kemudian mendeteksi drift dan menawarkan reset. Kita **tidak menyetujui reset** karena dapat menghilangkan data.

Untuk database yang tabelnya sudah dibuat di luar riwayat migrasi lokal, tim biasanya perlu melakukan prosedur *baselining* setelah membandingkan schema aktual dengan `schema.prisma`. Jangan membuat baseline secara membabi buta. Pastikan semua tabel, kolom, tipe, index, default, dan foreign key cocok. Buat salinan/cadangan sebelum perubahan schema penting.

Setelah baseline dan migration history rapi, perubahan schema di masa depan dikelola melalui migration files, bukan mengedit tabel secara acak di dashboard.

---

# 8. React: Client Component, state, dan effect

## 8.1 Apa arti `"use client"`?

Di baris pertama `src/app/page.tsx` terdapat:

```typescript
"use client";
```

Ini menandai file sebagai entry point Client Component. Kita memerlukannya karena dashboard menggunakan state, event handler, dan `useEffect`.

Client Component sesuai untuk bagian UI yang membutuhkan interaksi browser. Prisma Client dan koneksi database tetap berada di server/API, bukan di Client Component.

## 8.2 Apa itu state?

State adalah data yang dikelola React dan memengaruhi tampilan. Contoh:

```typescript
const [newTaskTitle, setNewTaskTitle] = useState("");
```

- `newTaskTitle`: nilai state saat ini.
- `setNewTaskTitle`: fungsi untuk mengubah state.
- `useState("")`: nilai awalnya string kosong.

Ketika pengguna mengetik, `onChange` memanggil setter:

```tsx
<input
  value={newTaskTitle}
  onChange={(event) => setNewTaskTitle(event.target.value)}
/>
```

`value` membuat input dikendalikan oleh React. `onChange` membaca teks baru dan memperbarui state.

## 8.3 State bukan database

Perbedaan paling penting dalam proyek ini:

```typescript
setTasks((currentTasks) => [...currentTasks, newTask]);
```

Baris tersebut hanya memperbarui state React. Ia tidak otomatis menulis ke Supabase.

Sedangkan:

```typescript
await fetch("/api/tasks", {
  method: "POST",
  // body dan headers
});
```

Mengirim request ke server. Jika server menggunakan `prisma.task.create()`, barulah record ditambahkan ke database.

Setelah server berhasil menyimpan, dashboard dapat memanggil `setTasks()` untuk memperbarui tampilan. Jadi `setTasks()` masih berguna, tetapi bukan pengganti database.

## 8.4 Apa itu `useEffect`?

`useEffect` adalah React Hook untuk menyelaraskan komponen dengan sistem eksternal, misalnya jaringan/API. Pada proyek ini digunakan untuk mengambil data ketika dashboard dimuat.

Pola sederhana:

```typescript
useEffect(() => {
  async function loadTasks() {
    const response = await fetch("/api/tasks");
    const data = await response.json();
    setTasks(data);
  }

  void loadTasks();
}, []);
```

`[]` berarti effect tidak bergantung pada nilai props/state tertentu, sehingga dijalankan saat komponen dipasang. Dalam development, perilaku pemeriksaan React dapat menyebabkan setup/cleanup effect dijalankan lebih dari sekali; karena itu jangan berasumsi setiap effect hanya pernah dipanggil satu kali sepanjang proses development.

Pada implementasi proyek, effect juga mengelola `isLoading`, `loadError`, dan flag `cancelled` agar state tidak diperbarui setelah effect dibersihkan.

## 8.5 Apa itu `map()`?

`map()` mengubah setiap item array menjadi hasil baru. Dalam JSX:

```tsx
{tasks.map((task) => (
  <li key={task.id}>{task.title}</li>
))}
```

- `tasks`: array daftar tugas.
- `task`: satu item yang sedang diproses.
- `task.title`: judul tugas saat ini.
- `key={task.id}`: identitas stabil item bagi React.

`map()` tidak mengambil data dari database. Data harus diperoleh terlebih dahulu, misalnya dengan API GET.

## 8.6 `filter()`, `find()`, `length`, dan ternary

- `filter()`: menghasilkan array baru berisi item yang lolos kondisi.
- `find()`: mencari item pertama yang memenuhi kondisi.
- `length`: jumlah item dalam array.
- `condition ? A : B`: operator ternary; pilih A jika kondisi benar, B jika salah.
- `!value`: membalik boolean; `!false` menjadi `true`, `!true` menjadi `false`.

Contoh menghitung tugas selesai:

```typescript
const completedTasks = tasks.filter(
  (task) => task.completed
).length;
```

Contoh membalik status:

```typescript
const nextCompleted = !currentTask.completed;
```

---

# 9. HTTP, API, endpoint, request, dan response

## 9.1 Apa itu API?

API (Application Programming Interface) adalah cara bagi satu bagian perangkat lunak untuk meminta layanan atau data dari bagian lain melalui aturan yang disepakati.

Dalam proyek ini:

- Dashboard adalah pemanggil API.
- Next.js Route Handler adalah penerima dan pemroses request.
- Prisma menjalankan query database.
- Supabase PostgreSQL menyimpan data.

## 9.2 Apa itu endpoint?

Endpoint adalah alamat yang menerima request. Pada proyek ini:

```text
http://localhost:3000/api/tasks
```

Bagian `/api/tasks` adalah path endpoint. Endpoint yang sama dapat melayani beberapa HTTP method, contohnya GET, POST, PATCH, dan DELETE.

## 9.3 Apa itu request?

Request adalah permintaan dari client ke server. Request dapat berisi:

- method: GET, POST, PATCH, DELETE;
- URL: endpoint tujuan;
- headers: informasi format/konteks;
- body: data yang dikirim, jika diperlukan.

## 9.4 Apa itu response?

Response adalah jawaban server kepada client. Response umumnya berisi:

- status code, misalnya 200, 201, 400, 404, 500;
- headers;
- body, misalnya JSON berisi data atau pesan error.

## 9.5 Apa itu JSON?

JSON (JavaScript Object Notation) adalah format teks untuk bertukar data.

Contoh:

```json
{
  "id": 2,
  "title": "Belajar Prisma",
  "category": "Belajar",
  "completed": false
}
```

JSON menggunakan pasangan nama-properti dan nilai. String menggunakan tanda kutip ganda; boolean ditulis `true` atau `false` tanpa kutip.

## 9.6 Apa itu header `Content-Type`?

Ketika client mengirim body JSON, header berikut memberi tahu server format body:

```typescript
headers: {
  "Content-Type": "application/json",
}
```

## 9.7 Apa itu HTTP status code?

| Status | Arti umum | Contoh dalam proyek |
|---|---|---|
| 200 OK | Request berhasil | GET berhasil; PATCH berhasil |
| 201 Created | Resource baru dibuat | POST tugas berhasil |
| 400 Bad Request | Input/request tidak valid | Judul kosong atau ID bukan angka positif |
| 404 Not Found | Resource tidak ditemukan/tidak tersedia | User atau task tidak ditemukan; endpoint disembunyikan di luar development |
| 405 Method Not Allowed | Method tidak tersedia pada route | GET pernah menghasilkan 405 ketika export GET belum tersimpan/terdeteksi |
| 500 Internal Server Error | Terjadi kesalahan di server | Database atau proses server gagal |

Status code adalah petunjuk hasil request, bukan pengganti membaca pesan error server.

---

# 10. GET, POST, PATCH, DELETE, serta kode status

HTTP method menyatakan tujuan request. Pada proyek ini, empat method digunakan untuk operasi CRUD.

## 10.1 GET — mengambil/membaca data

GET meminta representasi data dan pada umumnya tidak mengubah state server.

Contoh terminal:

```bash
curl -i http://localhost:3000/api/tasks
```

Contoh client:

```typescript
const response = await fetch("/api/tasks");
const tasks = await response.json();
```

Contoh handler:

```typescript
export async function GET() {
  const tasks = await prisma.task.findMany();
  return NextResponse.json(tasks);
}
```

GET digunakan ketika dashboard perlu menampilkan daftar tugas dari Supabase.

## 10.2 POST — membuat data baru

POST mengirim data ke server dan biasanya menimbulkan perubahan, misalnya membuat record baru.

Contoh client:

```typescript
const response = await fetch("/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Belajar Prisma" }),
});
```

Contoh Prisma:

```typescript
const task = await prisma.task.create({
  data: {
    title,
    category: "Pribadi",
    completed: false,
    user: { connect: { id: user.id } },
  },
});
```

Pada proyek ini, server mencari user uji, lalu membuat tugas dengan relasi pemilik. Respons sukses menggunakan status 201.

## 10.3 PATCH — memperbarui sebagian field

PATCH digunakan untuk menerapkan perubahan sebagian pada resource.

Mengubah judul:

```json
{ "id": 2, "title": "Judul baru" }
```

Mengubah status:

```json
{ "id": 2, "completed": true }
```

Contoh Prisma:

```typescript
await prisma.task.update({
  where: { id },
  data: { title: newTitle },
});
```

atau:

```typescript
await prisma.task.update({
  where: { id },
  data: { completed: true },
});
```

Dalam implementasi proyek, PATCH memeriksa bahwa request berisi tepat salah satu dari `title` atau `completed`, kemudian memvalidasi tipe nilainya. Setelah itu, server mencari tugas yang dimiliki user uji sebelum mengubahnya.

## 10.4 DELETE — menghapus data

DELETE meminta server menghapus resource yang ditentukan.

Contoh client:

```typescript
const response = await fetch("/api/tasks", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: taskId }),
});
```

Contoh Prisma:

```typescript
await prisma.task.delete({
  where: { id: existingTask.id },
});
```

Sebelum menghapus, API memeriksa bahwa tugas ada dan dimiliki user uji.

**Peringatan:** DELETE mengubah data permanen. Saat latihan gunakan task uji khusus, bukan tugas penting.

## 10.5 Apa perbedaan PUT dan PATCH?

- **PUT** secara umum mengganti representasi resource secara menyeluruh.
- **PATCH** menerapkan perubahan sebagian.

Untuk mengganti judul saja atau status selesai saja, PATCH lebih sesuai dengan cara kita mendesain endpoint ini.

## 10.6 Apakah method selalu menentukan keamanan?

Tidak. Menamai endpoint DELETE atau membatasi endpoint ke development bukan pengganti autentikasi dan otorisasi. Server tetap harus memastikan siapa pengguna yang sedang login dan apakah dia berhak mengubah record tersebut.

---

# 11. Alur lengkap sistem dari browser sampai database

Bagian ini adalah inti pemahaman arsitektur proyek. Pahami alur ini untuk setiap operasi.

## 11.1 Alur READ ketika dashboard dibuka

1. Browser membuka `http://localhost:3000/`.
2. React menjalankan komponen `Home()`.
3. `useEffect` memanggil `loadTasks()`.
4. `loadTasks()` menjalankan `fetch("/api/tasks")`.
5. Browser mengirim HTTP GET ke Next.js.
6. Next.js mencari fungsi `GET()` di `src/app/api/tasks/route.ts`.
7. Handler membaca `TEST_USER_EMAIL` dari environment.
8. Prisma mencari user berdasarkan email.
9. Prisma menjalankan `prisma.task.findMany({ where: { userId: user.id } })`.
10. PostgreSQL Supabase mengembalikan record tugas.
11. Prisma memberikan hasil ke handler sebagai objek JavaScript.
12. Handler mengirim JSON dengan `NextResponse.json(tasks)`.
13. Browser menerima response, lalu membaca `response.json()`.
14. Dashboard memanggil `setTasks(data)`.
15. React merender ulang daftar, ringkasan total, dan status.

Ringkasan:

```text
Browser → fetch GET → Next.js GET → Prisma findMany
        → Supabase PostgreSQL → JSON response
        → setTasks(data) → Dashboard tampil
```

## 11.2 Alur CREATE ketika pengguna menekan Tambah

1. Pengguna mengetik judul di input.
2. `onChange` memperbarui `newTaskTitle` melalui `setNewTaskTitle()`.
3. Pengguna menekan tombol Tambah yang mengirim form.
4. `handleAddTask()` mencegah form melakukan reload default dengan `event.preventDefault()`.
5. Program membersihkan spasi dengan `trim()`.
6. Dashboard mengirim `fetch` dengan method POST dan body JSON `{ title }`.
7. API POST membaca body memakai `await request.json()`.
8. API memvalidasi judul dan memastikan email user uji tersedia.
9. Prisma mencari User berdasarkan email.
10. Prisma membuat Task baru dengan `prisma.task.create()` dan relasi `connect` ke user.
11. PostgreSQL memasukkan record dan menghasilkan ID.
12. API mengirim data tugas dan status 201 Created.
13. Dashboard membaca JSON respons.
14. Dashboard memasukkan record hasil server ke state menggunakan `setTasks()`.
15. Input dikosongkan.

Ringkasan:

```text
Input → React state → handleAddTask → fetch POST
      → Next.js POST → validasi → Prisma create
      → Supabase simpan → JSON response
      → setTasks → daftar tampil
```

Hal penting: dashboard memperbarui tampilan **setelah** server menyatakan penyimpanan berhasil. Jika request gagal, tugas tidak boleh ditambahkan secara palsu ke daftar.

## 11.3 Alur UPDATE judul

1. Pengguna menekan tombol Edit.
2. `handleStartEdit(task)` mengisi `editingTaskId` dan `editTitle`.
3. Input edit menampilkan judul yang sedang ada.
4. Pengguna mengubah teks dan menekan Simpan.
5. `handleSaveEdit()` memeriksa judul kosong dan ID yang dipilih.
6. Dashboard mengirim PATCH berisi `{ id, title }`.
7. API PATCH memvalidasi ID dan judul.
8. API mencari user uji.
9. API memeriksa tugas berdasarkan `id` dan `userId`.
10. Prisma menjalankan `prisma.task.update({ data: updateData })`.
11. API mengirim record yang sudah diperbarui.
12. Dashboard mengganti item lama dengan record hasil server.
13. Mode edit ditutup.

## 11.4 Alur UPDATE status selesai

1. Pengguna menekan tombol centang.
2. `handleToggleTask(taskId)` mencari tugas di state dengan `find()`.
3. Status baru dihitung dengan `!currentTask.completed`.
4. Dashboard mengirim PATCH berisi `{ id, completed }`.
5. API memvalidasi bahwa `completed` benar-benar boolean.
6. API memeriksa kepemilikan tugas.
7. Prisma memperbarui kolom `completed`.
8. Dashboard mengganti item dengan hasil terbaru dari server.
9. Setelah refresh, GET membaca status dari database.

Nilai boolean:

- `false` = belum selesai.
- `true` = selesai.

## 11.5 Alur DELETE

1. Pengguna menekan tombol Hapus.
2. Browser menampilkan konfirmasi `window.confirm()`.
3. Jika pengguna memilih batal, fungsi berhenti dan request tidak dikirim.
4. Jika pengguna menyetujui, dashboard mengirim DELETE berisi ID tugas.
5. API memvalidasi ID dan mencari user uji.
6. API memastikan tugas tersebut dimiliki user uji.
7. Prisma menjalankan `prisma.task.delete()`.
8. API memberi respons sukses.
9. Dashboard baru menghapus item dari state setelah response sukses.
10. Setelah refresh, GET tidak lagi menemukan record tersebut.

---

# 12. Penjelasan operasi CRUD pada proyek

CRUD adalah singkatan dari:

| Huruf | Nama | Tujuan | API | Prisma |
|---|---|---|---|---|
| C | Create | Menambah record | POST | `create()` |
| R | Read | Membaca record | GET | `findMany()`, `findUnique()`, `findFirst()` |
| U | Update | Mengubah record | PATCH | `update()` |
| D | Delete | Menghapus record | DELETE | `delete()` |

## 12.1 `findMany()`

Mengambil banyak record:

```typescript
const tasks = await prisma.task.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    title: true,
    category: true,
    completed: true,
  },
});
```

- `where`: filter record.
- `orderBy`: mengurutkan record.
- `select`: memilih kolom yang ingin dikembalikan.

## 12.2 `findUnique()`

Mencari satu record berdasarkan field unik, misalnya email:

```typescript
const user = await prisma.user.findUnique({
  where: { email },
});
```

## 12.3 `findFirst()`

Mencari record pertama yang cocok dengan filter. Pada proyek ini dipakai untuk memastikan sebuah tugas dengan ID tertentu dimiliki user tertentu.

## 12.4 `count()`

Menghitung jumlah record:

```typescript
const taskCount = await prisma.task.count();
```

`count()` tidak mengembalikan daftar judul. Ia hanya mengembalikan angka.

## 12.5 `create()`

Membuat satu record baru:

```typescript
const task = await prisma.task.create({
  data: {
    title: "Belajar Next.js",
    category: "Belajar",
    completed: false,
    user: { connect: { id: user.id } },
  },
});
```

## 12.6 `update()`

Memperbarui record yang ditemukan dengan kriteria unik:

```typescript
const task = await prisma.task.update({
  where: { id },
  data: { completed: true },
});
```

## 12.7 `delete()`

Menghapus record:

```typescript
const task = await prisma.task.delete({
  where: { id },
});
```

Penting: sebelum update/delete di aplikasi multiuser, pastikan ownership diperiksa dalam query atau transaksi yang aman. Jangan mengandalkan ID dari browser saja.

---

# 13. Skrip pengguna uji dan tugas uji

Kita membuat skrip TypeScript di folder `scripts` agar bisa menguji Prisma tanpa harus menekan tombol pada dashboard.

## 13.1 `create-test-user.ts`

Skrip ini:

1. Memuat `.env` melalui `import "dotenv/config"`.
2. Memeriksa nilai konfigurasi wajib.
3. Membuat adapter PostgreSQL dan Prisma Client.
4. Mencari email dengan `prisma.user.findUnique()` agar tidak membuat duplikat.
5. Melakukan hash password dengan `bcrypt.hash(password, 12)`.
6. Membuat user dengan `prisma.user.create()`.
7. Menutup koneksi di `finally` menggunakan `$disconnect()`.

### Apa itu bcrypt dan password hash?

Hash password adalah hasil proses kriptografi satu arah yang dirancang untuk menyimpan verifikasi password tanpa menyimpan password asli. Saat login nanti, password yang dimasukkan diverifikasi dengan hash yang tersimpan (misalnya memakai `bcrypt.compare`), bukan dengan membaca password asli dari database.

`12` pada `bcrypt.hash(password, 12)` adalah cost factor bcrypt, bukan panjang karakter password.

Jangan menyimpan password sebagai teks biasa di kolom `passwordHash`.

## 13.2 `getRequiredEnv()` dan TypeScript

Kita pernah mengalami error ketika mengambil variabel dari `process.env`, karena tipe bawaan adalah `string | undefined`.

Contoh fungsi yang memperjelas bahwa nilai harus tersedia:

```typescript
function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Variabel ${key} belum diisi di .env`);
  }

  return value.trim();
}
```

Dengan pemeriksaan ini, fungsi hanya mengembalikan string. Jika nilai kosong atau tidak ada, program berhenti dengan pesan yang jelas.

## 13.3 `create-test-task.ts`

Skrip ini:

1. Memuat `.env`.
2. Membuat Prisma Client dengan `PrismaPg`.
3. Mencari user uji berdasarkan email.
4. Menentukan judul tugas.
5. Memeriksa tugas yang sama agar skrip tidak terus membuat duplikat.
6. Menyimpan tugas memakai `prisma.task.create()`.
7. Menghubungkan tugas dengan user lewat `user: { connect: { id: user.id } }`.
8. Mencetak hasil dan menutup Prisma Client.

Jalankan skrip dengan:

```bash
npx tsx scripts/create-test-user.ts
npx tsx scripts/create-test-task.ts
```

Gunakan hanya pada database latihan. Skrip ini menulis record sungguhan ke database.

---

# 14. Perintah terminal yang perlu dikuasai

Selalu masuk ke folder proyek terlebih dahulu:

```bash
cd ~/Projects/manajemen-tugas
```

| Perintah | Fungsi |
|---|---|
| `pwd` | Menampilkan direktori kerja saat ini |
| `ls -la` | Menampilkan file termasuk file tersembunyi seperti `.env` (jangan menyalin isinya) |
| `ls -l scripts` | Melihat file skrip di folder scripts |
| `mkdir -p src/lib` | Membuat folder jika belum ada |
| `touch scripts/contoh.ts` | Membuat file kosong jika belum ada |
| `find src/app/api -maxdepth 3 -type f -print` | Memeriksa lokasi route file |
| `grep -n "export async function" ...` | Mencari method GET/POST/PATCH/DELETE dalam file |
| `sed -n '1,160p' file.ts` | Menampilkan baris 1–160 dari file |
| `nl -ba file.ts` | Menampilkan isi file beserta nomor baris |
| `npx tsc --noEmit` | Memeriksa TypeScript tanpa menghasilkan file kompilasi |
| `npx prisma validate` | Memvalidasi Prisma schema |
| `npx prisma generate` | Membuat Prisma Client hasil generate |
| `npx prisma migrate status` | Memeriksa riwayat migrasi |
| `npx tsx scripts/nama.ts` | Menjalankan skrip TypeScript melalui tsx |
| `npm run dev` | Menjalankan server Next.js development |
| `Ctrl + C` | Menghentikan proses server di terminal |
| `curl -i URL` | Mengirim request dan menampilkan status/header/body response |
| `git status -sb` | Melihat status Git dan perbandingan branch |
| `git fetch origin` | Mengambil informasi terbaru dari remote tanpa langsung menggabungkan kode |

## 14.1 Mengapa terminal kedua diperlukan?

Saat `npm run dev` berjalan, terminal tersebut dipakai oleh proses server. Jangan mengetik perintah pengujian lain di terminal yang sedang sibuk menjalankan server. Buka terminal kedua untuk menjalankan `curl`, `git`, atau `npx tsc`.

Jika server tidak berjalan, `curl` ke localhost dapat menghasilkan `curl: (7) Failed to connect`. Ini berarti belum ada server yang menerima request pada port tersebut, bukan otomatis berarti database rusak.

## 14.2 Perintah pemeriksaan API

GET:

```bash
curl -i http://localhost:3000/api/tasks
```

POST (menambah data sungguhan, jalankan hanya jika memang ingin membuat record):

```bash
curl -i -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Tugas percobaan"}'
```

PATCH judul (mengubah data sungguhan):

```bash
curl -i -X PATCH http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":2,"title":"Judul hasil edit"}'
```

PATCH status (mengubah data sungguhan):

```bash
curl -i -X PATCH http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":2,"completed":true}'
```

DELETE (menghapus data sungguhan; jangan gunakan ID penting):

```bash
curl -i -X DELETE http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":12345}'
```

Pada contoh DELETE di atas, `12345` adalah placeholder ID. Ganti hanya dengan ID record uji yang memang ingin dihapus. Jangan jalankan contoh tanpa memahami bahwa DELETE menghapus data.

---

# 15. Error yang pernah ditemukan dan cara mendiagnosisnya

Bagian ini penting untuk belajar mandiri. Jangan langsung mengganti banyak kode ketika ada error. Baca pesan, cari file/nomor baris, periksa kondisi, lalu ubah bagian terkecil yang relevan.

## 15.1 `The datasource.url property is required`

**Gejala:** `prisma migrate dev` tidak menemukan URL database di Prisma config.

**Makna:** Prisma CLI membutuhkan datasource URL melalui konfigurasi Prisma v7. Dalam proyek ini konfigurasi dibaca dari `prisma7.config.ts` dan environment variable.

**Cara periksa:** periksa apakah `DATABASE_URL` ada di `.env`, apakah file config membaca environment dengan benar, dan apakah terminal berada di root proyek.

## 15.2 `DATABASE_URL tersedia: false`

**Makna:** environment variable tidak ditemukan atau kosong.

**Penyelesaian yang dipakai:** memperbaiki `.env` di root proyek dan memeriksa variabel tanpa mencetak rahasia:

```bash
node -e 'require("dotenv").config(); console.log("tersedia:", Boolean(process.env.DATABASE_URL?.trim()))'
```

## 15.3 `getaddrinfo ENOTFOUND`

**Makna:** hostname tidak berhasil di-resolve.

**Penyelesaian:** menyalin ulang connection string dari Supabase Connect. Periksa hostname dan port secara terpisah tanpa mencetak password.

## 15.4 `Drift detected` dan Prisma meminta reset

**Makna:** keadaan database aktual berbeda dari schema yang diharapkan berdasarkan migration history. Pada proyek ini tabel sudah tersedia dari pekerjaan sebelumnya, sedangkan folder migrasi lokal kosong saat diperiksa.

**Penyelesaian aman:** jangan menekan reset. Periksa struktur database dan riwayat migrasi. Pertimbangkan baseline resmi setelah memastikan schema database sama dengan schema Prisma. Buat backup sebelum perubahan.

## 15.5 `No such file or directory`

**Makna:** file tidak ditemukan pada path yang diperiksa. Penyebab umum dalam latihan ini:

- terminal berada di `~/Projects`, bukan `~/Projects/manajemen-tugas`;
- file belum dibuat;
- file dibuat di folder lain;
- nama file/path salah.

**Cara periksa:** jalankan `pwd`, `ls -l`, atau `find` dari root proyek.

## 15.6 File 0 byte

Saat `touch scripts/create-test-task.ts` dijalankan, file kosong dibuat. `touch` tidak otomatis menulis kode. Kode harus dimasukkan melalui editor lalu disimpan.

## 15.7 `Cannot find module '@/lib/prisma'`

**Makna:** TypeScript tidak menemukan modul melalui alias `@/` atau konfigurasi path tidak cocok.

Dalam latihan, kita menggunakan import relatif yang sesuai dengan lokasi file. Misalnya:

- dari `src/app/db-check/page.tsx` ke `src/lib/prisma.ts`: `../../lib/prisma`;
- dari `src/app/api/tasks/route.ts` ke `src/lib/prisma.ts`: `../../../lib/prisma`.

Import relatif dihitung dari lokasi file yang sedang melakukan import.

## 15.8 Salah meletakkan `route.ts`

Route yang diinginkan adalah:

```text
src/app/api/tasks/route.ts
```

Bukan:

```text
src/app/api/route.ts
```

Route yang salah pernah menyebabkan TypeScript mencoba mengimpor `../../../lib/prisma` dari folder yang berbeda. Periksa lokasi file dengan:

```bash
find src/app/api -maxdepth 3 -type f -print
```

## 15.9 File lama masih menghasilkan error di editor

Setelah memindahkan file, editor dapat tetap menampilkan diagnosis lama atau tab lama masih terbuka. Pertama periksa keadaan aktual melalui terminal (`test -f`, `find`, `npx tsc --noEmit`). Setelah yakin file lama sudah tidak ada dan perubahan disimpan, restart TypeScript server atau reload editor. Jangan menutup tab dengan perubahan yang belum disimpan tanpa memeriksa apakah kode masih diperlukan.

## 15.10 `string | undefined` pada environment variable

**Makna:** TypeScript tidak bisa menjamin environment variable tersedia.

**Penyelesaian:** gunakan fungsi pemeriksaan seperti `getRequiredEnv()` untuk mengecek nilai kosong/tidak ada dan mengembalikan `string` yang valid.

Jangan hanya menambahkan tanda `!` agar error hilang tanpa memvalidasi nilai sebenarnya.

## 15.11 Error bcrypt `Promise<string> ... not assignable to string`

**Makna:** kemungkinan hasil hash belum ditunggu, atau tipenya masih salah akibat input password belum dipastikan string.

Gunakan:

```typescript
const passwordHash = await bcrypt.hash(password, 12);
```

Fungsi `hash()` bersifat asynchronous. `await` menunggu hash selesai sehingga variabel berisi string hash, bukan Promise.

## 15.12 `npx tsc` memasang paket `tsc` yang salah

Ini pernah terjadi ketika perintah dijalankan dari folder induk, bukan root proyek. Jalankan dari:

```bash
cd ~/Projects/manajemen-tugas
npx tsc --noEmit
```

`tsc` adalah executable compiler dari paket TypeScript. Jangan memasang paket npm bernama `tsc` sebagai pengganti compiler TypeScript.

## 15.13 `405 Method Not Allowed`

**Makna:** route ditemukan, tetapi method yang diminta tidak diekspor/tersedia pada route yang sedang berjalan. Dalam latihan, GET belum tersimpan atau belum terdeteksi ketika `curl` dijalankan.

**Penyelesaian:** periksa:

```bash
grep -n "export async function" src/app/api/tasks/route.ts
```

Simpan file, lalu coba kembali.

## 15.14 `curl: (7) Failed to connect to localhost:3000`

**Makna:** server Next.js tidak sedang menerima koneksi pada port 3000. Jalankan `npm run dev` di terminal pertama dan gunakan terminal kedua untuk curl.

## 15.15 Dashboard menampilkan pesan gagal memuat

Kemungkinan penyebab meliputi server belum berjalan, endpoint GET error, URL/port berbeda, atau respons API gagal. Uji endpoint langsung:

```bash
curl -i http://localhost:3000/api/tasks
```

Jika GET mengembalikan `200 OK` dan JSON, lanjut periksa kode `useEffect` dan browser console.

## 15.16 Tugas hilang setelah refresh

**Penyebab:** tugas hanya ditambahkan ke React state melalui `setTasks()`, belum dikirim ke database.

**Penyelesaian:** kirim POST ke API; server menyimpan dengan `prisma.task.create()`; setelah sukses, gunakan record dari respons untuk memperbarui state.

## 15.17 Tugas hanya hilang dari layar, tetapi masih ada di Supabase

**Penyebab:** fungsi `handleDeleteTask()` hanya menggunakan `filter()` dan `setTasks()`, belum memanggil API DELETE.

**Penyelesaian:** kirim DELETE ke API, tunggu response sukses, baru keluarkan tugas dari state.

## 15.18 Error `NextResponse` dan `prisma` tidak dikenali di `page.tsx`

**Penyebab:** kode server API (DELETE) sempat ditempel ke file dashboard Client Component. Kode harus berada di `src/app/api/tasks/route.ts`, bukan `src/app/page.tsx`.

Pisahkan tanggung jawab:

- `page.tsx`: UI, state, event, fetch.
- `route.ts`: validasi server, Prisma, response.

---

# 16. Keamanan dan pekerjaan yang belum selesai

Bagian ini wajib dipahami sebelum aplikasi di-deploy atau dipakai orang lain.

## 16.1 Akun uji bukan autentikasi produksi

Saat latihan, API mengambil satu user melalui `TEST_USER_EMAIL`. Artinya semua request lokal diarahkan ke satu pengguna uji. Ini membantu memahami relasi user dan task, tetapi bukan mekanisme login sesungguhnya.

Pada aplikasi dengan banyak pengguna, server harus mengetahui identitas user yang benar-benar login melalui sesi/token yang diverifikasi. Jangan menerima `userId` dari browser sebagai bukti siapa pemilik request.

## 16.2 Pemeriksaan development bukan pengganti login

Kode yang mengembalikan 404 jika `NODE_ENV !== "development"` berguna untuk membatasi endpoint latihan. Namun itu bukan sistem autentikasi. Aplikasi publik tetap memerlukan autentikasi dan otorisasi yang benar.

## 16.3 Authorization / ownership

Setiap operasi terhadap tugas harus dibatasi dengan identitas pemilik:

- GET: hanya ambil task yang userId-nya sesuai user login.
- POST: tetapkan userId dari user login di server.
- PATCH: update hanya task milik user login.
- DELETE: hapus hanya task milik user login.

Pada desain latihan ini, API sudah melakukan pemeriksaan user uji untuk task pada operasi server. Pada produksi, nilai user harus berasal dari sesi terverifikasi, bukan environment variable pengguna uji.

## 16.4 Password dan bcrypt

- Jangan simpan password asli.
- Gunakan hash password yang sesuai, misalnya bcrypt atau algoritma password hashing modern yang dikelola dengan benar.
- Jangan mencetak password atau passwordHash ke log.
- Jangan gunakan password `1234` atau password yang dipakai layanan pribadi.
- Di latihan, password uji dibuat dengan panjang minimum yang lebih baik dan disimpan hash.

## 16.5 `.env` dan GitHub

- Pastikan `.env` di `.gitignore`.
- Jangan pernah menaruh `DATABASE_URL` di `page.tsx`.
- Jangan gunakan prefix `NEXT_PUBLIC_` untuk rahasia.
- Jika rahasia pernah terunggah ke GitHub, mengganti file saja tidak cukup; rotasi password/secret di penyedia layanan.

## 16.6 Supabase RLS dan akses database

Supabase menyediakan Row Level Security (RLS). Periksa status RLS dan kebijakan tabel sebelum publikasi. Dalam arsitektur Prisma melalui koneksi PostgreSQL server, jangan menganggap RLS otomatis menggantikan pemeriksaan kepemilikan yang ditulis di aplikasi. Evaluasi role database, hak akses, dan konteks autentikasi yang digunakan.

Jangan pernah mengekspos service role key atau database password ke browser.

## 16.7 Validasi server tetap wajib

Validasi input di React membantu pengalaman pengguna, tetapi server tetap wajib memvalidasi. Request dapat dikirim tanpa melalui form dashboard (misalnya melalui curl atau script). Karena itu API memeriksa tipe ID, judul tidak kosong, dan status harus boolean.

## 16.8 Backup dan migrasi

Sebelum perubahan schema besar:

1. Pastikan data penting dibackup.
2. Periksa `schema.prisma`.
3. Periksa migration files dan `prisma migrate status`.
4. Jangan menjalankan reset tanpa memahami dampaknya.
5. Uji perubahan di database development terlebih dahulu.

---

# 17. Peta belajar berikutnya dan latihan mandiri

## 17.1 Status materi

| Materi | Status |
|---|---|
| Dasar Next.js/React dashboard | Sudah dibuat dan dipakai |
| Tipe TypeScript `Task` | Sudah digunakan |
| Koneksi Supabase PostgreSQL | Berhasil |
| Prisma schema dan Prisma Client | Berhasil divalidasi/digenerate |
| Pengguna uji dan hash password | Berhasil |
| GET, POST, PATCH, DELETE | Berhasil diuji |
| Dashboard membaca database | Berhasil |
| Dashboard menambah tugas | Berhasil |
| Dashboard mengedit judul | Berhasil |
| Dashboard menghapus tugas | Berhasil |
| Dashboard mengubah status completed | Berhasil |
| Register dan login sungguhan | Belum dikerjakan |
| Sesi autentikasi | Belum dikerjakan |
| Otorisasi multiuser produksi | Belum dikerjakan |
| Baseline/riwayat migration yang rapi | Perlu diperiksa dan dibereskan sebelum perubahan schema selanjutnya |
| Deployment produksi dan hardening | Belum dikerjakan |

## 17.2 Pelajaran 24 — Register

Pelajari:

- Form nama, email, password.
- Validasi input.
- Memeriksa email sudah digunakan atau belum.
- Hash password dengan bcrypt.
- Menyimpan user dengan `prisma.user.create()`.
- Mengembalikan response yang tidak membocorkan passwordHash.

## 17.3 Pelajaran 25 — Login dan sesi

Pelajari:

- Mencari user berdasarkan email.
- Membandingkan password input dengan hash menggunakan verifikasi bcrypt.
- Membuat sesi atau token yang aman.
- Menyimpan sesi menggunakan cookie yang sesuai.
- Melindungi route dan halaman yang memerlukan login.

## 17.4 Pelajaran 26 — Multiuser dan ownership

Pelajari:

- Mendapatkan identitas user dari sesi terverifikasi.
- Tidak lagi menggunakan `TEST_USER_EMAIL` untuk request aplikasi normal.
- Memfilter seluruh query dengan user yang sedang login.
- Menguji bahwa user A tidak bisa membaca, mengubah, atau menghapus tugas user B.

## 17.5 Pelajaran 27 — Rapikan aplikasi

- Hapus/batasi halaman diagnostik `/db-check`.
- Hapus skrip dan endpoint latihan yang tidak diperlukan di production.
- Tambahkan loading, error, dan empty state yang jelas.
- Pertimbangkan validasi form yang konsisten.
- Tinjau RLS, role database, environment variables, dan deployment.
- Rapikan migration history setelah schema aktual diperiksa.

## 17.6 Latihan pemahaman

Cobalah menjawab tanpa melihat bagian sebelumnya:

1. Apa perbedaan antara `setTasks()` dan `prisma.task.create()`?
2. Mengapa file dashboard `page.tsx` tidak boleh mengimpor Prisma Client?
3. Apa perbedaan GET dan POST?
4. Mengapa PATCH dapat digunakan untuk mengubah judul dan status tanpa mengganti semua kolom?
5. Mengapa API POST harus menghubungkan task ke user?
6. Apa fungsi `await` pada `prisma.task.findMany()`?
7. Apa isi `response.json()`?
8. Mengapa server perlu memeriksa `response.ok`?
9. Mengapa tugas yang dihapus dari React state dapat muncul kembali setelah refresh?
10. Mengapa `TEST_USER_EMAIL` tidak cukup untuk autentikasi aplikasi publik?

### Jawaban ringkas untuk pengecekan mandiri

1. `setTasks()` mengubah tampilan/state React; `create()` menulis record ke database.
2. Karena dashboard adalah Client Component; query DB dan secret harus berada di server.
3. GET membaca; POST mengirim data untuk membuat/menjalankan perubahan.
4. PATCH menerapkan perubahan sebagian pada field tertentu.
5. Karena schema mewajibkan `userId`/relasi pemilik.
6. Menunggu query asynchronous selesai sebelum memakai hasilnya.
7. Body response yang di-parse sebagai JSON.
8. Agar client tidak menganggap response gagal sebagai data sukses.
9. Karena perubahan hanya di memori browser, bukan database.
10. Karena itu hanya satu konfigurasi user uji, bukan identitas user yang terautentikasi.

---

# 18. Glosarium istilah

| Istilah | Arti sederhana |
|---|---|
| API | Cara dua bagian aplikasi saling meminta layanan/data |
| Endpoint | Alamat tujuan API, misalnya `/api/tasks` |
| HTTP | Protokol komunikasi request-response di web |
| Method | Jenis tindakan request: GET, POST, PATCH, DELETE |
| Request | Permintaan dari client ke server |
| Response | Jawaban server untuk client |
| Header | Metadata request/response, misalnya Content-Type |
| Body | Isi data yang dikirim atau dikembalikan |
| JSON | Format teks untuk pertukaran data |
| HTTP status | Angka hasil request, misalnya 200 atau 404 |
| Client | Bagian yang meminta layanan; pada contoh ini browser |
| Server | Bagian yang memproses request dan menjalankan akses database |
| Client Component | Komponen React yang dapat menggunakan state/event/browser APIs |
| Server Component | Komponen React yang dirender di server secara default dalam App Router |
| State | Data lokal yang dikelola React dan memengaruhi UI |
| Hook | Fungsi React seperti `useState` dan `useEffect` |
| `useState` | Hook untuk menyimpan state komponen |
| `useEffect` | Hook untuk menyelaraskan komponen dengan sistem eksternal |
| `fetch()` | API JavaScript untuk mengirim HTTP request |
| `async` | Menandai fungsi yang menggunakan operasi asynchronous |
| `await` | Menunggu hasil Promise di fungsi async |
| Promise | Objek yang mewakili hasil operasi asynchronous yang tersedia kemudian |
| `try/catch/finally` | Struktur penanganan sukses/error dan proses akhir |
| ORM | Pemetaan objek/entitas aplikasi ke tabel relasional |
| Prisma Client | Query builder bertipe yang dibuat dari schema |
| Adapter | Penghubung Prisma Client dengan driver database |
| Migration | Catatan/perintah perubahan struktur database dari waktu ke waktu |
| Drift | Perbedaan struktur database aktual dengan keadaan yang diharapkan migration history |
| Baseline | Menandai struktur database yang sudah ada sebagai titik awal migration history |
| Primary key | Identitas unik record |
| Foreign key | Kolom yang merujuk record pada tabel lain |
| Relation | Hubungan antara model/tabel |
| Hash | Transformasi satu arah untuk menyimpan representasi password |
| RLS | Row Level Security, kebijakan akses per baris di PostgreSQL/Supabase |
| CRUD | Create, Read, Update, Delete |
| Development | Lingkungan pengembangan lokal |
| Production | Lingkungan aplikasi yang dipakai pengguna sebenarnya |

---

# 19. Referensi resmi untuk belajar lebih lanjut

Gunakan dokumentasi berikut bila ingin memperdalam konsep atau memeriksa perubahan versi.

1. **Next.js — Route Handlers:** https://nextjs.org/docs/app/getting-started/route-handlers  
   Menjelaskan file `route.ts`, method GET/POST/PATCH/DELETE, request dan response.

2. **Next.js — Server and Client Components:** https://nextjs.org/docs/app/getting-started/server-and-client-components  
   Menjelaskan kapan memakai Server Component dan Client Component.

3. **Next.js — `use client`:** https://nextjs.org/docs/app/api-reference/directives/use-client  
   Menjelaskan batas Client Component.

4. **React — `useEffect`:** https://react.dev/reference/react/useEffect  
   Menjelaskan effect, dependency, dan cleanup.

5. **Prisma ORM v7 — Introduction to Prisma Client:** https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction  
   Menjelaskan Prisma Client, generate, adapter, dan query.

6. **Prisma ORM v7 — Database drivers:** https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers  
   Menjelaskan driver adapters dan contoh `PrismaPg`.

7. **Prisma ORM v7 — PostgreSQL connector:** https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql  
   Menjelaskan koneksi PostgreSQL termasuk Supabase.

8. **Supabase — Connecting to Postgres:** https://supabase.com/docs/guides/database/connecting-to-postgres  
   Menjelaskan direct connection, session pooler, transaction pooler, host, dan port.

9. **MDN — HTTP request methods:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods  
   Menjelaskan arti GET, POST, PUT, PATCH, DELETE, dan sifat method HTTP.

10. **MDN — POST:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST  
    Menjelaskan pengiriman data dengan POST.

---

## Penutup

Tujuan belajar bukan hanya membuat aplikasi terlihat berhasil. Tujuan utamanya adalah memahami **mengapa** data bergerak melalui setiap lapisan dan **di mana** suatu pekerjaan seharusnya dilakukan.

Pegang pembagian tanggung jawab ini:

- **React/dashboard:** menerima input, menampilkan data, dan merespons interaksi.
- **Next.js Route Handler:** menerima request, memvalidasi data, memeriksa izin, dan mengirim response.
- **Prisma Client:** menjalankan operasi database dengan model yang telah didefinisikan.
- **Supabase PostgreSQL:** menyimpan record secara permanen.

Setiap kali sebuah tugas ditambahkan, dibaca, diedit, ditandai selesai, atau dihapus, ikuti alur tersebut. Jika terjadi error, periksa lapisan mana yang gagal sebelum mengubah kode lain.

**Status akhir tahap belajar ini:** CRUD tugas sudah terhubung dan diuji di lingkungan development dengan satu pengguna uji. Tahap belajar berikutnya adalah autentikasi, sesi, dan otorisasi multiuser sebelum aplikasi digunakan secara publik.
