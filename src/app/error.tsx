"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="error-screen"><h1>Belum bisa terhubung.</h1><p>Coba lagi sebentar. Tugas yang sudah tersimpan tetap ada.</p><button onClick={reset} className="primary-button">Coba lagi</button></main>;
}
