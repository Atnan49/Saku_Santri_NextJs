export interface Siswa {
  id: string;
  nis: string;
  nama: string;
  kelasId: string;
  status: 'aktif' | 'lulus' | 'pindah';
  diskonPersen: number; // e.g., 10 for 10%
  diskonNominal: number; // e.g., 50000 for Rp50.000
}

export interface Wali {
  id: string;
  nama: string;
  noHp: string;
  email: string;
  passwordHash: string;
}

export interface WaliSiswa {
  waliId: string;
  siswaId: string;
  relasi: string; // e.g., "Ayah", "Ibu", "Wali"
}

export interface Kelas {
  id: string;
  nama: string; // e.g., "Kelas 1-A"
  jenjang: 'TK' | 'SD' | 'SMP' | 'SMA';
  tahunAjaranId: string;
}

export interface TahunAjaran {
  id: string;
  label: string; // e.g., "2026/2027 Ganjil"
  isActive: boolean;
}

export interface JenisTagihan {
  id: string;
  nama: string; // e.g., "SPP Bulanan", "Uang Gedung"
  tipe: 'bulanan' | 'tahunan' | 'insidental';
  nominalDefault: number;
}

export interface TarifKelas {
  jenisTagihanId: string;
  kelasId: string;
  nominal: number; // override default
}

export interface Tagihan {
  id: string;
  siswaId: string;
  jenisTagihanId: string;
  periode: string; // e.g., "2026-07" for SPP, or "2026 Uang Gedung"
  nominal: number; // nominal setelah dikurangi diskon siswa
  status: 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'terlambat';
  jatuhTempo: string; // YYYY-MM-DD
}

export interface Pembayaran {
  id: string;
  tagihanId: string;
  nominalDibayar: number;
  buktiUrl: string; // base64 or mockup URL image
  tanggalTransfer: string; // YYYY-MM-DD
  status: 'pending' | 'approved' | 'rejected';
  catatanAdmin?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Notifikasi {
  id: string;
  waliId: string;
  tipe: 'tagihan_baru' | 'reminder' | 'konfirmasi_diterima' | 'konfirmasi_ditolak' | 'broadcast';
  pesan: string;
  statusKirim: 'sent' | 'failed' | 'pending';
  createdAt: string;
}
