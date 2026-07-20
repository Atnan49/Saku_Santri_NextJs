'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getDatabaseState, 
  saveDatabaseState, 
  type DatabaseState 
} from '../../db/store';
import type { 
  Pembayaran 
} from '../../db/schema';
import { 
  Smartphone, 
  Bell, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  ArrowLeft 
} from 'lucide-react';

export default function WaliPage() {
  const router = useRouter();

  // DB State
  const [db, setDb] = useState<DatabaseState>({
    siswa: [],
    wali: [],
    waliSiswa: [],
    kelas: [],
    tahunAjaran: [],
    jenisTagihan: [],
    tarifKelas: [],
    tagihan: [],
    pembayaran: [],
    notifikasi: []
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  // Wali Murid state
  const [activeWaliId, setActiveWaliId] = useState<string>('w-1'); // Default to Abah Hasan
  const [activeSiswaId, setActiveSiswaId] = useState<string>('s-1'); // Default to Ahmad Fauzi
  const [isWaliLoggedIn, setIsWaliLoggedIn] = useState<boolean>(true);
  const [waliPhoneInput, setWaliPhoneInput] = useState<string>('081234567890');
  
  // Wali upload bukti form
  const [uploadTagihanId, setUploadTagihanId] = useState<string>('');
  const [uploadNominal, setUploadNominal] = useState<number>(0);
  const [uploadBukti, setUploadBukti] = useState<string>('');
  const [uploadTanggal, setUploadTanggal] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');

  // Receipt modal state
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Pembayaran | null>(null);

  useEffect(() => {
    setDb(getDatabaseState());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      saveDatabaseState(db);
    }
  }, [db, hasLoaded]);

  // Helper formatting IDR currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Wali Login Action
  const handleWaliLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = db.wali.find(w => w.noHp === waliPhoneInput || w.email === waliPhoneInput);
    if (matched) {
      setActiveWaliId(matched.id);
      const children = db.waliSiswa.filter(ws => ws.waliId === matched.id);
      if (children.length > 0) {
        setActiveSiswaId(children[0].siswaId);
      }
      setIsWaliLoggedIn(true);
    } else {
      alert('Akun Wali Murid tidak ditemukan! Masukkan HP: 081234567890 atau email: hasan@example.com untuk mencoba.');
    }
  };

  // Wali Upload Bukti Action
  const handleWaliUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTagihanId || !uploadNominal || !uploadTanggal) {
      alert('Lengkapi semua field!');
      return;
    }

    const t = db.tagihan.find(x => x.id === uploadTagihanId);
    if (!t) return;

    const newPemId = 'p-' + Math.random().toString(36).substring(2, 9);
    const newPem: Pembayaran = {
      id: newPemId,
      tagihanId: uploadTagihanId,
      nominalDibayar: uploadNominal,
      buktiUrl: uploadBukti || 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&auto=format&fit=crop&q=60',
      tanggalTransfer: uploadTanggal,
      status: 'pending'
    };

    const updatedTagihans = db.tagihan.map(x => {
      if (x.id === uploadTagihanId) {
        return { ...x, status: 'menunggu_verifikasi' as const };
      }
      return x;
    });

    setDb(prev => ({
      ...prev,
      pembayaran: [...prev.pembayaran, newPem],
      tagihan: updatedTagihans
    }));

    setUploadSuccessMsg('Bukti transfer berhasil diunggah! Menunggu verifikasi admin.');
    setUploadTagihanId('');
    setUploadNominal(0);
    setUploadBukti('');
    setUploadTanggal('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#E5E5EA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Phone Frame container */}
      <div className="phone-frame animate-fade-in">
        {/* Notch */}
        <div className="phone-notch"></div>

        {/* Top iOS Status bar */}
        <div className="phone-header">
          <span style={{ fontSize: '11px', fontWeight: 600 }}>17:13</span>
          <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
            <span>LTE</span>
            <span style={{ width: '14px', height: '8px', border: '1px solid #000000', display: 'inline-block', borderRadius: '2px', position: 'relative' }}>
              <span style={{ width: '10px', height: '4px', backgroundColor: '#000000', display: 'block', margin: '1px' }}></span>
            </span>
          </div>
        </div>

        {/* iOS body screen container */}
        <div className="phone-screen">
          {!isWaliLoggedIn ? (
            // iOS Login
            <div className="flex-column-gap" style={{ justifyContent: 'center', height: '100%', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '14px', backgroundColor: 'var(--system-blue)', color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>S</div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Saku Santri Wali</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Portal tagihan iuran bulanan santri</p>
              </div>

              <form onSubmit={handleWaliLogin} className="ios-widget" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex-column-gap" style={{ gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>No WhatsApp / HP</label>
                  <input type="text" value={waliPhoneInput} onChange={(e) => setWaliPhoneInput(e.target.value)} className="apple-input" />
                </div>
                <div className="flex-column-gap" style={{ gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                  <input type="password" defaultValue="password123" className="apple-input" />
                </div>
                <button type="submit" className="apple-btn apple-btn-primary" style={{ padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}>Masuk Portal</button>
              </form>

              <div className="ios-widget" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>💡 Akun Demo:</p>
                <p style={{ marginTop: '2px' }}>- WhatsApp: 081234567890 (Abah Hasan)</p>
                <p>- WhatsApp: 089876543210 (Ummi Aminah)</p>
              </div>

              <button onClick={() => router.push('/')} className="apple-btn" style={{ fontSize: '12px', gap: '6px' }}>
                <ArrowLeft size={14} /> Kembali ke Gerbang Utama
              </button>
            </div>
          ) : (
            // iOS Dashboard
            <>
              {/* Wali header */}
              <div className="flex-row-between">
                <div className="flex-row-gap">
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--system-gray-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    {db.wali.find(w => w.id === activeWaliId)?.nama[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Selamat datang,</p>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold' }}>{db.wali.find(w => w.id === activeWaliId)?.nama}</h3>
                  </div>
                </div>
                <button className="apple-btn" onClick={() => setIsWaliLoggedIn(false)} style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--system-red)' }}>Log Out</button>
              </div>

              {/* Child Switcher Selector Pills */}
              <div className="flex-column-gap" style={{ gap: '4px' }}>
                <p style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>PILIH SANTRI</p>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {db.waliSiswa.filter(ws => ws.waliId === activeWaliId).map(rel => {
                    const s = db.siswa.find(x => x.id === rel.siswaId);
                    if (!s) return null;
                    const active = s.id === activeSiswaId;
                    return (
                      <button 
                        key={s.id} 
                        onClick={() => { setActiveSiswaId(s.id); setUploadSuccessMsg(''); }}
                        className="apple-btn" 
                        style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '20px', backgroundColor: active ? 'var(--system-blue-light)' : '#FFFFFF', color: active ? 'var(--system-blue)' : 'var(--text-primary)', borderColor: active ? 'var(--system-blue)' : 'var(--border-color)' }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{s.nama}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aggregated outstanding widget card */}
              {(() => {
                const child = db.siswa.find(x => x.id === activeSiswaId);
                const childUnpaid = db.tagihan
                  .filter(t => t.siswaId === activeSiswaId && (t.status === 'belum_bayar' || t.status === 'terlambat'))
                  .reduce((acc, t) => acc + t.nominal, 0);
                
                return (
                  <div className="ios-widget" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="flex-row-between">
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>REKAP TUNGGAKAN</span>
                      <span className="badge badge-success" style={{ textTransform: 'none' }}>{child?.nama}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Belum Dibayar</p>
                      <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px' }}>{formatRupiah(childUnpaid)}</p>
                    </div>
                    {childUnpaid > 0 ? (
                      <p style={{ fontSize: '10px', color: 'var(--system-orange)', fontWeight: 600 }} className="flex-row-gap"><AlertTriangle size={12} /> Segera lunasi kewajiban iuran.</p>
                    ) : (
                      <p style={{ fontSize: '10px', color: 'var(--system-green)', fontWeight: 600 }} className="flex-row-gap"><CheckCircle size={12} /> Semua tagihan lunas. Syukron.</p>
                    )}
                  </div>
                );
              })()}

              {/* Bills List Section */}
              <div className="flex-column-gap" style={{ gap: '8px' }}>
                <p style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>DAFTAR TAGIHAN</p>
                
                {db.tagihan.filter(t => t.siswaId === activeSiswaId).map(tag => {
                  const jt = db.jenisTagihan.find(x => x.id === tag.jenisTagihanId);
                  const payment = db.pembayaran.filter(p => p.tagihanId === tag.id).reverse()[0];
                  return (
                    <div key={tag.id} className="ios-widget flex-row-between" style={{ padding: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '12px', fontWeight: 'bold' }}>{jt?.nama}</h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Periode: {tag.periode} | Tempo: {tag.jatuhTempo}</p>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{formatRupiah(tag.nominal)}</p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        {tag.status === 'belum_bayar' && (
                          <button onClick={() => { setUploadTagihanId(tag.id); setUploadNominal(tag.nominal); setUploadSuccessMsg(''); }} className="apple-btn apple-btn-primary" style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>Bayar</button>
                        )}
                        {tag.status === 'menunggu_verifikasi' && (
                          <span className="badge badge-warning">Verifikasi</span>
                        )}
                        {tag.status === 'terlambat' && (
                          <div className="flex-column-gap" style={{ alignItems: 'flex-end', gap: '4px' }}>
                            <span className="badge badge-danger">Terlambat</span>
                            <button onClick={() => { setUploadTagihanId(tag.id); setUploadNominal(tag.nominal); setUploadSuccessMsg(''); }} className="apple-btn" style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', color: 'var(--system-blue)' }}>Bayar</button>
                          </div>
                        )}
                        {tag.status === 'lunas' && (
                          <div className="flex-column-gap" style={{ alignItems: 'flex-end', gap: '4px' }}>
                            <span className="badge badge-success">Lunas</span>
                            {payment?.status === 'approved' && (
                              <button onClick={() => setActiveReceiptPayment(payment)} style={{ border: 'none', background: 'transparent', color: 'var(--system-blue)', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Slip</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {db.tagihan.filter(t => t.siswaId === activeSiswaId).length === 0 && (
                  <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)', padding: '12px 0' }}>Tidak ada tagihan aktif.</p>
                )}
              </div>

              {/* Upload Bukti Modal Card Sheet */}
              {uploadTagihanId && (
                <div className="ios-widget animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--system-blue)' }}>
                  <div className="flex-row-between">
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Unggah Bukti Transfer</span>
                    <button onClick={() => setUploadTagihanId('')} style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', fontSize: '11px' }}>Batal</button>
                  </div>

                  <form onSubmit={handleWaliUpload} className="flex-column-gap" style={{ gap: '8px' }}>
                    <div className="flex-column-gap" style={{ gap: '2px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nominal Bayar</label>
                      <input type="number" value={uploadNominal} onChange={(e) => setUploadNominal(Number(e.target.value))} className="apple-input" />
                    </div>
                    <div className="flex-column-gap" style={{ gap: '2px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Tanggal Transfer</label>
                      <input type="date" value={uploadTanggal} onChange={(e) => setUploadTanggal(e.target.value)} className="apple-input" />
                    </div>
                    <div className="flex-column-gap" style={{ gap: '2px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Foto Slip (URL Gambar)</label>
                      <input type="text" placeholder="Kosongkan untuk demo slip otomatis" value={uploadBukti} onChange={(e) => setUploadBukti(e.target.value)} className="apple-input" />
                    </div>
                    <button type="submit" className="apple-btn apple-btn-primary" style={{ padding: '8px', borderRadius: '8px', fontWeight: 'bold', marginTop: '4px' }}>Kirim Bukti Bayar</button>
                  </form>
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="ios-widget" style={{ backgroundColor: 'var(--system-green-light)', border: '1px solid var(--system-green)', color: 'var(--system-green)', textAlign: 'center', fontSize: '11px' }}>
                  {uploadSuccessMsg}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom iOS Navigation Bar mockup */}
        <div className="phone-footer">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--system-blue)', cursor: 'pointer' }} onClick={() => router.push('/wali')}>
            <Smartphone size={16} />
            <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>Tagihan</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--system-gray-2)' }}>
            <Bell size={16} />
            <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>Notif</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--system-gray-2)', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <User size={16} />
            <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>Portal</span>
          </div>
        </div>
      </div>

      {/* Kwitansi Receipt overlay dialog */}
      {activeReceiptPayment && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content" style={{ maxWidth: '340px', gap: '16px', padding: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--system-green-light)', color: 'var(--system-green)', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>✓</div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Kwitansi Pembayaran SPP</h3>
              <p style={{ fontSize: '9px', color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>SAKU SANTRI PAYMENT GATEWAY</p>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div className="flex-row-between"><span style={{ color: 'var(--text-tertiary)' }}>No. Transaksi</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>REC-{activeReceiptPayment.id.toUpperCase()}</span></div>
              <div className="flex-row-between"><span style={{ color: 'var(--text-tertiary)' }}>Status</span><span style={{ fontWeight: 'bold', color: 'var(--system-green)' }}>Terverifikasi (Lunas)</span></div>
              <div className="flex-row-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Nama Santri</span>
                <span style={{ fontWeight: 600 }}>
                  {(() => {
                    const tag = db.tagihan.find(t => t.id === activeReceiptPayment.tagihanId);
                    return db.siswa.find(s => s.id === tag?.siswaId)?.nama;
                  })()}
                </span>
              </div>
              <div className="flex-row-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Deskripsi</span>
                <span style={{ fontWeight: 600 }}>
                  {(() => {
                    const tag = db.tagihan.find(t => t.id === activeReceiptPayment.tagihanId);
                    const jt = db.jenisTagihan.find(j => j.id === tag?.jenisTagihanId);
                    return `${jt?.nama} (${tag?.periode})`;
                  })()}
                </span>
              </div>
              <div className="flex-row-between"><span style={{ color: 'var(--text-tertiary)' }}>Tanggal Transfer</span><span style={{ fontWeight: 600 }}>{activeReceiptPayment.tanggalTransfer}</span></div>
              <div className="flex-row-between"><span style={{ color: 'var(--text-tertiary)' }}>Verified By</span><span style={{ fontWeight: 600 }}>{activeReceiptPayment.verifiedBy}</span></div>
            </div>

            <div className="flex-row-between" style={{ backgroundColor: 'var(--system-gray-6)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>TOTAL SETOR</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--system-green)' }}>{formatRupiah(activeReceiptPayment.nominalDibayar)}</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => window.print()} className="apple-btn apple-btn-primary" style={{ flex: 1, gap: '4px', fontSize: '12px', padding: '8px' }}>
                <Download size={13} /> Cetak Kwitansi
              </button>
              <button onClick={() => setActiveReceiptPayment(null)} className="apple-btn" style={{ fontSize: '12px', padding: '8px' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
