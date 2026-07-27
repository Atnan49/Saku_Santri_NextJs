"use client";

// =========================================================================
// TANGGUNG JAWAB: Usva (Frontend) & Atnan (Backend/Logic)
// Deskripsi: Halaman Login Universal — selaras dengan desain Buku Besar Digital.
//            Wali Murid login dengan Nomor HP, Admin & Bendahara dengan Username.
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
        username: identifier,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Autentikasi gagal. Periksa kembali data Anda.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&family=Source+Serif+4:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

        .login-page {
          min-height: 100vh;
          background-color: #fdf9f1;
          font-family: 'IBM Plex Sans', sans-serif;
          color: #1c1c17;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Dot grid background */
        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #c0c8c4 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.35;
          pointer-events: none;
        }

        /* Vertical margin lines */
        .login-page::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, transparent calc(15% - 0.5px), #717975 calc(15% - 0.5px), #717975 calc(15% + 0.5px), transparent calc(15% + 0.5px)),
            linear-gradient(to right, transparent calc(85% - 0.5px), #717975 calc(85% - 0.5px), #717975 calc(85% + 0.5px), transparent calc(85% + 0.5px));
          opacity: 0.15;
          pointer-events: none;
        }

        .login-center {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          padding: 48px 24px;
        }

        .login-card {
          background: #ffffff;
          border: 1px solid #717975;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18);
          padding: 48px;
          position: relative;
        }

        /* Green top bar */
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: #154539;
        }

        .login-brand {
          text-align: center;
          margin-bottom: 48px;
        }

        .login-brand h1 {
          font-family: 'Source Serif 4', serif;
          font-size: 48px;
          line-height: 56px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1c1c17;
          margin: 0 0 12px 0;
        }

        .login-brand p {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #516071;
          border-top: 1px solid #c0c8c4;
          padding-top: 8px;
          display: inline-block;
        }

        .login-error {
          background: #ffdad6;
          color: #ba1a1a;
          font-size: 13px;
          padding: 10px 14px;
          margin-bottom: 20px;
          border: 1px solid #ba1a1a;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .login-label {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #404945;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #c0c8c4;
          display: flex;
          align-items: center;
          pointer-events: none;
          font-size: 20px;
        }

        .login-input {
          width: 100%;
          height: 48px;
          background: #fdf9f1;
          border: 1px solid #717975;
          color: #1c1c17;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          padding: 0 48px 0 48px;
          outline: none;
          transition: border-color 0.2s, border-width 0.2s;
          border-radius: 2px;
        }

        .login-input:focus {
          border-color: #154539;
          border-width: 2px;
        }

        .login-input::placeholder {
          color: #c0c8c4;
        }

        .login-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #717975;
          display: flex;
          align-items: center;
          padding: 4px;
          font-size: 20px;
          transition: color 0.2s;
        }

        .login-eye-btn:hover {
          color: #154539;
        }

        .login-forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .login-forgot a {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          color: #154539;
          text-decoration: none;
        }

        .login-forgot a:hover {
          text-decoration: underline;
        }

        .login-divider {
          border: none;
          border-top: 1px solid #c0c8c4;
          margin: 0;
        }

        .login-btn {
          width: 100%;
          height: 48px;
          background: #154539;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
          border-radius: 2px;
        }

        .login-btn:hover:not(:disabled) {
          background: #2f5d50;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-koneksi {
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #c0c8c4;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
        }

        .login-koneksi .material-symbols-outlined {
          font-size: 16px;
          color: #396759;
        }

        .login-footer {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          padding: 0 24px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #c0c8c4;
          padding-top: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: #717975;
        }
      `}</style>

      <div className="login-page">
        <div className="login-center">
          <div className="login-card">
            <div className="login-brand">
              <h1>Saku Santri</h1>
              <p>Sistem Administrasi Keuangan Bitul Arqom</p>
            </div>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Nomor Induk / ID Pengguna */}
              <div className="login-field">
                <label className="login-label" htmlFor="id_pengguna">
                  Nomor Induk / ID Pengguna
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon material-symbols-outlined">badge</span>
                  <input
                    id="id_pengguna"
                    type="text"
                    className="login-input"
                    placeholder="Masukkan ID Anda"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
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
                <div className="login-forgot">
                  <a href="#">Lupa Kata Sandi?</a>
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
    </>
  );
}
