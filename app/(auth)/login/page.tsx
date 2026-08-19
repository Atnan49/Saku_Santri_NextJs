"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend UI) & Atnan (Backend & Auth Logic)
// Deskripsi: Halaman Login Universal selaras dengan desain Buku Besar Digital.
// =========================================================================

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, LogIn, ShieldCheck, Loader2 } from "lucide-react";

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

          {error && <p data-testid="login-error-message" className="login-error">{error}</p>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Nomor Induk / ID Pengguna */}
            <div className="login-field">
              <label className="login-label" htmlFor="id_pengguna">
                Nomor Induk / ID Pengguna / Username
              </label>
              <div className="login-input-wrap">
                <User className="login-input-icon" size={20} />
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
                  data-testid="login-username-input"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div className="login-field">
              <label className="login-label" htmlFor="kata_sandi">
                Kata Sandi
              </label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" size={20} />
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
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <hr className="login-divider" />

            <button type="submit" className="login-btn" disabled={loading} data-testid="login-submit-button">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>OTORISASI MASUK</span>
                  <LogIn size={18} />
                </>
              )}
            </button>

            <div className="login-koneksi">
              <ShieldCheck size={18} style={{ color: "#396759" }} />
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

