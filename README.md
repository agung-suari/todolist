# Ruang Tugas

Manajemen tugas pribadi dengan Next.js 16, React 19, Prisma 7, dan PostgreSQL
Supabase. Mendukung daftar/masuk/keluar, tugas per pengguna, kategori, deskripsi,
tenggat tanggal, prioritas, pencarian, filter gabungan, pengurutan, dan halaman
daftar (20 tugas per halaman).

## Setup setelah clone

Gunakan Node.js 24 LTS dan npm.

```powershell
npm ci
Copy-Item .env.example .env
```

Jika `.env` sudah ada, edit saja; jangan ditimpa. Di Linux gunakan
`cp .env.example .env` hanya jika file tersebut belum ada.

Isi `DATABASE_URL` dari Supabase **Connect > Session pooler**, port 5432 untuk
lokal. Ganti placeholder database password dan URL-encode karakter khusus.
Untuk hosting serverless, runtime dapat menggunakan transaction pooler; isi
`DIRECT_URL` dengan Session pooler/direct URI yang sesuai untuk migrasi.
CLI memakai `DIRECT_URL` jika ada, sedangkan aplikasi memakai `DATABASE_URL`.
Gunakan pengaturan TLS/certificate dari penyedia database, bukan menonaktifkan
verifikasi sertifikat. Jangan commit env, password, atau token sesi.

### Database kosong

```powershell
npm run db:deploy
npm run dev
```

### Database lama dari tahap db push

Jika belum mempunyai tabel riwayat migrasi dan masih memakai schema lama:

```powershell
npm run db:baseline
npm run db:deploy
npm run dev
```

Baseline memeriksa kecocokan seluruh schema sebelum menandai `0001_initial`
sebagai sudah diterapkan. Baseline tidak membuat ulang tabel atau menghapus data.
Jika riwayat migrasi sudah ada, cukup `npm run db:deploy`; jangan baseline lagi.
Database pada workspace ini sudah menjalani baseline dan migrasi kedua.

Buka http://localhost:3000, pilih **Daftar**, lalu buat akun. Password minimal
12 karakter dan maksimal 128 byte. Setiap akun mulai dengan daftar tugas sendiri.
Akun development lama beserta tugasnya tetap disimpan, tetapi tidak lagi menjadi
identitas bersama dan tidak otomatis diwariskan ke akun yang baru dibuat.
`ENABLE_DEV_ACCOUNT` sudah tidak digunakan.

## Autentikasi dan akses data

- Password memakai scrypt dengan salt acak (N=32768, r=8, p=3).
- Token sesi acak 256 bit disimpan dalam cookie HttpOnly dan SameSite=Lax.
  Cookie produksi memakai Secure dan awalan `__Host-`; hosting wajib HTTPS.
- Database menyimpan hash SHA-256 token, bukan token cookie aslinya.
- Sesi berlaku 7 hari. Login membuat token baru; logout mencabut sesi di database.
  Masa berlaku dibuat dan diperiksa menggunakan jam UTC database.
- Sepuluh percobaan autentikasi per email/jenis operasi per jendela 15 menit,
  dihitung atomik dalam database agar berlaku di beberapa instance aplikasi.
- Pembacaan dan setiap perubahan tugas memeriksa sesi serta `userId` di server.
  Nilai pemilik dari browser tidak dipercaya.
- Server Actions memakai pemeriksaan Origin bawaan Next.js. Jangan membuka
  `serverActions.allowedOrigins` ke sembarang domain pada reverse proxy.
- Migrasi ketiga mengaktifkan RLS dan mencabut grant `anon`/`authenticated`
  untuk keempat tabel privat. Data API Supabase tidak dipakai aplikasi ini.
  Koneksi backend harus memakai pemilik tabel atau role dengan BYPASSRLS
  (misalnya koneksi server Supabase postgres); jangan gunakan role publik.

Email belum diverifikasi dan belum tersedia pemulihan password melalui email.
Pengiriman email memerlukan penyedia email serta domain terverifikasi; jangan
menganggap email yang dimasukkan pengguna sudah membuktikan kepemilikan alamat.

## Migrasi berikutnya

Riwayat ada di `prisma/migrations`: baseline schema lama, penambahan sesi,
pembatas login, tenggat, prioritas/indeks, dan penguncian tabel server dengan RLS.
Untuk mengembangkan schema:

```powershell
npm run db:migrate -- --name nama_perubahan
npm run db:generate
```

`migrate dev` membutuhkan shadow database. Jika penyedia cloud tidak mengizinkan
pembuatan database, gunakan database development/shadow terpisah dan tambahkan
`shadowDatabaseUrl` pada konfigurasi Prisma. Jangan memakai database utama
sebagai shadow. Terapkan migrasi produksi dengan `npm run db:deploy`.
Jangan gunakan reset atau accept-data-loss untuk memperbaiki koneksi.

## Pemeriksaan

