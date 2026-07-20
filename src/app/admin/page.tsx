'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getDatabaseState, 
  saveDatabaseState, 
  STORAGE_KEY,
  type DatabaseState 
} from '../../db/store';
import type { 
  Siswa, 
  Wali, 
  JenisTagihan, 
  Tagihan, 
  Notifikasi 
} from '../../db/schema';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle, 
  Bell, 
  Search, 
  Calendar, 
  Layers, 
  TrendingUp, 
  FileCheck, 
  Info,
  ArrowLeft
} from 'lucide-react';

export default function AdminPage() {
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
  const [adminTab, setAdminTab] = useState<'dashboard' | 'siswa_wali' | 'tagihan_master' | 'generate' | 'verifikasi' | 'notif' | 'log'>('dashboard');

  // Modals / Forms States
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [siswaFormData, setSiswaFormData] = useState({ id: '', nis: '', nama: '', kelasId: 'k-1', status: 'aktif' as any, diskonPersen: 0, diskonNominal: 0 });
  
  const [isWaliModalOpen, setIsWaliModalOpen] = useState(false);
  const [waliFormData, setWaliFormData] = useState({ id: '', nama: '', noHp: '', email: '', passwordHash: 'password123' });

  const [isRelasiModalOpen, setIsRelasiModalOpen] = useState(false);
  const [relasiFormData, setRelasiFormData] = useState({ waliId: 'w-1', siswaId: 's-1', relasi: 'Ayah' });

  const [isJenisTagihanModalOpen, setIsJenisTagihanModalOpen] = useState(false);
  const [jenisTagihanFormData, setJenisTagihanFormData] = useState({ id: '', nama: '', tipe: 'bulanan' as any, nominalDefault: 100000 });

  const [isTarifKelasModalOpen, setIsTarifKelasModalOpen] = useState(false);
  const [tarifKelasFormData, setTarifKelasFormData] = useState({ jenisTagihanId: 'jt-1', kelasId: 'k-1', nominal: 100000 });

  // Tagihan massal form
  const [genJenisTagihanId, setGenJenisTagihanId] = useState<string>('jt-1');
  const [genPeriode, setGenPeriode] = useState<string>('2026-08');
  const [genJatuhTempo, setGenJatuhTempo] = useState<string>('2026-08-10');
  const [genTarget, setGenTarget] = useState<'all' | 'kelas'>('all');
  const [genKelasId, setGenKelasId] = useState<string>('k-1');
  const [previewTagihan, setPreviewTagihan] = useState<{ siswaName: string; tagihanName: string; nominal: number }[]>([]);

  // Search filters
  const [siswaSearch, setSiswaSearch] = useState('');
  const [verifNotes, setVerifNotes] = useState<{ [pembayaranId: string]: string }>({});

  // Audit Logs simulation
  const [auditLogs, setAuditLogs] = useState<{ id: string; user: string; action: string; time: string }[]>([
    { id: '1', user: 'Bendahara Utama', action: 'Approved pembayaran tagihan Ahmad Fauzi Rp225.000', time: '2026-07-06 14:32:10' },
    { id: '2', user: 'Bendahara Utama', action: 'Approved pembayaran tagihan Siti Rahma Rp75.000', time: '2026-07-08 10:15:44' },
    { id: '3', user: 'Admin', action: 'Menambahkan Siswa Baru: Siti Rahma', time: '2026-07-08 09:00:00' }
  ]);

  useEffect(() => {
    setDb(getDatabaseState());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      saveDatabaseState(db);
    }
  }, [db, hasLoaded]);

  // Handle billing mass-generate preview
  useEffect(() => {
    const list: { siswaName: string; tagihanName: string; nominal: number }[] = [];
    const jt = db.jenisTagihan.find(j => j.id === genJenisTagihanId);
    if (!jt) return;

    db.siswa.forEach(sis => {
      if (genTarget === 'kelas' && sis.kelasId !== genKelasId) return;
      if (sis.status !== 'aktif') return;

      const customTarif = db.tarifKelas.find(t => t.jenisTagihanId === genJenisTagihanId && t.kelasId === sis.kelasId);
      const baseNominal = customTarif ? customTarif.nominal : jt.nominalDefault;

      let finalNominal = baseNominal;
      if (sis.diskonPersen > 0) {
        finalNominal = finalNominal * (1 - sis.diskonPersen / 100);
      }
      if (sis.diskonNominal > 0) {
        finalNominal = Math.max(0, finalNominal - sis.diskonNominal);
      }

      list.push({
        siswaName: sis.nama,
        tagihanName: jt.nama,
        nominal: finalNominal
      });
    });

    setPreviewTagihan(list);
  }, [genJenisTagihanId, genTarget, genKelasId, db]);

  // Formatting currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const logAction = (action: string) => {
    const newLog = {
      id: Math.random().toString(),
      user: 'Bendahara Utama',
      action,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // CRUD Handlers
  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (siswaFormData.id) {
      setDb(prev => ({
        ...prev,
        siswa: prev.siswa.map(s => s.id === siswaFormData.id ? { ...s, ...siswaFormData } : s)
      }));
      logAction(`Update data siswa: ${siswaFormData.nama} (NIS: ${siswaFormData.nis})`);
    } else {
      const newSiswa: Siswa = {
        ...siswaFormData,
        id: 's-' + (db.siswa.length + 1)
      };
      setDb(prev => ({
        ...prev,
        siswa: [...prev.siswa, newSiswa]
      }));
      logAction(`Menambahkan siswa baru: ${newSiswa.nama}`);
    }
    setIsSiswaModalOpen(false);
  };

  const handleSaveWali = (e: React.FormEvent) => {
    e.preventDefault();
    if (waliFormData.id) {
      setDb(prev => ({
        ...prev,
        wali: prev.wali.map(w => w.id === waliFormData.id ? { ...w, ...waliFormData } : w)
      }));
      logAction(`Update data wali: ${waliFormData.nama}`);
    } else {
      const newWali: Wali = {
        ...waliFormData,
        id: 'w-' + (db.wali.length + 1)
      };
      setDb(prev => ({
        ...prev,
        wali: [...prev.wali, newWali]
      }));
      logAction(`Menambahkan wali baru: ${newWali.nama}`);
    }
    setIsWaliModalOpen(false);
  };

  const handleSaveRelasi = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = db.waliSiswa.some(ws => ws.waliId === relasiFormData.waliId && ws.siswaId === relasiFormData.siswaId);
    if (exists) {
      alert('Relasi ini sudah ada!');
      return;
    }
    setDb(prev => ({
      ...prev,
      waliSiswa: [...prev.waliSiswa, relasiFormData]
    }));
    const s = db.siswa.find(x => x.id === relasiFormData.siswaId);
    const w = db.wali.find(x => x.id === relasiFormData.waliId);
    logAction(`Menghubungkan wali ${w?.nama} dengan siswa ${s?.nama} (${relasiFormData.relasi})`);
    setIsRelasiModalOpen(false);
  };

  const handleDeleteRelasi = (waliId: string, siswaId: string) => {
    setDb(prev => ({
      ...prev,
      waliSiswa: prev.waliSiswa.filter(ws => !(ws.waliId === waliId && ws.siswaId === siswaId))
    }));
    logAction(`Menghapus hubungan relasi wali-siswa`);
  };

  const handleSaveJenisTagihan = (e: React.FormEvent) => {
    e.preventDefault();
    if (jenisTagihanFormData.id) {
      setDb(prev => ({
        ...prev,
        jenisTagihan: prev.jenisTagihan.map(j => j.id === jenisTagihanFormData.id ? { ...j, ...jenisTagihanFormData } : j)
      }));
      logAction(`Update jenis tagihan: ${jenisTagihanFormData.nama}`);
    } else {
      const newJ: JenisTagihan = {
        ...jenisTagihanFormData,
        id: 'jt-' + (db.jenisTagihan.length + 1)
      };
      setDb(prev => ({
        ...prev,
        jenisTagihan: [...prev.jenisTagihan, newJ]
      }));
      logAction(`Menambahkan jenis tagihan baru: ${newJ.nama}`);
    }
    setIsJenisTagihanModalOpen(false);
  };

  const handleSaveTarifKelas = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = db.tarifKelas.some(t => t.jenisTagihanId === tarifKelasFormData.jenisTagihanId && t.kelasId === tarifKelasFormData.kelasId);
    if (exists) {
      setDb(prev => ({
        ...prev,
        tarifKelas: prev.tarifKelas.map(t => (t.jenisTagihanId === tarifKelasFormData.jenisTagihanId && t.kelasId === tarifKelasFormData.kelasId) ? tarifKelasFormData : t)
      }));
    } else {
      setDb(prev => ({
        ...prev,
        tarifKelas: [...prev.tarifKelas, tarifKelasFormData]
      }));
    }
    const k = db.kelas.find(x => x.id === tarifKelasFormData.kelasId);
    logAction(`Override tarif kelas untuk ${k?.nama}`);
    setIsTarifKelasModalOpen(false);
  };

  const handleGenerateTagihan = () => {
    const listToCreate: Tagihan[] = [];
    const jt = db.jenisTagihan.find(j => j.id === genJenisTagihanId);
    if (!jt) return;

    db.siswa.forEach(sis => {
      if (genTarget === 'kelas' && sis.kelasId !== genKelasId) return;
      if (sis.status !== 'aktif') return;

      const isDup = db.tagihan.some(t => t.siswaId === sis.id && t.jenisTagihanId === genJenisTagihanId && t.periode === genPeriode);
      if (isDup) return;

      const customTarif = db.tarifKelas.find(t => t.jenisTagihanId === genJenisTagihanId && t.kelasId === sis.kelasId);
      const baseNominal = customTarif ? customTarif.nominal : jt.nominalDefault;

      let finalNominal = baseNominal;
      if (sis.diskonPersen > 0) {
        finalNominal = finalNominal * (1 - sis.diskonPersen / 100);
      }
      if (sis.diskonNominal > 0) {
        finalNominal = Math.max(0, finalNominal - sis.diskonNominal);
      }

      listToCreate.push({
        id: 't-' + Math.random().toString(36).substring(2, 9),
        siswaId: sis.id,
        jenisTagihanId: genJenisTagihanId,
        periode: genPeriode,
        nominal: finalNominal,
        status: 'belum_bayar',
        jatuhTempo: genJatuhTempo
      });
    });

    if (listToCreate.length === 0) {
      alert('Tidak ada tagihan baru yang di-generate.');
      return;
    }

    setDb(prev => ({
      ...prev,
      tagihan: [...prev.tagihan, ...listToCreate]
    }));

    const newNotifs: Notifikasi[] = [];
    listToCreate.forEach(tag => {
      const waliRel = db.waliSiswa.filter(ws => ws.siswaId === tag.siswaId);
      const sis = db.siswa.find(s => s.id === tag.siswaId);
      
      waliRel.forEach(wr => {
        newNotifs.push({
          id: 'n-' + Math.random().toString(36).substring(2, 9),
          waliId: wr.waliId,
          tipe: 'tagihan_baru',
          pesan: `[Saku Santri] Tagihan baru terbit untuk anak Anda *${sis?.nama}*. Detail: ${jt.nama} periode ${tag.periode} sebesar *${formatRupiah(tag.nominal)}*. Jatuh tempo: ${tag.jatuhTempo}.`,
          statusKirim: 'sent',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      });
    });

    setDb(prev => ({
      ...prev,
      notifikasi: [...prev.notifikasi, ...newNotifs]
    }));

    logAction(`Berhasil men-generate ${listToCreate.length} tagihan ${jt.nama} untuk periode ${genPeriode}`);
    alert(`Berhasil generate ${listToCreate.length} tagihan baru.`);
  };

  const handleSendReminder = (tagihanId: string) => {
    const t = db.tagihan.find(x => x.id === tagihanId);
    if (!t) return;
    const sis = db.siswa.find(x => x.id === t.siswaId);
    const jt = db.jenisTagihan.find(x => x.id === t.jenisTagihanId);
    const waliRel = db.waliSiswa.filter(ws => ws.siswaId === t.siswaId);

    if (waliRel.length === 0) {
      alert('Siswa ini belum dihubungkan ke Wali mana pun!');
      return;
    }

    const newNotifs: Notifikasi[] = [];
    waliRel.forEach(wr => {
      newNotifs.push({
        id: 'n-' + Math.random().toString(36).substring(2, 9),
        waliId: wr.waliId,
        tipe: 'reminder',
        pesan: `[REMINDER Saku Santri] Mengingatkan tagihan ${jt?.nama} anak Anda *${sis?.nama}* sebesar *${formatRupiah(t.nominal)}* saat ini statusnya *${t.status === 'terlambat' ? 'TERLAMBAT' : 'BELUM LUNAS'}*.`,
        statusKirim: 'sent',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    });

    setDb(prev => ({
      ...prev,
      notifikasi: [...prev.notifikasi, ...newNotifs]
    }));

    alert(`Simulasi pengingat WhatsApp berhasil dikirim.`);
    logAction(`Mengirim WhatsApp Reminder tagihan ${jt?.nama} untuk siswa ${sis?.nama}`);
  };

  const handleApprovePayment = (pemId: string) => {
    const pem = db.pembayaran.find(p => p.id === pemId);
    if (!pem) return;

    const updatedPayments = db.pembayaran.map(p => {
      if (p.id === pemId) {
        return {
          ...p,
          status: 'approved' as const,
          catatanAdmin: verifNotes[pemId] || 'Bukti transfer valid dan diterima.',
          verifiedBy: 'Bendahara Utama',
          verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 10)
        };
      }
      return p;
    });

    const updatedTagihans = db.tagihan.map(t => {
      if (t.id === pem.tagihanId) {
        return { ...t, status: 'lunas' as const };
      }
      return t;
    });

    const t = db.tagihan.find(x => x.id === pem.tagihanId);
    const sis = db.siswa.find(x => x.id === t?.siswaId);
    const jt = db.jenisTagihan.find(x => x.id === t?.jenisTagihanId);
    const waliRel = db.waliSiswa.filter(ws => ws.siswaId === t?.siswaId);
    const newNotifs: Notifikasi[] = [];

    waliRel.forEach(wr => {
      newNotifs.push({
        id: 'n-' + Math.random().toString(36).substring(2, 9),
        waliId: wr.waliId,
        tipe: 'konfirmasi_diterima',
        pesan: `[Saku Santri] Pembayaran tagihan ${jt?.nama} anak Anda *${sis?.nama}* sebesar *${formatRupiah(pem.nominalDibayar)}* TERVERIFIKASI & LUNAS.`,
        statusKirim: 'sent',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    });

    setDb(prev => ({
      ...prev,
      pembayaran: updatedPayments,
      tagihan: updatedTagihans,
      notifikasi: [...prev.notifikasi, ...newNotifs]
    }));

    logAction(`Verifikasi diterima: Pembayaran tagihan ${jt?.nama} - ${sis?.nama} senilai ${formatRupiah(pem.nominalDibayar)}`);
  };

  const handleRejectPayment = (pemId: string) => {
    const pem = db.pembayaran.find(p => p.id === pemId);
    if (!pem) return;

    const note = verifNotes[pemId] || 'Bukti transfer tidak terbaca / kurang jelas.';

    const updatedPayments = db.pembayaran.map(p => {
      if (p.id === pemId) {
        return {
          ...p,
          status: 'rejected' as const,
          catatanAdmin: note
        };
      }
      return p;
    });

    const updatedTagihans = db.tagihan.map(t => {
      if (t.id === pem.tagihanId) {
        return { ...t, status: 'belum_bayar' as const };
      }
      return t;
    });

    const t = db.tagihan.find(x => x.id === pem.tagihanId);
    const sis = db.siswa.find(x => x.id === t?.siswaId);
    const jt = db.jenisTagihan.find(x => x.id === t?.jenisTagihanId);
    const waliRel = db.waliSiswa.filter(ws => ws.siswaId === t?.siswaId);
    const newNotifs: Notifikasi[] = [];

    waliRel.forEach(wr => {
      newNotifs.push({
        id: 'n-' + Math.random().toString(36).substring(2, 9),
        waliId: wr.waliId,
        tipe: 'konfirmasi_ditolak',
        pesan: `[Saku Santri] Verifikasi bukti bayar ${jt?.nama} anak Anda *${sis?.nama}* sebesar *${formatRupiah(pem.nominalDibayar)}* DITOLAK. Catatan: "${note}".`,
        statusKirim: 'sent',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    });

    setDb(prev => ({
      ...prev,
      pembayaran: updatedPayments,
      tagihan: updatedTagihans,
      notifikasi: [...prev.notifikasi, ...newNotifs]
    }));

    logAction(`Verifikasi ditolak: Pembayaran tagihan ${jt?.nama} - ${sis?.nama}. Alasan: ${note}`);
  };

  // Calculations
  const statsTotalTagihan = db.tagihan.reduce((acc, t) => acc + t.nominal, 0);
  const statsTotalTerbayar = db.pembayaran
    .filter(p => p.status === 'approved')
    .reduce((acc, p) => acc + p.nominalDibayar, 0);
  const statsTotalTunggakan = db.tagihan
    .filter(t => t.status === 'belum_bayar' || t.status === 'terlambat')
    .reduce((acc, t) => acc + t.nominal, 0);
  const statsAntrianVerif = db.pembayaran.filter(p => p.status === 'pending').length;

  const filteredSiswa = db.siswa.filter(s => {
    const k = db.kelas.find(x => x.id === s.kelasId);
    return s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) || 
           s.nis.includes(siswaSearch) || 
           (k?.nama || '').toLowerCase().includes(siswaSearch.toLowerCase());
  });

  return (
    <div className="app-container">
      
      {/* Header bar */}
      <header className="header-bar">
        <div className="flex-row-gap">
          <button onClick={() => router.push('/')} className="apple-btn" style={{ padding: '6px' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--system-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold' }}>
            S
          </div>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: 600 }}>Saku Santri Admin</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Portal Pengelolaan SPP & Iuran Sekolah</p>
          </div>
        </div>

        <div className="flex-row-gap" style={{ fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: 'var(--system-gray-6)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--system-green)' }}></span>
          Tahun Ajaran: 2026/2027 Ganjil
        </div>
      </header>

      {/* Main Layout Workspace */}
      <main className="main-layout">
        
        <div className="window-desktop animate-fade-in">
          {/* macOS Title Bar */}
          <div className="window-titlebar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', marginRight: '16px' }}>
                <span className="window-control-dot dot-close" onClick={() => router.push('/')}></span>
                <span className="window-control-dot dot-minimize"></span>
                <span className="window-control-dot dot-maximize"></span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>SakuSantri Admin — macOS Finder Style</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
              Mode: Bendahara Utama (Simulasi)
            </span>
          </div>

          <div className="window-body">
            {/* Sidebar */}
            <aside className="sidebar">
              <div className="sidebar-section">
                <p className="sidebar-title">Utama</p>
                <nav className="flex-column-gap">
                  <div className={`sidebar-item ${adminTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminTab('dashboard')}>
                    <Layers size={14} style={{ color: 'var(--system-blue)' }} />
                    <span>Dashboard</span>
                  </div>
                  <div className={`sidebar-item ${adminTab === 'verifikasi' ? 'active' : ''}`} onClick={() => setAdminTab('verifikasi')}>
                    <FileCheck size={14} style={{ color: 'var(--system-green)' }} />
                    <span>Verifikasi</span>
                    {statsAntrianVerif > 0 && (
                      <span style={{ marginLeft: 'auto', backgroundColor: 'var(--system-red)', color: '#FFFFFF', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                        {statsAntrianVerif}
                      </span>
                    )}
                  </div>
                </nav>
              </div>

              <div className="sidebar-section">
                <p className="sidebar-title">Master & Tarif</p>
                <nav className="flex-column-gap">
                  <div className={`sidebar-item ${adminTab === 'siswa_wali' ? 'active' : ''}`} onClick={() => setAdminTab('siswa_wali')}>
                    <Users size={14} />
                    <span>Siswa & Wali Murid</span>
                  </div>
                  <div className={`sidebar-item ${adminTab === 'tagihan_master' ? 'active' : ''}`} onClick={() => setAdminTab('tagihan_master')}>
                    <BookOpen size={14} />
                    <span>Pengaturan Tarif</span>
                  </div>
                </nav>
              </div>

              <div className="sidebar-section">
                <p className="sidebar-title">Operasional</p>
                <nav className="flex-column-gap">
                  <div className={`sidebar-item ${adminTab === 'generate' ? 'active' : ''}`} onClick={() => setAdminTab('generate')}>
                    <Calendar size={14} />
                    <span>Generate Tagihan</span>
                  </div>
                  <div className={`sidebar-item ${adminTab === 'notif' ? 'active' : ''}`} onClick={() => setAdminTab('notif')}>
                    <Bell size={14} />
                    <span>Log WhatsApp</span>
                  </div>
                  <div className={`sidebar-item ${adminTab === 'log' ? 'active' : ''}`} onClick={() => setAdminTab('log')}>
                    <FileText size={14} />
                    <span>Audit Log</span>
                  </div>
                </nav>
              </div>

              <div className="ios-widget" style={{ padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="flex-row-gap" style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  <Info size={13} style={{ color: 'var(--system-blue)' }} />
                  <span>Database Lokal</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Semua data tersimpan secara lokal pada cache browser Anda.</p>
              </div>
            </aside>

            {/* Work Area Content */}
            <section className="content-area">
              
              {/* ADMIN TAB 1: DASHBOARD */}
              {adminTab === 'dashboard' && (
                <div className="flex-column-gap animate-slide-up" style={{ gap: '20px' }}>
                  <div className="flex-row-between">
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Ringkasan Keuangan Sekolah</h2>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Monitor penagihan SPP bulanan dan uang gedung siswa</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Atur ulang seluruh database simulasi?')) {
                          localStorage.removeItem(STORAGE_KEY);
                          window.location.reload();
                        }
                      }}
                      className="apple-btn"
                      style={{ color: 'var(--system-red)', borderColor: 'rgba(255, 59, 48, 0.2)' }}
                    >
                      Reset Database
                    </button>
                  </div>

                  <div className="stats-grid">
                    <div className="stats-card">
                      <div className="stats-card-header">
                        <span>TOTAL TAGIHAN TERBIT</span>
                        <span style={{ backgroundColor: 'var(--system-gray-6)', padding: '4px', borderRadius: '4px' }}><DollarSign size={12} /></span>
                      </div>
                      <p className="stats-card-value">{formatRupiah(statsTotalTagihan)}</p>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <span>PEMBAYARAN DITERIMA</span>
                        <span style={{ backgroundColor: 'var(--system-green-light)', color: 'var(--system-green)', padding: '4px', borderRadius: '4px' }}><CheckCircle size={12} /></span>
                      </div>
                      <p className="stats-card-value" style={{ color: 'var(--system-green)' }}>{formatRupiah(statsTotalTerbayar)}</p>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <span>TOTAL TUNGGAKAN SISWA</span>
                        <span style={{ backgroundColor: 'var(--system-red-light)', color: 'var(--system-red)', padding: '4px', borderRadius: '4px' }}><AlertTriangle size={12} /></span>
                      </div>
                      <p className="stats-card-value" style={{ color: 'var(--system-red)' }}>{formatRupiah(statsTotalTunggakan)}</p>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <span>ANTRIAN VERIFIKASI</span>
                        <span style={{ backgroundColor: 'var(--system-orange-light)', color: 'var(--system-orange)', padding: '4px', borderRadius: '4px' }}><FileCheck size={12} /></span>
                      </div>
                      <p className="stats-card-value" style={{ color: 'var(--system-orange)' }}>{statsAntrianVerif} Transaksi</p>
                    </div>
                  </div>

                  <div className="split-grid">
                    <div className="card-panel">
                      <div className="card-panel-header">
                        <h3 style={{ fontSize: '13px', fontWeight: 700 }} className="flex-row-gap">
                          <AlertTriangle size={15} style={{ color: 'var(--system-red)' }} />
                          Tunggakan SPP Terbesar
                        </h3>
                      </div>
                      <div className="flex-column-gap">
                        {db.tagihan.filter(t => t.status === 'terlambat' || t.status === 'belum_bayar').slice(0, 5).map(tag => {
                          const s = db.siswa.find(x => x.id === tag.siswaId);
                          const jt = db.jenisTagihan.find(x => x.id === tag.jenisTagihanId);
                          return (
                            <div key={tag.id} className="flex-row-between" style={{ padding: '10px', backgroundColor: 'var(--system-gray-6)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div>
                                <p style={{ fontSize: '12px', fontWeight: 600 }}>{s?.nama}</p>
                                <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{jt?.nama} ({tag.periode})</p>
                                <button 
                                  onClick={() => handleSendReminder(tag.id)}
                                  className="apple-btn"
                                  style={{ padding: '2px 6px', fontSize: '9px', marginTop: '4px', color: 'var(--system-blue)' }}
                                >
                                  Kirim WA Reminder
                                </button>
                              </div>
                              <div className="text-right">
                                <p style={{ fontSize: '12px', fontWeight: 700 }}>{formatRupiah(tag.nominal)}</p>
                                <span className={`badge ${tag.status === 'terlambat' ? 'badge-danger' : 'badge-warning'}`}>
                                  {tag.status === 'terlambat' ? 'Terlambat' : 'Belum Bayar'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card-panel">
                      <div className="card-panel-header">
                        <h3 style={{ fontSize: '13px', fontWeight: 700 }} className="flex-row-gap">
                          <TrendingUp size={15} style={{ color: 'var(--system-blue)' }} />
                          Aktivitas Keuangan Terbaru
                        </h3>
                      </div>
                      <div className="flex-column-gap" style={{ gap: '12px' }}>
                        {auditLogs.slice(0, 4).map(log => (
                          <div key={log.id} style={{ fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div className="flex-row-between" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{log.user}</span>
                              <span>{log.time}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{log.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 2: SISWA & WALI MASTER */}
              {adminTab === 'siswa_wali' && (
                <div className="flex-column-gap animate-slide-up">
                  <div className="flex-row-between">
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Master Siswa & Wali Murid</h2>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Kelola data santri serta hubungannya dengan wali murid</p>
                    </div>
                    <div className="flex-row-gap">
                      <button className="apple-btn apple-btn-primary" onClick={() => setIsSiswaModalOpen(true)}>
                        <Plus size={13} /> Tambah Siswa
                      </button>
                      <button className="apple-btn" onClick={() => setIsWaliModalOpen(true)}>
                        <Plus size={13} /> Tambah Wali
                      </button>
                      <button className="apple-btn" onClick={() => setIsRelasiModalOpen(true)}>
                        Hubungkan Relasi
                      </button>
                    </div>
                  </div>

                  <div className="flex-row-gap" style={{ margin: '10px 0' }}>
                    <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <input 
                      type="text" 
                      placeholder="Cari siswa berdasarkan nama atau NIS..."
                      value={siswaSearch}
                      onChange={(e) => setSiswaSearch(e.target.value)}
                      className="apple-input"
                      style={{ maxWidth: '320px' }}
                    />
                  </div>

                  <div className="flex-column-gap" style={{ gap: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Data Siswa</h3>
                      <div className="finder-table-container">
                        <table className="finder-table">
                          <thead>
                            <tr>
                              <th>NIS</th>
                              <th>Nama Lengkap</th>
                              <th>Kelas</th>
                              <th>Status</th>
                              <th>Diskon/Beasiswa</th>
                              <th>Relasi Wali</th>
                              <th className="text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSiswa.map(s => {
                              const k = db.kelas.find(x => x.id === s.kelasId);
                              const ws = db.waliSiswa.filter(x => x.siswaId === s.id);
                              return (
                                <tr key={s.id}>
                                  <td style={{ fontWeight: 600 }}>{s.nis}</td>
                                  <td>{s.nama}</td>
                                  <td>{k?.nama}</td>
                                  <td>
                                    <span className={`badge ${s.status === 'aktif' ? 'badge-success' : 'badge-neutral'}`}>
                                      {s.status}
                                    </span>
                                  </td>
                                  <td>
                                    {s.diskonPersen > 0 && <span style={{ fontSize: '11px', color: 'var(--system-blue)', backgroundColor: 'var(--system-blue-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Diskon {s.diskonPersen}%</span>}
                                    {s.diskonNominal > 0 && <span style={{ fontSize: '11px', color: 'var(--system-blue)', backgroundColor: 'var(--system-blue-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Beasiswa {formatRupiah(s.diskonNominal)}</span>}
                                    {s.diskonPersen === 0 && s.diskonNominal === 0 && <span style={{ color: 'var(--text-tertiary)' }}>-</span>}
                                  </td>
                                  <td>
                                    <div className="flex-column-gap" style={{ gap: '4px' }}>
                                      {ws.map(w => {
                                        const parent = db.wali.find(x => x.id === w.waliId);
                                        return (
                                          <div key={w.waliId} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 600 }}>{parent?.nama}</span>
                                            <span style={{ color: 'var(--text-tertiary)' }}>({w.relasi})</span>
                                            <button onClick={() => handleDeleteRelasi(w.waliId, s.id)} style={{ border: 'none', background: 'transparent', color: 'var(--system-red)', fontSize: '10px', cursor: 'pointer' }}>Hapus</button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="text-right">
                                    <div className="flex-row-gap" style={{ justifyContent: 'flex-end' }}>
                                      <button 
                                        onClick={() => {
                                          setSiswaFormData(s);
                                          setIsSiswaModalOpen(true);
                                        }} 
                                        style={{ border: 'none', background: 'transparent', color: 'var(--system-blue)', cursor: 'pointer' }}
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (confirm(`Hapus data ${s.nama}?`)) {
                                            setDb(prev => ({ ...prev, siswa: prev.siswa.filter(x => x.id !== s.id) }));
                                            logAction(`Menghapus data siswa: ${s.nama}`);
                                          }
                                        }} 
                                        style={{ border: 'none', background: 'transparent', color: 'var(--system-red)', cursor: 'pointer' }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Data Wali Murid</h3>
                      <div className="finder-table-container">
                        <table className="finder-table">
                          <thead>
                            <tr>
                              <th>Nama Wali</th>
                              <th>WhatsApp</th>
                              <th>Email</th>
                              <th>Daftar Anak Asuh</th>
                              <th className="text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.wali.map(w => {
                              const ws = db.waliSiswa.filter(x => x.waliId === w.id);
                              return (
                                <tr key={w.id}>
                                  <td style={{ fontWeight: 600 }}>{w.nama}</td>
                                  <td>{w.noHp}</td>
                                  <td>{w.email}</td>
                                  <td>
                                    <div className="flex-row-gap" style={{ flexWrap: 'wrap' }}>
                                      {ws.map(rel => {
                                        const child = db.siswa.find(x => x.id === rel.siswaId);
                                        return (
                                          <span key={rel.siswaId} style={{ backgroundColor: 'var(--system-gray-5)', color: 'var(--text-primary)', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                                            {child?.nama} ({rel.relasi})
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="text-right">
                                    <div className="flex-row-gap" style={{ justifyContent: 'flex-end' }}>
                                      <button 
                                        onClick={() => {
                                          setWaliFormData(w);
                                          setIsWaliModalOpen(true);
                                        }}
                                        style={{ border: 'none', background: 'transparent', color: 'var(--system-blue)', cursor: 'pointer' }}
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (confirm(`Hapus wali ${w.nama}?`)) {
                                            setDb(prev => ({ ...prev, wali: prev.wali.filter(x => x.id !== w.id) }));
                                            logAction(`Menghapus wali murid: ${w.nama}`);
                                          }
                                        }}
                                        style={{ border: 'none', background: 'transparent', color: 'var(--system-red)', cursor: 'pointer' }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 3: PENGATURAN TARIF */}
              {adminTab === 'tagihan_master' && (
                <div className="flex-column-gap animate-slide-up">
                  <div className="flex-row-between">
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Pengaturan Jenis & Tarif Iuran</h2>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Kelola nominal bawaan iuran sekolah dan kustomisasi per kelas</p>
                    </div>
                    <div className="flex-row-gap">
                      <button className="apple-btn apple-btn-primary" onClick={() => setIsJenisTagihanModalOpen(true)}>
                        <Plus size={13} /> Tambah Jenis Tagihan
                      </button>
                      <button className="apple-btn" onClick={() => setIsTarifKelasModalOpen(true)}>
                        Kustomisasi Tarif Kelas
                      </button>
                    </div>
                  </div>

                  <div className="split-grid" style={{ marginTop: '16px' }}>
                    <div className="flex-column-gap">
                      <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Daftar Jenis Tagihan</h3>
                      <div className="finder-table-container">
                        <table className="finder-table">
                          <thead>
                            <tr>
                              <th>Nama Tagihan</th>
                              <th>Tipe</th>
                              <th>Nominal Default</th>
                              <th className="text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.jenisTagihan.map(j => (
                              <tr key={j.id}>
                                <td style={{ fontWeight: 600 }}>{j.nama}</td>
                                <td><span className="badge badge-neutral">{j.tipe}</span></td>
                                <td style={{ fontWeight: 600 }}>{formatRupiah(j.nominalDefault)}</td>
                                  <td className="text-right">
                                    <div className="flex-row-gap" style={{ justifyContent: 'flex-end' }}>
                                      <button onClick={() => { setJenisTagihanFormData(j); setIsJenisTagihanModalOpen(true); }} style={{ border: 'none', background: 'transparent', color: 'var(--system-blue)', cursor: 'pointer' }}><Edit3 size={13} /></button>
                                      <button 
                                        onClick={() => {
                                          if (confirm(`Hapus jenis tagihan ${j.nama}?`)) {
                                            setDb(prev => ({ ...prev, jenisTagihan: prev.jenisTagihan.filter(x => x.id !== j.id) }));
                                            logAction(`Menghapus jenis tagihan: ${j.nama}`);
                                          }
                                        }} 
                                        style={{ border: 'none', background: 'transparent', color: 'var(--system-red)', cursor: 'pointer' }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex-column-gap">
                      <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Tarif Kustom per Kelas (Overrides)</h3>
                      <div className="finder-table-container">
                        <table className="finder-table">
                          <thead>
                            <tr>
                              <th>Jenis Tagihan</th>
                              <th>Kelas</th>
                              <th>Tarif Override</th>
                              <th className="text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.tarifKelas.map((tk, idx) => {
                              const jt = db.jenisTagihan.find(x => x.id === tk.jenisTagihanId);
                              const k = db.kelas.find(x => x.id === tk.kelasId);
                              return (
                                <tr key={idx}>
                                  <td style={{ fontWeight: 600 }}>{jt?.nama}</td>
                                  <td>{k?.nama}</td>
                                  <td style={{ fontWeight: 700, color: 'var(--system-green)' }}>{formatRupiah(tk.nominal)}</td>
                                  <td className="text-right">
                                    <button 
                                      onClick={() => {
                                        setDb(prev => ({ ...prev, tarifKelas: prev.tarifKelas.filter((_, i) => i !== idx) }));
                                        logAction(`Menghapus tarif kustom per kelas`);
                                      }}
                                      style={{ border: 'none', background: 'transparent', color: 'var(--system-red)', cursor: 'pointer' }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 4: GENERATE TAGIHAN */}
              {adminTab === 'generate' && (
                <div className="flex-column-gap animate-slide-up">
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Generate Tagihan Otomatis</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Menerbitkan iuran secara massal untuk semua siswa aktif</p>
                  </div>

                  <div className="split-grid" style={{ marginTop: '16px', gridTemplateColumns: '1fr 2fr' }}>
                    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Pengaturan</h3>
                      
                      <div className="flex-column-gap" style={{ gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Jenis Tagihan</label>
                        <select value={genJenisTagihanId} onChange={(e) => setGenJenisTagihanId(e.target.value)} className="apple-input">
                          {db.jenisTagihan.map(j => (
                            <option key={j.id} value={j.id}>{j.nama}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-column-gap" style={{ gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Periode Penagihan</label>
                        <input type="text" placeholder="Contoh: 2026-08" value={genPeriode} onChange={(e) => setGenPeriode(e.target.value)} className="apple-input" />
                      </div>

                      <div className="flex-column-gap" style={{ gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Batas Jatuh Tempo</label>
                        <input type="date" value={genJatuhTempo} onChange={(e) => setGenJatuhTempo(e.target.value)} className="apple-input" />
                      </div>

                      <div className="flex-column-gap" style={{ gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Penerbitan</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setGenTarget('all')} className="apple-btn" style={{ flex: 1, backgroundColor: genTarget === 'all' ? 'var(--system-gray-5)' : '#FFFFFF' }}>Semua</button>
                          <button onClick={() => setGenTarget('kelas')} className="apple-btn" style={{ flex: 1, backgroundColor: genTarget === 'kelas' ? 'var(--system-gray-5)' : '#FFFFFF' }}>Per Kelas</button>
                        </div>
                      </div>

                      {genTarget === 'kelas' && (
                        <div className="flex-column-gap" style={{ gap: '4px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pilih Kelas</label>
                          <select value={genKelasId} onChange={(e) => setGenKelasId(e.target.value)} className="apple-input">
                            {db.kelas.map(k => (
                              <option key={k.id} value={k.id}>{k.nama}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button onClick={handleGenerateTagihan} className="apple-btn apple-btn-primary" style={{ padding: '10px', fontWeight: 'bold' }}>
                        Generate Tagihan & Kirim WA
                      </button>
                    </div>

                    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                      <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Preview Tagihan Massal</h3>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--system-blue)', backgroundColor: 'var(--system-blue-light)', padding: '2px 8px', borderRadius: '10px' }}>
                          {previewTagihan.length} Target Siswa
                        </span>
                      </div>

                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {previewTagihan.map((p, idx) => (
                          <div key={idx} className="flex-row-between" style={{ padding: '10px', backgroundColor: 'var(--system-gray-6)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                            <span style={{ fontWeight: 600 }}>{p.siswaName}</span>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{p.tagihanName}</span>
                              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{formatRupiah(p.nominal)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 5: VERIFIKASI */}
              {adminTab === 'verifikasi' && (
                <div className="flex-column-gap animate-slide-up">
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Antrian Verifikasi Bukti Pembayaran</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Konfirmasi status setoran dana wali murid berdasarkan slip transfer</p>
                  </div>

                  <div className="flex-column-gap" style={{ gap: '16px', marginTop: '10px' }}>
                    {db.pembayaran.filter(p => p.status === 'pending').map(pem => {
                      const t = db.tagihan.find(x => x.id === pem.tagihanId);
                      const s = db.siswa.find(x => x.id === t?.siswaId);
                      const k = db.kelas.find(x => x.id === s?.kelasId);
                      const jt = db.jenisTagihan.find(x => x.id === t?.jenisTagihanId);

                      return (
                        <div key={pem.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
                          <div className="flex-column-gap" style={{ gap: '6px' }}>
                            <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>Pending Verifikasi</span>
                            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{s?.nama}</h3>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>NIS: {s?.nis} | {k?.nama}</p>
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <p style={{ color: 'var(--text-secondary)' }}>Iuran: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{jt?.nama} ({t?.periode})</span></p>
                              <p style={{ color: 'var(--text-secondary)' }}>Tagihan: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatRupiah(t?.nominal || 0)}</span></p>
                              <p style={{ color: 'var(--text-secondary)' }}>Ditransfer: <span style={{ fontWeight: 700, color: 'var(--system-green)' }}>{formatRupiah(pem.nominalDibayar)}</span></p>
                              <p style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>Tgl Transfer: {pem.tanggalTransfer}</p>
                            </div>
                          </div>

                          <div style={{ backgroundColor: 'var(--system-gray-6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 'bold', marginBottom: '6px' }}>Bukti Slip Transfer</p>
                            <img src={pem.buktiUrl} alt="Transfer Slip" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', cursor: 'pointer', borderRadius: '4px' }} onClick={() => window.open(pem.buktiUrl)} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div className="flex-column-gap" style={{ gap: '4px' }}>
                              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Catatan Admin / Catatan Tolak</label>
                              <textarea 
                                placeholder="Catatan verifikasi..." 
                                value={verifNotes[pem.id] || ''}
                                onChange={(e) => setVerifNotes({ ...verifNotes, [pem.id]: e.target.value })}
                                className="apple-input" 
                                style={{ height: '60px', resize: 'none' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="apple-btn apple-btn-primary" onClick={() => handleApprovePayment(pem.id)} style={{ flex: 1 }}>Terima</button>
                              <button className="apple-btn" onClick={() => handleRejectPayment(pem.id)} style={{ color: 'var(--system-red)' }}>Tolak</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {db.pembayaran.filter(p => p.status === 'pending').length === 0 && (
                      <div style={{ padding: '30px', backgroundColor: 'var(--system-gray-6)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        Tidak ada pengajuan bukti bayar baru. Semua tagihan beres!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ADMIN TAB 6: NOTIFIKASI */}
              {adminTab === 'notif' && (
                <div className="flex-column-gap animate-slide-up">
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Log Gateway WhatsApp</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Catatan notifikasi billing yang terkirim ke wali murid</p>
                  </div>
                  <div className="card-panel">
                    <div className="flex-column-gap" style={{ gap: '12px' }}>
                      {db.notifikasi.slice().reverse().map(not => {
                        const w = db.wali.find(x => x.id === not.waliId);
                        return (
                          <div key={not.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                            <div className="flex-column-gap" style={{ flex: 1, gap: '4px' }}>
                              <div className="flex-row-gap">
                                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{w?.nama} ({w?.noHp})</span>
                                <span className={`badge ${not.tipe === 'tagihan_baru' ? 'badge-neutral' : not.tipe === 'reminder' ? 'badge-danger' : 'badge-success'}`}>
                                  {not.tipe.replace('_', ' ')}
                                </span>
                              </div>
                              <p style={{ backgroundColor: 'var(--system-gray-6)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{not.pesan}</p>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '11px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--system-green)', fontWeight: 'bold' }}>Terkirim</span>
                              <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{not.createdAt}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 7: LOG */}
              {adminTab === 'log' && (
                <div className="flex-column-gap animate-slide-up">
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Log Audit Aktivitas Keuangan</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Rekaman tindakan operator dalam memanipulasi data iuran</p>
                  </div>
                  <div className="finder-table-container">
                    <table className="finder-table">
                      <thead>
                        <tr>
                          <th>Waktu</th>
                          <th>Operator</th>
                          <th>Aksi Operasional</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(log => (
                          <tr key={log.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-tertiary)' }}>{log.time}</td>
                            <td style={{ fontWeight: 600 }}>{log.user}</td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </section>
          </div>
        </div>

      </main>

      {/* ================= MODALS & DIALOGS OVERLAYS ================= */}
      
      {/* 1. Modal Siswa */}
      {isSiswaModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{siswaFormData.id ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h3>
            <form onSubmit={handleSaveSiswa} className="flex-column-gap" style={{ gap: '12px' }}>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nomor Induk Siswa (NIS)</label>
                <input type="text" value={siswaFormData.nis} onChange={(e) => setSiswaFormData({ ...siswaFormData, nis: e.target.value })} required className="apple-input" />
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nama Lengkap</label>
                <input type="text" value={siswaFormData.nama} onChange={(e) => setSiswaFormData({ ...siswaFormData, nama: e.target.value })} required className="apple-input" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="flex-column-gap" style={{ flex: 1, gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Kelas</label>
                  <select value={siswaFormData.kelasId} onChange={(e) => setSiswaFormData({ ...siswaFormData, kelasId: e.target.value })} className="apple-input">
                    {db.kelas.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-column-gap" style={{ flex: 1, gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Status</label>
                  <select value={siswaFormData.status} onChange={(e) => setSiswaFormData({ ...siswaFormData, status: e.target.value as any })} className="apple-input">
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus</option>
                    <option value="pindah">Pindah</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="flex-column-gap" style={{ flex: 1, gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Diskon (%)</label>
                  <input type="number" value={siswaFormData.diskonPersen} onChange={(e) => setSiswaFormData({ ...siswaFormData, diskonPersen: Number(e.target.value) })} className="apple-input" />
                </div>
                <div className="flex-column-gap" style={{ flex: 1, gap: '2px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Beasiswa (Rp)</label>
                  <input type="number" value={siswaFormData.diskonNominal} onChange={(e) => setSiswaFormData({ ...siswaFormData, diskonNominal: Number(e.target.value) })} className="apple-input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsSiswaModalOpen(false)} className="apple-btn">Batal</button>
                <button type="submit" className="apple-btn apple-btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Wali */}
      {isWaliModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{waliFormData.id ? 'Edit Wali Murid' : 'Tambah Wali Murid Baru'}</h3>
            <form onSubmit={handleSaveWali} className="flex-column-gap" style={{ gap: '12px' }}>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nama Lengkap Wali</label>
                <input type="text" value={waliFormData.nama} onChange={(e) => setWaliFormData({ ...waliFormData, nama: e.target.value })} required className="apple-input" />
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>No WhatsApp</label>
                <input type="text" value={waliFormData.noHp} onChange={(e) => setWaliFormData({ ...waliFormData, noHp: e.target.value })} required className="apple-input" />
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={waliFormData.email} onChange={(e) => setWaliFormData({ ...waliFormData, email: e.target.value })} className="apple-input" />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsWaliModalOpen(false)} className="apple-btn">Batal</button>
                <button type="submit" className="apple-btn apple-btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Hubungkan Relasi */}
      {isRelasiModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Hubungkan Relasi Wali-Siswa</h3>
            <form onSubmit={handleSaveRelasi} className="flex-column-gap" style={{ gap: '12px' }}>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Pilih Wali Murid</label>
                <select value={relasiFormData.waliId} onChange={(e) => setRelasiFormData({ ...relasiFormData, waliId: e.target.value })} className="apple-input">
                  {db.wali.map(w => (
                    <option key={w.id} value={w.id}>{w.nama} ({w.noHp})</option>
                  ))}
                </select>
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Pilih Siswa</label>
                <select value={relasiFormData.siswaId} onChange={(e) => setRelasiFormData({ ...relasiFormData, siswaId: e.target.value })} className="apple-input">
                  {db.siswa.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} (NIS: {s.nis})</option>
                  ))}
                </select>
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Hubungan Keluarga</label>
                <select value={relasiFormData.relasi} onChange={(e) => setRelasiFormData({ ...relasiFormData, relasi: e.target.value })} className="apple-input">
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Paman/Bibi">Paman/Bibi</option>
                  <option value="Wali Lainnya">Wali Lainnya</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsRelasiModalOpen(false)} className="apple-btn">Batal</button>
                <button type="submit" className="apple-btn apple-btn-primary">Hubungkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Jenis Tagihan */}
      {isJenisTagihanModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{jenisTagihanFormData.id ? 'Edit Jenis Tagihan' : 'Tambah Jenis Tagihan'}</h3>
            <form onSubmit={handleSaveJenisTagihan} className="flex-column-gap" style={{ gap: '12px' }}>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nama Tagihan / Iuran</label>
                <input type="text" value={jenisTagihanFormData.nama} onChange={(e) => setJenisTagihanFormData({ ...jenisTagihanFormData, nama: e.target.value })} required className="apple-input" />
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Tipe Tagihan</label>
                <select value={jenisTagihanFormData.tipe} onChange={(e) => setJenisTagihanFormData({ ...jenisTagihanFormData, tipe: e.target.value as any })} className="apple-input">
                  <option value="bulanan">Bulanan</option>
                  <option value="tahunan">Tahunan</option>
                  <option value="insidental">Insidental</option>
                </select>
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nominal Default (Bawaan)</label>
                <input type="number" value={jenisTagihanFormData.nominalDefault} onChange={(e) => setJenisTagihanFormData({ ...jenisTagihanFormData, nominalDefault: Number(e.target.value) })} required className="apple-input" />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsJenisTagihanModalOpen(false)} className="apple-btn">Batal</button>
                <button type="submit" className="apple-btn apple-btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Tarif Override */}
      {isTarifKelasModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Atur Tarif Khusus per Kelas</h3>
            <form onSubmit={handleSaveTarifKelas} className="flex-column-gap" style={{ gap: '12px' }}>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Pilih Jenis Tagihan</label>
                <select value={tarifKelasFormData.jenisTagihanId} onChange={(e) => setTarifKelasFormData({ ...tarifKelasFormData, jenisTagihanId: e.target.value })} className="apple-input">
                  {db.jenisTagihan.map(j => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Pilih Target Kelas</label>
                <select value={tarifKelasFormData.kelasId} onChange={(e) => setTarifKelasFormData({ ...tarifKelasFormData, kelasId: e.target.value })} className="apple-input">
                  {db.kelas.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div className="flex-column-gap" style={{ gap: '2px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Nominal Tarif Kustom (Rp)</label>
                <input type="number" value={tarifKelasFormData.nominal} onChange={(e) => setTarifKelasFormData({ ...tarifKelasFormData, nominal: Number(e.target.value) })} required className="apple-input" />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsTarifKelasModalOpen(false)} className="apple-btn">Batal</button>
                <button type="submit" className="apple-btn apple-btn-primary">Terapkan Tarif</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
