// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman Login Universal. Wali Murid login menggunakan Nomor HP,
//            sedangkan Admin & Bendahara menggunakan Username/Email.
//            - Usva: Mendesain antarmuka login bertema macOS/iOS Card yang indah
//                    dengan efek frosted glass, input field minimalis, dan validasi form.
//            - Atnan: Mengintegrasikan signIn dari `next-auth/react` untuk memicu
//                     proses login NextAuth dan menangani error autentikasi.
// =========================================================================

"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // No HP / Username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username: identifier.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        // NextAuth mengembalikan error message dari authorize()
        setError(res.error === "CredentialsSignin"
          ? "Login gagal. Periksa kembali data Anda."
          : res.error
        );
      } else if (res?.ok) {
        // Login berhasil — redirect ke halaman utama (root page akan mengarahkan ke dashboard)
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* 
        TODO (Usva): 
        1. Desain form login melayang dengan CSS glassmorphism.
        2. Terapkan visual bertema macOS/iOS (e.g. rounded border, smooth shadow).
      */}
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Saku Santri Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="identifier">Username / No HP</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Masukkan No HP atau Username"
            required
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