```powershell
npm run lint
npm test
npm run build
npm run db:status
```

Saat server lokal aktif dan env mengarah ke database development, jalankan:

```powershell
npm run test:integration
```

Tes integrasi membuat akun/tugas sementara dengan penanda acak lalu membersihkan
fixture itu. Tes mencakup pendaftaran, cookie, penyimpanan, akses lintas akun,
input pemilik palsu, sesi palsu/kedaluwarsa, login, logout, dan pembatas login.
Implementasi pengiriman Server Action dalam tes mengikuti protokol Next.js yang
terpasang; periksa ulang harness ini jika memperbarui versi framework.

Untuk build produksi lokal, tes yang sama dapat diarahkan dengan `APP_URL`
dan `INTEGRATION_MODE=production`. Tes tetap membatasi tujuan ke localhost.
Di produksi sesungguhnya browser memerlukan HTTPS agar cookie Secure bekerja.

Jalankan `npm run db:cleanup` secara berkala untuk membersihkan sesi dan catatan
pembatas login yang sudah kedaluwarsa. Sesi aktif dan tugas tidak dihapus.

## Deployment

Hosting tujuan adalah Vercel; publikasi membutuhkan login akun Vercel. Siapkan database
production terpisah, backup, HTTPS, dan secret `DATABASE_URL`/`DIRECT_URL` pada
hosting tujuan. Terapkan migrasi satu kali dari release job sebelum traffic
mengakses versi baru. Build tidak menjalankan migrasi atau membutuhkan DB aktif.

Untuk hosting Next.js terkelola: gunakan Node 24, `npm ci`, lalu `npm run build`.
Jalankan `npm run db:deploy` dari job yang memiliki CLI Prisma dan koneksi migrasi.
Tambahkan perlindungan trafik/rate limit di hosting untuk membatasi pembuatan
akun massal dengan email berbeda.

### Vercel

`vercel.json` sudah memilih framework Next.js dan perintah install/build.
`engines.node` mengunci Node 24. Import repository ke Vercel atau gunakan CLI:

```powershell
npx vercel login
npx vercel link
```

Atur secret `DATABASE_URL` untuk runtime di Project Settings > Environment
Variables, dan gunakan database terpisah untuk Preview serta Production.
`DIRECT_URL` diperlukan hanya pada lingkungan/job yang menjalankan migrasi.
Jangan menaruh nilai secret di `vercel.json` atau perintah yang masuk riwayat shell.
Sebelum deploy pertama ke database kosong, jalankan `npm run db:deploy` memakai
env database tujuan. Database lama dari db push perlu baseline terlebih dahulu.
Sesudah secret dan migrasi siap:

```powershell
npx vercel deploy
npx vercel deploy --prod
```

Gunakan URL HTTPS hasil deployment untuk menguji daftar, login, tugas, dan logout.
Preview default tetap menggunakan build yang sama; jangan menghubungkannya ke
data production tanpa pengaturan akses dan lingkungan yang disengaja.

Untuk Docker (dibutuhkan Docker Engine yang aktif):

```powershell
docker build -t ruang-tugas .
docker run --rm -p 3000:3000 --env-file .env.production ruang-tugas
```

Docker memakai output standalone dan berjalan sebagai pengguna non-root.
Letakkan di belakang reverse proxy HTTPS. File env dikecualikan dari image.
Migrasi dijalankan terpisah dari container runtime. Docker Engine lokal saat
implementasi belum aktif; image belum diuji lewat container.

Workflow GitHub Actions memeriksa install, schema, lint, tes unit, dan build.
Tes integrasi perlu server serta database development dan dijalankan terpisah.

## Struktur utama

Catatan perombakan UI/UX dan pemeriksaan visual tersedia secara lokal di
`DESIGN.md`; catatan, skill dan skrip QA visual lokal tidak disertakan dalam Git.
Font Albert Sans disimpan bersama aplikasi beserta lisensi OFL agar build tidak
bergantung pada unduhan Google Fonts.

Jika skrip QA visual lokal tersedia, untuk mengulang pemeriksaan pasang skill `design-taste-frontend` di
`.codex/skills/`, jalankan aplikasi development dan gunakan
`node scripts/visual-qa.mjs`. Diperlukan Chrome/Edge, Node 24 dan database dev.
Skrip membuat akun fixture sementara, menguji interaksi lalu membersihkannya;
hasil tangkapan layar disimpan di `.taste-skill/` yang diabaikan Git.

- `src/app/auth-actions.ts`: daftar, masuk, keluar.
- `src/lib/auth.ts`: sesi, identitas, dan pembatas percobaan.
- `src/app/page.tsx`: daftar tugas milik pengguna aktif dari server.
- `src/app/actions.ts`: CRUD dengan validasi dan pemeriksaan pemilik.
- `src/components/`: form akun, form tugas, dashboard dan filter.
- `tests/`: tes validasi, hashing, filter, dan integrasi database.
