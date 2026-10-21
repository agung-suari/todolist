# Catatan Belajar — Proyek Manajemen Tugas Pribadi

Gunakan catatan ini untuk melanjutkan sesi belajar dari titik yang benar.

## Tujuan proyek
Membangun aplikasi Manajemen Tugas Pribadi menggunakan:
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL di Supabase
- Prisma ORM v7
- Autentikasi JWT dalam cookie `httpOnly`
- bcrypt untuk hash password

## Lingkungan dan setup
- OS/lingkungan: Kali Linux, terminal Zsh, editor Antigravity.
- NVM dipasang pada `~/.config/nvm`.
- Node.js 24.22.0 dan npm 11.19.1 terdeteksi saat setup.
- Git terpasang (`git version 2.51.0` saat diperiksa).
- Proyek dibuat di `~/Projects/manajemen-tugas` menggunakan `create-next-app@16`.
- Pilihan proyek: TypeScript, ESLint, Tailwind CSS, `src/` directory, App Router, import alias `@/*`.
- Cache Components: No.
- AGENTS.md untuk membantu coding agent: Yes.
- Anonymous agent feedback: No.
- Website development berhasil dibuka di `http://localhost:3000`.

## Materi yang sudah dipelajari dan dikonfirmasi
### Pelajaran 1 — Kerangka Next.js dan dashboard
- `src/app/page.tsx` menentukan halaman `/`.
- Komponen halaman menggunakan `export default function Home()`.
- Data tugas disusun sebagai array objek.
- `map()` menampilkan elemen dari daftar tugas.
- `filter()` dan `.length` menghitung ringkasan.
- `className` dipakai untuk kelas Tailwind CSS.

### Pelajaran 2 — Interaksi dengan React state
- `'use client'` dibutuhkan untuk interaksi browser di halaman ini.
- `useState` menyimpan daftar tugas dan isi input.
- `onChange` membaca teks yang diketik.
- `handleAddTask()` memvalidasi input, membuat tugas baru, memperbarui array dengan `setTasks`, lalu mengosongkan input.
- `handleToggleTask()` menggunakan `map()` untuk mengubah status satu tugas berdasarkan ID.
- Pengujian yang sudah dikonfirmasi lulus: input normal, input kosong, input berisi spasi saja, dan toggle status.

### Pelajaran 3 — Memahami alur dan menguji kode
- Pengguna mengetik -> `newTaskTitle` diperbarui -> submit memanggil `handleAddTask()` -> state `tasks` diperbarui -> React memperbarui tampilan.
- `trim()` menghilangkan spasi depan/belakang; validasi mencegah judul kosong.
- Pengguna mengubah status melalui `handleToggleTask()`.
- Pengguna menjawab benar semua pertanyaan tentang toggle: boolean dibalik, hanya ID yang sesuai berubah, dan spread syntax mempertahankan properti lama.

### Pelajaran 4 — Hapus tugas
- `handleDeleteTask(taskId)` memakai `filter()` agar hanya tugas dengan ID yang cocok dihapus.
- Tombol Hapus memanggil fungsi menggunakan `task.id`.
- Keempat pengujian fitur hapus dikonfirmasi lulus: hapus tugas, total berkurang, hapus tugas belum selesai, dan hapus tugas selesai.

### Pelajaran 5 — Edit tugas
- State tambahan: `editingTaskId` dan `editTitle`.
- `handleStartEdit(task)` memilih tugas dan mengisi judul lama ke state edit.
- Kondisi JSX menampilkan input saat tugas terpilih sedang diedit.
- `handleSaveEdit()` memvalidasi judul dan menggunakan `map()` untuk memperbarui judul dari tugas yang ID-nya sesuai.
- Tombol Simpan memanggil `handleSaveEdit`; tombol Batal membersihkan state edit tanpa memperbarui `tasks`.
- Keempat pengujian edit dikonfirmasi lulus: mulai edit, simpan, batal, dan validasi judul.

## Kondisi aplikasi sekarang
Fitur CRUD di sisi frontend (menggunakan React state) sudah dibuat dan diuji:
- Create: tambah tugas.
- Read: tampilkan tugas dan ringkasan.
- Update: edit judul dan ubah status selesai/belum selesai.
- Delete: hapus tugas.

Belum ada database. Data tugas disimpan hanya di React state selama halaman berjalan. Perubahan tambahan kemungkinan hilang setelah refresh karena daftar kembali dibuat dari data awal di kode.

## Titik lanjut yang tepat untuk sesi berikutnya
JANGAN mulai dari awal dan jangan menulis ulang semua kode.

1. Mulai dengan menanyakan/memandu eksperimen sederhana yang belum dikonfirmasi: tambahkan tugas baru, edit judulnya, lalu refresh browser (`Ctrl+R`). Amati bahwa tugas baru dan perubahan edit hilang dan data kembali ke nilai awal.
2. Jelaskan mengapa hal ini terjadi: React state bukan penyimpanan permanen, dan halaman menginisialisasi daftar dari array hard-coded ketika dimuat ulang.
3. Jelaskan gambaran arsitektur sebelum menambahkan paket:
   - UI Next.js -> server-side logic -> Prisma -> PostgreSQL Supabase.
   - Supabase menyediakan PostgreSQL; Prisma menjadi ORM untuk akses data.
4. Mulai persiapan database secara bertahap: buat proyek Supabase dan pahami connection string/variabel lingkungan, tanpa pernah meminta pengguna membagikan password atau secret di chat.
5. Sebelum menjalankan instalasi Prisma, periksa versi/konfigurasi aktual proyek dan ikuti panduan Prisma ORM v7 yang cocok. Jangan memasang semua autentikasi dulu.
6. Setelah database siap, pindahkan operasi CRUD satu per satu dari React state ke server/Prisma, lalu uji data tetap ada setelah refresh. Autentikasi JWT dan bcrypt dilakukan setelah CRUD database dipahami.

## Catatan teknis yang masih perlu diingat
- Saat pemasangan NVM, `.npmrc` menampilkan peringatan `globalconfig`/`prefix`. Pengguna kemudian berhasil memakai `node -v` dan `npm -v` yang menunjukkan Node 24.22.0 dan npm 11.19.1. Jangan menginstal NVM ulang; bila masalah muncul, periksa `~/.npmrc` hati-hati.
- Pembuatan proyek menghasilkan peringatan 5 high-severity vulnerabilities serta pesan deprecated/install script. Jangan menjalankan `npm audit fix --force` tanpa menelaah hasil `npm audit` terlebih dahulu.
- Pengguna masih pemula dan meminta penjelasan fungsi setiap kode. Satu langkah pada satu waktu; jangan langsung memberi seluruh aplikasi atau menulis ulang `page.tsx`.

## Prompt untuk melanjutkan
Di percakapan yang sama, pengguna bisa menulis:
> Lanjutkan belajar proyek Manajemen Tugas Pribadi dari catatan terakhir. CRUD frontend sudah berjalan dan seluruh tes tambah, toggle, hapus, dan edit lulus. Mulai dengan eksperimen refresh untuk membuktikan data masih sementara, jelaskan alasannya, lalu bimbing saya menyiapkan Supabase dan Prisma secara bertahap. Jangan langsung memberi semua kode sekaligus.

## Prinsip belajar
- Satu pelajaran pada satu waktu.
- Jelaskan tujuan dan fungsi kode sebelum/dalam praktik.
- Setelah setiap tahap, jalankan dan uji hasilnya.
- Jangan menambahkan semua teknologi sekaligus.
