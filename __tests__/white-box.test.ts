import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// API Actions & Routes
import { PUT as putPembayaran } from '@/app/api/pembayaran/route';
import { POST as postTransaksi } from '@/app/api/saku/transaksi/route';

// Middleware
import middleware from '@/middleware';

// --- Mocks ---
vi.mock('next-auth/middleware', () => ({
  withAuth: (fn: any) => fn
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tagihan: { findUnique: vi.fn(), update: vi.fn() },
    pembayaran: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
    siswa: { findUnique: vi.fn(), update: vi.fn() },
    transaksiKoperasi: { create: vi.fn(), aggregate: vi.fn() },
    $transaction: vi.fn(async (callback) => {
      const txPrisma = {
        siswa: prisma.siswa,
        transaksiKoperasi: prisma.transaksiKoperasi,
        pembayaran: prisma.pembayaran,
        tagihan: prisma.tagihan,
        auditLog: prisma.auditLog,
      };
      return callback(txPrisma);
    }),
  }
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/whatsapp', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/actions/notification', () => ({
  createNotification: vi.fn().mockResolvedValue(true),
  notifyByRole: vi.fn().mockResolvedValue(true),
}));

describe('Pengujian WHITE BOX (Validasi Logika Internal & Struktur Kode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit 1: Middleware RBAC (Pengujian Cabang Logika Akses)', () => {
    const createReq = (path: string, role?: string) => {
      const req = new NextRequest(`http://localhost${path}`);
      (req as any).nextauth = { token: role ? { role } : null };
      return req;
    };

    it('Path 1: URL /admin -> Role != ADMIN -> Eksekusi percabangan redirect', () => {
      const res = (middleware as any)(createReq('/admin/dashboard', 'WALIMURID'));
      expect(res.status).toBe(307); 
      expect(res.headers.get('location')).toContain('error=UnauthorizedAdmin');
    });

    it('Path 2: URL /admin -> Role == ADMIN -> Melanjutkan akses', () => {
      const res = (middleware as any)(createReq('/admin/dashboard', 'ADMIN'));
      expect(res).toBeUndefined(); // Memastikan middleware melanjutkan next()
    });

    it('Path 3: URL /bendahara -> Role invalid -> Eksekusi percabangan redirect', () => {
      const res = (middleware as any)(createReq('/bendahara/laporan', 'KOPERASI'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('error=UnauthorizedBendahara');
    });

    it('Path 4: URL /bendahara -> Role valid -> Melanjutkan akses', () => {
      const res = (middleware as any)(createReq('/bendahara/laporan', 'BENDAHARA'));
      expect(res).toBeUndefined();
    });

    it('Path 5: URL /wali -> Role != WALIMURID -> Eksekusi percabangan redirect', () => {
      const res = (middleware as any)(createReq('/wali/dashboard', 'ADMIN'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('error=UnauthorizedWali');
    });

    it('Path 6: URL /wali -> Role == WALIMURID -> Melanjutkan akses', () => {
      const res = (middleware as any)(createReq('/wali/dashboard', 'WALIMURID'));
      expect(res).toBeUndefined();
    });

    it('Path 7: Rute URL lolos pengecekan proteksi -> Melanjutkan akses', () => {
      const res = (middleware as any)(createReq('/public/info', 'GUEST'));
      expect(res).toBeUndefined();
    });
  });

  describe('Unit 2: API Verifikasi Pembayaran (Database State Transition)', () => {
    
    it('Path 1: User tidak terautentikasi -> Akses ditolak (401)', async () => {
      (getServerSession as any).mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT', body: JSON.stringify({ pembayaranId: '1', action: 'approve' }),
      });
      const res = await putPembayaran(req);
      expect(res.status).toBe(401);
    });

    it('Path 2: Validasi payload request gagal -> Bad Request (400)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } });
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT', body: JSON.stringify({ action: 'approve' }),
      });
      const res = await putPembayaran(req);
      expect(res.status).toBe(400);
    });

    it('Path 5: Role user bukan ADMIN/BENDAHARA -> Akses di tolak (403)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'wali1', role: 'WALIMURID' } });
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT', body: JSON.stringify({ pembayaranId: '1', action: 'approve' }),
      });
      const res = await putPembayaran(req);
      expect(res.status).toBe(403);
    });

    it('Path 3: Role ADMIN memverifikasi -> prisma.pembayaran.update dipanggil', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } });
      (prisma.pembayaran.findUnique as any).mockResolvedValue({
        id: '1', tagihanId: 't1', nominalDisetor: 50000, buktiUrl: '/bukti.jpg',
        tagihan: {
          status: 'MENUNGGU_VERIFIKASI_ADMIN', jenisTagihan: { name: 'SPP' },
          siswa: { name: 'S1', wali: { user: { phone: '08' } }, kelas: { name: 'X' } }
        }
      });
      
      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT', body: JSON.stringify({ pembayaranId: '1', action: 'approve' }),
      });
      await putPembayaran(req);
      
      // White Box: Mengecek apakah internal state diubah dengan benar
      expect(prisma.tagihan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'MENUNGGU_APPROVAL_BENDAHARA' })
        })
      );
    });

    it('Path 4: Role BENDAHARA approval final -> prisma.tagihan.update dipanggil (LUNAS)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'ben1', role: 'BENDAHARA' } });
      (prisma.pembayaran.findUnique as any).mockResolvedValue({
        id: '1', tagihanId: 't1', nominalDisetor: 500000, buktiUrl: '/bukti.jpg',
        tagihan: {
          id: 't1', status: 'MENUNGGU_APPROVAL_BENDAHARA', nominalAkhir: 500000, nominalTerbayar: 0,
          jenisTagihan: { name: 'SPP' },
          siswa: { name: 'S1', wali: { user: { phone: '08' } }, kelas: { name: 'X' } }
        }
      });

      const req = new NextRequest('http://localhost/api/pembayaran', {
        method: 'PUT', body: JSON.stringify({ pembayaranId: '1', action: 'approve' }),
      });
      await putPembayaran(req);
      
      // White Box: Mengecek apakah tagihan benar-benar dilunaskan di database
      expect(prisma.tagihan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'LUNAS' })
        })
      );
    });
  });

  describe('Unit 3: Modul Transaksi Koperasi (Database State Transition)', () => {

    it('Path 1: User tidak terautentikasi / role invalid -> Akses ditolak (403)', async () => {
      (getServerSession as any).mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/saku/transaksi', {
        method: 'POST', body: JSON.stringify({ nisn: '123', totalBelanja: 10000 }),
      });
      const res = await postTransaksi(req);
      expect(res.status).toBe(403);
    });

    it('Path 2: Validasi payload request gagal -> Bad Request (400)', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'kasir1', role: 'KOPERASI' } });
      const req = new NextRequest('http://localhost/api/saku/transaksi', {
        method: 'POST', body: JSON.stringify({ totalBelanja: 10000 }),
      });
      const res = await postTransaksi(req);
      expect(res.status).toBe(400);
    });

    it('Path 3: Nominal melebihi saldo -> Eksekusi rollback secara logika program', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'kasir1', role: 'KOPERASI' } });
      (prisma.siswa.findUnique as any).mockResolvedValue({
        id: 's1', nisn: '123', name: 'Siswa1', saldoSaku: 5000, limitHarian: 50000,
        wali: { user: { phone: '08' } }, kelas: { name: 'X' }
      });

      const req = new NextRequest('http://localhost/api/saku/transaksi', {
        method: 'POST', body: JSON.stringify({ nisn: '123', totalBelanja: 10000 }),
      });
      await postTransaksi(req);
      
      // White Box: Pastikan tidak ada aksi update saldo jika logic mendeteksi insufficient funds
      expect(prisma.siswa.update).not.toHaveBeenCalled();
    });

    it('Path 4: Saldo mencukupi -> prisma.siswa.update dipanggil secara atomik', async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: 'kasir1', role: 'KOPERASI' } });
      (prisma.siswa.findUnique as any).mockResolvedValue({
        id: 's1', nisn: '123', name: 'Siswa1', saldoSaku: 50000, limitHarian: 50000,
        wali: { user: { phone: '08' } }, kelas: { name: 'X' }
      });
      (prisma.transaksiKoperasi.aggregate as any).mockResolvedValue({ _sum: { totalBelanja: 0 } });
      (prisma.transaksiKoperasi.create as any).mockResolvedValue({ id: 'tx1' });
      (prisma.siswa.update as any).mockResolvedValue({ saldoSaku: 40000 });

      const req = new NextRequest('http://localhost/api/saku/transaksi', {
        method: 'POST', body: JSON.stringify({ nisn: '123', totalBelanja: 10000 }),
      });
      await postTransaksi(req);
      
      // White Box: Mengecek pemanggilan fungsi update database siswa
      expect(prisma.siswa.update).toHaveBeenCalled();
    });
  });
});
