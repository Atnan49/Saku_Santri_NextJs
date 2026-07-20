import type { Siswa, Wali, WaliSiswa, Kelas, TahunAjaran, JenisTagihan, TarifKelas, Tagihan, Pembayaran, Notifikasi } from './schema';

export interface DatabaseState {
  siswa: Siswa[];
  wali: Wali[];
  waliSiswa: WaliSiswa[];
  kelas: Kelas[];
  tahunAjaran: TahunAjaran[];
  jenisTagihan: JenisTagihan[];
  tarifKelas: TarifKelas[];
  tagihan: Tagihan[];
  pembayaran: Pembayaran[];
  notifikasi: Notifikasi[];
}


const SEED_TAHUN_AJARAN: TahunAjaran[] = [
  { id: 'ta-1', label: '2026/2027 Ganjil', isActive: true },
  { id: 'ta-2', label: '2025/2026 Genap', isActive: false }
];

const SEED_KELAS: Kelas[] = [
  { id: 'k-1', nama: 'Kelas 7-A (TK)', jenjang: 'TK', tahunAjaranId: 'ta-1' },
  { id: 'k-2', nama: 'Kelas 1-A (SD)', jenjang: 'SD', tahunAjaranId: 'ta-1' },
  { id: 'k-3', nama: 'Kelas 2-B (SD)', jenjang: 'SD', tahunAjaranId: 'ta-1' },
  { id: 'k-4', nama: 'Kelas 8-A (SMP)', jenjang: 'SMP', tahunAjaranId: 'ta-1' },
  { id: 'k-5', nama: 'Kelas 10-A (SMA)', jenjang: 'SMA', tahunAjaranId: 'ta-1' }
];

const SEED_WALI: Wali[] = [
  { id: 'w-1', nama: 'Abah Hasan', noHp: '081234567890', email: 'hasan@example.com', passwordHash: 'password123' },
  { id: 'w-2', nama: 'Ummi Aminah', noHp: '089876543210', email: 'aminah@example.com', passwordHash: 'password123' },
  { id: 'w-3', nama: 'Pak Joko', noHp: '085566778899', email: 'joko@example.com', passwordHash: 'password123' }
];

const SEED_SISWA: Siswa[] = [
  { id: 's-1', nis: '10001', nama: 'Ahmad Fauzi', kelasId: 'k-4', status: 'aktif', diskonPersen: 10, diskonNominal: 0 },
  { id: 's-2', nis: '10002', nama: 'Fatimah Az-Zahra', kelasId: 'k-2', status: 'aktif', diskonPersen: 0, diskonNominal: 50000 },
  { id: 's-3', nis: '10003', nama: 'Zainuddin', kelasId: 'k-4', status: 'aktif', diskonPersen: 0, diskonNominal: 0 },
  { id: 's-4', nis: '10004', nama: 'Siti Rahma', kelasId: 'k-1', status: 'aktif', diskonPersen: 50, diskonNominal: 0 } // TK beasiswa
];

const SEED_WALI_SISWA: WaliSiswa[] = [
  { waliId: 'w-1', siswaId: 's-1', relasi: 'Ayah' }, // Ahmad Fauzi is Abah Hasan's son
  { waliId: 'w-1', siswaId: 's-2', relasi: 'Ayah' }, // Fatimah Az-Zahra is also Abah Hasan's daughter
  { waliId: 'w-2', siswaId: 's-3', relasi: 'Ibu' },
  { waliId: 'w-3', siswaId: 's-4', relasi: 'Ayah' }
];

const SEED_JENIS_TAGIHAN: JenisTagihan[] = [
  { id: 'jt-1', nama: 'SPP Bulanan', tipe: 'bulanan', nominalDefault: 200000 },
  { id: 'jt-2', nama: 'Uang Gedung', tipe: 'tahunan', nominalDefault: 1500000 },
  { id: 'jt-3', nama: 'Paket Buku & Seragam', tipe: 'insidental', nominalDefault: 500000 }
];

const SEED_TARIF_KELAS: TarifKelas[] = [
  { jenisTagihanId: 'jt-1', kelasId: 'k-1', nominal: 150000 }, // TK SPP is Rp150.000
  { jenisTagihanId: 'jt-1', kelasId: 'k-4', nominal: 250000 }, // SMP SPP is Rp250.000
  { jenisTagihanId: 'jt-1', kelasId: 'k-5', nominal: 300000 }  // SMA SPP is Rp300.000
];

