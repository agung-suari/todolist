# Catatan Belajar — Proyek Manajemen Tugas Pribadi

Catatan ini digunakan agar sesi belajar berikutnya dimulai dari titik yang tepat.

## Tujuan proyek
Membangun aplikasi Manajemen Tugas Pribadi menggunakan:
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL di Supabase
- Prisma ORM v7
- Autentikasi JWT dalam cookie `httpOnly`
- bcrypt untuk hash password

## Lingkungan dan setup yang sudah dilakukan
- OS/lingkungan: Kali Linux, terminal Zsh, editor Antigravity.
- Node Version Manager (NVM) telah dipasang pada `~/.config/nvm`.
- Node.js 24.22.0 telah diunduh dan npm menunjukkan versi 11.19.1.
- Git terpasang (sebelumnya `git version 2.51.0`).
- Proyek berhasil dibuat di `~/Projects/manajemen-tugas` menggunakan `create-next-app@16`.
- Pilihan proyek: TypeScript, ESLint, Tailwind CSS, `src/` directory, App Router, import alias `@/*`.
- Opsi Cache Components: No.
- Opsi AGENTS.md untuk membantu coding agent: Yes.
- Opsi feedback agen anonim: No.
- Website dev server sudah berhasil dibuka di `http://localhost:3000`.

## Hal yang sudah dipelajari
### Pelajaran 1 — Halaman dashboard statis
- `src/app/page.tsx` menentukan halaman `/`.
- Komponen React memakai `export default function Home()`.
- Data tugas dapat disimpan sebagai array objek.
- `map()` membuat elemen tampilan dari daftar tugas.
- `filter()` dan `.length` menghitung jumlah tugas.
- `className` digunakan untuk kelas Tailwind CSS.

### Pelajaran 2 — Interaksi dengan state (materi sudah diberikan, implementasi belum dikonfirmasi)
Materi yang telah dijelaskan:
- `'use client'` diperlukan untuk interaksi seperti `useState` dan event handler pada halaman ini.
- `useState` untuk menyimpan daftar tugas dan nilai input.
- `onChange` untuk membaca teks yang diketik.
- `onSubmit`/`handleAddTask` untuk menambahkan tugas.
- `map()` dan `setTasks()` untuk mengubah status tugas.
- Ringkasan total, selesai, dan belum selesai dihitung dari `tasks`.

**Status penting:** Pengguna belum mengonfirmasi apakah kode Pelajaran 2 sudah ditempel ke `src/app/page.tsx` dan berhasil diuji. Sesi berikutnya jangan langsung menganggap fitur interaksi sudah berfungsi. Periksa dulu posisi terakhir.

## Catatan teknis
- Saat pemasangan NVM, terminal menampilkan peringatan `.npmrc` tentang `globalconfig`/`prefix` yang tidak kompatibel dengan NVM. Perintah yang disarankan adalah `nvm use --delete-prefix v24.22.0`; belum ada konfirmasi bahwa pemeriksaan setelahnya berhasil.
- Instalasi `create-next-app` melaporkan 5 kerentanan tingkat tinggi dan peringatan paket deprecated serta install script `unrs-resolver` yang belum disetujui. Jangan menjalankan `npm audit fix --force` secara membabi buta; periksa dulu ketika memang diperlukan.

## Langkah tepat untuk sesi berikutnya
1. Buka Antigravity dan folder `~/Projects/manajemen-tugas`.
2. Periksa apakah terminal `npm run dev` masih aktif. Jika tidak, buka terminal di folder proyek dan jalankan:
   ```bash
   cd ~/Projects/manajemen-tugas
   npm run dev
   ```
3. Buka `src/app/page.tsx` dan lihat apakah kode Pelajaran 2 sudah diterapkan.
4. Jika sudah diterapkan, uji: tambah tugas, periksa angka total, klik tanda selesai, lalu klik lagi untuk membatalkan status.
5. Jika belum diterapkan, lakukan bersama-sama dengan penjelasan tiap bagian—jangan langsung lanjut ke fitur lain.
6. Setelah interaksi berhasil, lanjut ke Pelajaran 3: fitur edit dan hapus tugas, lalu bahas perbedaan state sementara dan database. Setelah itu baru mulai database Supabase/Prisma.

## Cara memulai sesi berikutnya
Di percakapan yang sama, tulis:
> Lanjutkan belajar proyek Manajemen Tugas Pribadi dari titik terakhir. Baca catatan belajar ini: kita sudah membuat kerangka Next.js 16 dan mempelajari array, `map()`, `filter()`. Kita sudah membahas `useState` untuk tambah tugas dan toggle selesai, tetapi saya belum mengonfirmasi apakah implementasinya berhasil. Tolong periksa statusnya dulu dan jelaskan setiap langkah secara rinci, jangan lompat materi.

## Prinsip belajar
- Satu pelajaran pada satu waktu.
- Jelaskan fungsi kode sebelum atau saat kode dibuat.
- Setelah tiap tahap, jalankan dan uji hasilnya.
- Jangan menambahkan semua teknologi sekaligus.
