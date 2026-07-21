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
// import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // No HP / Username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // TODO (Atnan): Panggil signIn NextAuth di sini.
    // const res = await signIn("credentials", {
    //   username: identifier,
    //   password,
    //   redirect: false,
    // });
    // if (res?.error) setError("Autentikasi gagal. Periksa kembali data Anda.");
    console.log("Login submitted:", { identifier, password });
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
          />
        </div>
        <button type="submit" className="login-btn">Masuk</button>
      </form>
    </div>
  );
}
