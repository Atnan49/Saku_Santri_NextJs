import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// API Routes
import { PUT as putPembayaran } from '@/app/api/pembayaran/route';
import { POST as postTransaksi } from '@/app/api/saku/transaksi/route';

// --- Mocks ---
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock minimal untuk menghindari error saat fungsi memanggil database
vi.mock('@/lib/prisma', () => ({
  prisma: {
    siswa: { findUnique: vi.fn() },
    pembayaran: { findUnique: vi.fn() },
    $transaction: vi.fn(async (callback) => {
      const txPrisma = {
        siswa: { findUnique: vi.fn() },
      };
      return callback(txPrisma);
    }),
  }
}));

describe('Pengujian BLACK BOX (Validasi Input & Output API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit 2: API Verifikasi Pembayaran', () => {
    
    it('Path 1: User tidak terautentikasi -> Akses ditolak (401)', async () => {
      (getServerSession as any).mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT',
        body: JSON.stringify({ pembayaranId: '1', action: 'approve' }),
      });
      const res = await putPembayaran(req);
      expect(res.status).toBe(401); // Hanya mengecek Output Status Code
    });

    it('Path 2: Validasi payload request gagal -> Bad Request (400)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } });
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' }), // pembayaranId disengaja kosong (Input tidak valid)
      });
      const res = await putPembayaran(req);
      expect(res.status).toBe(400); 
      const data = await res.json();
      expect(data.error).toContain('wajib diisi'); // Mengecek pesan error
    });

    it('Path 5: Role user bukan ADMIN/BENDAHARA -> Akses ditolak (403)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'wali1', role: 'WALIMURID' } });
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT', body: JSON.stringify({ pembayaranId: '1', action: 'approve' }),
      });
      const res = await putPembayaran(req);
      expect(res.status).toBe(403);
    });
  });

  describe('Unit 3: Modul Transaksi Koperasi', () => {
    
    it('Path 1: Kasir validasi form gagal / nominal kosong -> Bad Request (400)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'kasir1', role: 'KOPERASI' } });
      const req = new NextRequest('http://localhost/api/saku/transaksi', {
        method: 'POST', body: JSON.stringify({ nisn: '123' }), // totalBelanja disengaja kosong
      });
      const res = await postTransaksi(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('wajib diisi');
    });

    it('Path 2: ID Siswa tidak ditemukan -> Data Not Found', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'kasir1', role: 'KOPERASI' } });
      (prisma.siswa.findUnique as any).mockResolvedValue(null); // Simulasi DB kosong

      const req = new NextRequest('http://localhost/api/saku/transaksi', {
        method: 'POST', body: JSON.stringify({ nisn: '123', totalBelanja: 10000 }),
      });
      const res = await postTransaksi(req);
      const data = await res.json();
      
      // Black Box: Mengecek output json "success: false" dan message error
      expect(data.success).toBe(false);
      expect(data.message).toContain('tidak ditemukan');
    });
  });
});