const SEED_TAGIHAN: Tagihan[] = [
  // Ahmad Fauzi (s-1), SMP SPP (jt-1, default 250k due to TarifKelas, 10% discount -> 225k)
  { id: 't-1', siswaId: 's-1', jenisTagihanId: 'jt-1', periode: '2026-07', nominal: 225000, status: 'lunas', jatuhTempo: '2026-07-10' },
  { id: 't-2', siswaId: 's-1', jenisTagihanId: 'jt-1', periode: '2026-08', nominal: 225000, status: 'belum_bayar', jatuhTempo: '2026-08-10' },
  
  // Fatimah (s-2), SD SPP (jt-1, default 200k, 50k discount -> 150k)
  { id: 't-3', siswaId: 's-2', jenisTagihanId: 'jt-1', periode: '2026-07', nominal: 150000, status: 'menunggu_verifikasi', jatuhTempo: '2026-07-10' },
  
  // Zainuddin (s-3), SMP SPP (jt-1, 250k)
  { id: 't-4', siswaId: 's-3', jenisTagihanId: 'jt-1', periode: '2026-07', nominal: 250000, status: 'terlambat', jatuhTempo: '2026-07-10' },

  // Siti Rahma (s-4), TK SPP (jt-1, default 150k, 50% discount -> 75k)
  { id: 't-5', siswaId: 's-4', jenisTagihanId: 'jt-1', periode: '2026-07', nominal: 75000, status: 'lunas', jatuhTempo: '2026-07-10' },
  
  // Ahmad Fauzi Uang Gedung (jt-2, 1.5M, partial payment test)
  { id: 't-6', siswaId: 's-1', jenisTagihanId: 'jt-2', periode: '2026', nominal: 1500000, status: 'belum_bayar', jatuhTempo: '2026-12-31' }
];

const SEED_PEMBAYARAN: Pembayaran[] = [
  {
    id: 'p-1',
    tagihanId: 't-1',
    nominalDibayar: 225000,
    buktiUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&auto=format&fit=crop&q=60', // Mock receipt image URL
    tanggalTransfer: '2026-07-05',
    status: 'approved',
    catatanAdmin: 'Lunas tepat waktu.',
    verifiedBy: 'Bendahara Utama',
    verifiedAt: '2026-07-06'
  },
  {
    id: 'p-2',
    tagihanId: 't-3',
    nominalDibayar: 150000,
    buktiUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&auto=format&fit=crop&q=60',
    tanggalTransfer: '2026-07-09',
    status: 'pending'
  },
  {
    id: 'p-3',
    tagihanId: 't-5',
    nominalDibayar: 75000,
    buktiUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&auto=format&fit=crop&q=60',
    tanggalTransfer: '2026-07-08',
    status: 'approved',
    verifiedBy: 'Bendahara Utama',
    verifiedAt: '2026-07-08'
  }
];

const SEED_NOTIFIKASI: Notifikasi[] = [
  { id: 'n-1', waliId: 'w-1', tipe: 'tagihan_baru', pesan: 'Tagihan baru SPP periode 2026-07 sebesar Rp225.000 untuk anak Anda Ahmad Fauzi telah diterbitkan.', statusKirim: 'sent', createdAt: '2026-07-01 08:00:00' },
  { id: 'n-2', waliId: 'w-2', tipe: 'reminder', pesan: 'PERINGATAN: Tagihan SPP 2026-07 untuk Zainuddin sebesar Rp250.000 telah melewati jatuh tempo.', statusKirim: 'sent', createdAt: '2026-07-11 09:00:00' }
];

export const STORAGE_KEY = 'sakusantri_db';

export function getDatabaseState(): DatabaseState {
  const initialState: DatabaseState = {
    siswa: SEED_SISWA,
    wali: SEED_WALI,
    waliSiswa: SEED_WALI_SISWA,
    kelas: SEED_KELAS,
    tahunAjaran: SEED_TAHUN_AJARAN,
    jenisTagihan: SEED_JENIS_TAGIHAN,
    tarifKelas: SEED_TARIF_KELAS,
    tagihan: SEED_TAGIHAN,
    pembayaran: SEED_PEMBAYARAN,
    notifikasi: SEED_NOTIFIKASI
  };

  if (typeof window === 'undefined') {
    return initialState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse database state, resetting to seed', e);
    }
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
}

export function saveDatabaseState(state: DatabaseState) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

