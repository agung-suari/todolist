"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register } from "@/app/auth-actions";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icon";

function ExamplePlan() {
  const [done, setDone] = useState([true, false, false]);
  const tasks = ["Rencanakan hari ini", "Kerjakan yang penting", "Sisakan waktu untuk diri"];
  return <div className="example-plan" data-ui>
    <div className="example-plan-heading"><span>Contoh rencana harian</span><span>{done.filter(Boolean).length} / 3 selesai</span></div>
    {tasks.map((title, index) => <button key={title} type="button" className={`example-task ${done[index] ? "is-complete" : ""}`} aria-pressed={done[index]} onClick={() => setDone((current) => current.map((value, position) => position === index ? !value : value))}>
      <span className="task-checkbox">{done[index] && <Icon name="check" size={16} />}</span><span>{title}</span>
    </button>)}
    <p className="example-plan-note">Coba centang. Satu langkah kecil tetap berarti.</p>
  </div>;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const [state, action, pending] = useActionState(registering ? register : login, { error: "" });
  const [showPassword, setShowPassword] = useState(false);
  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="Tentang Ruang Tugas">
        <Link href="/login" className="brand-link" aria-label="Ruang Tugas"><Brand /></Link>
        <div className="auth-story-content"><h2>Beri ruang untuk<br />yang penting.</h2><p>Pikiran lebih lapang saat tugas punya tempatnya. Tulis, atur, lalu kerjakan satu per satu.</p><ExamplePlan /></div>
        <p className="auth-story-footer">Lebih teratur. Dengan caramu sendiri.</p>
      </section>
      <section className="auth-form-panel">
        <div className="auth-top-link"><span>{registering ? "Sudah punya akun?" : "Belum punya akun?"}</span><Link href={registering ? "/login" : "/register"}>{registering ? "Masuk" : "Daftar"}<Icon name="arrow" size={16} /></Link></div>
        <div className="auth-form-wrap">
          <div className="mobile-brand"><Brand /></div>
          <h1>{registering ? "Buat ruangmu." : "Kembali ke ruangmu."}</h1>
          <p className="auth-intro">{registering ? "Satu tempat untuk semua yang ingin kamu selesaikan." : "Tugasmu sudah menunggu. Lanjutkan dari langkah terakhir."}</p>
          <form action={action} aria-describedby={state.error ? "auth-error" : undefined}>
            <fieldset disabled={pending} className="auth-fields">
              {registering && <div className="field"><label htmlFor="name">Nama</label><input id="name" name="name" required maxLength={80} autoComplete="name" defaultValue={state.name} placeholder="Nama panggilanmu" /></div>}
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={state.email} placeholder="nama@email.com" /></div>
              <div className="field"><label htmlFor="password">Password</label>
                <div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={registering ? 12 : 1} maxLength={128} autoComplete={registering ? "new-password" : "current-password"} aria-describedby={registering ? "password-help" : undefined} placeholder={registering ? "Buat password yang kuat" : "Masukkan password"} /><button type="button" className="icon-button" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? "eye-off" : "eye"} size={19} /></button></div>
                {registering && <p id="password-help" className="field-help">Minimal 12 karakter. Coba gunakan kalimat yang mudah diingat.</p>}
              </div>
              {state.error && <p id="auth-error" role="alert" className="form-error">{state.error}</p>}
              <button type="submit" className="primary-button auth-submit">{pending ? "Memproses…" : registering ? "Buat akun" : "Masuk"}<Icon name="arrow" size={18} /></button>
            </fieldset>
          </form>
          <p className="auth-footnote"><Icon name="check" size={16} />Daftar tugasmu hanya bisa diakses oleh akunmu.</p>
        </div>
        <p className="auth-panel-footer">Satu tugas pada satu waktu.</p>
      </section>
    </main>
  );
}
