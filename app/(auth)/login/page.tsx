"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend UI) & Atnan (Backend & Auth Logic)
// Deskripsi: Halaman Login Universal selaras dengan desain Buku Besar Digital.
// =========================================================================

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(
          res.error === "CredentialsSignin"
            ? "Login gagal. Periksa kembali data Anda."
            : res.error
        );
      } else if (res?.ok) {
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
    <div className="login-page">
        <div className="login-center">
          <div className="login-card">
            <div className="login-brand">
              <h1>Saku Santri</h1>
              <p>Sistem Administrasi Keuangan Beitul Arqom</p>
            </div>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Nomor Induk / ID Pengguna */}
              <div className="login-field">
                <label className="login-label" htmlFor="id_pengguna">
                  Nomor Induk / ID Pengguna / Username
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon material-symbols-outlined">badge</span>
                  <input
                    id="id_pengguna"
                    type="text"
                    className="login-input"
                    placeholder="Masukkan ID / No. HP / Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Kata Sandi */}
              <div className="login-field">
                <label className="login-label" htmlFor="kata_sandi">
                  Kata Sandi
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon material-symbols-outlined">lock</span>
                  <input
                    id="kata_sandi"
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <hr className="login-divider" />

              <button type="submit" className="login-btn" disabled={loading}>
                <span>{loading ? "Memproses..." : "Otorisasi Masuk"}</span>
                {!loading && (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    login
                  </span>
                )}
              </button>

              <div className="login-koneksi">
                <span className="material-symbols-outlined">verified_user</span>
                <span>Koneksi Terenkripsi</span>
              </div>
            </form>
          </div>
        </div>

        <footer className="login-footer">
          <span>V 2.4.1</span>
          <span>© 2026</span>
        </footer>
      </div>
  );
}

