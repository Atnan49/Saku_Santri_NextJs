// app/(dashboard)/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { 
  Bell, 
  Search, 
  Plus, 
  AlertTriangle, 
  Filter, 
  Download, 
  FileText,
  CreditCard,
  CheckSquare,
  Settings,
  LayoutDashboard
} from "lucide-react";

export default async function AdminDashboardPage() {
  let totalTagihanAktif = { _sum: { nominalAkhir: null as any } };
  let berkasMenunggu = 0;
  let totalTunggakan = { _sum: { nominalAkhir: null as any } };
  let riwayatTransaksi: any[] = [];

  try {
    totalTagihanAktif = await prisma.tagihan.aggregate({
      _sum: { nominalAkhir: true },
      where: { status: "BELUM_BAYAR" }
    });

    berkasMenunggu = await prisma.pembayaran.count({
      where: { verifiedAt: null }
    });

    totalTunggakan = await prisma.tagihan.aggregate({
      _sum: { nominalAkhir: true },
      where: { status: "MENUNGGU_VERIFIKASI_ADMIN" }
    });

    // Query riwayat transaksi
    riwayatTransaksi = await prisma.pembayaran.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tagihan: {
          include: {
            siswa: {
              include: { kelas: true }
            },
            jenisTagihan: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Gagal mengambil data dashboard Prisma:", error);
  }

  const kuitansiTerakhir = riwayatTransaksi && riwayatTransaksi.length > 0 ? riwayatTransaksi[0] : null;

  const formatRupiah = (val: any) => {
    if (!val) return "0";
    const num = typeof val === "number" ? val : Number(val);
    return isNaN(num) ? "0" : new Intl.NumberFormat("id-ID").format(num);
  };

  // Helper untuk menentukan label & warna badge berdasarkan status riil
  const getStatusBadge = (item: any) => {
    const status = item.tagihan?.status || (item.approvedAt ? "LUNAS" : "MENUNGGU");

    switch (status) {
      case "LUNAS":
        return { label: "LUNAS", bg: "#B58A2A" };
      case "DITOLAK":
      case "REJECTED":
        return { label: "DITOLAK", bg: "#C53030" };
      case "MENUNGGU_VERIFIKASI_ADMIN":
      case "MENUNGGU_VERIFIKASI_BENDAHARA":
        return { label: "VERIFIKASI", bg: "#DD6B20" };
      default:
        return { label: status.replace(/_/g, " "), bg: "#801212" };
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FDFBF7", color: "#2D3748", fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: "256px", borderRight: "1px solid #E2E8F0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#FDFBF7", flexShrink: 0 }}>
        <div>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#1B4332", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "14px", fontFamily: "sans-serif" }}>
              SS
            </div>
            <h1 style={{ fontWeight: "bold", fontSize: "20px", color: "#1B4332", fontFamily: "sans-serif", margin: 0 }}>
              Saku Santri
            </h1>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", backgroundColor: "#1B4332", color: "white", borderRadius: "2px", fontFamily: "sans-serif", fontSize: "12px", fontWeight: "bold", letterSpacing: "0.05em" }}>
              <LayoutDashboard style={{ width: "16px", height: "16px" }} />
              DASHBOARD
            </a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#4A5568", borderRadius: "2px", fontFamily: "sans-serif", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em" }}>
              <CreditCard style={{ width: "16px", height: "16px" }} />
              TAGIHAN
            </a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#4A5568", borderRadius: "2px", fontFamily: "sans-serif", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em" }}>
              <CheckSquare style={{ width: "16px", height: "16px" }} />
              VERIFIKASI
            </a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#4A5568", borderRadius: "2px", fontFamily: "sans-serif", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em" }}>
              <FileText style={{ width: "16px", height: "16px" }} />
              LAPORAN
            </a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#4A5568", borderRadius: "2px", fontFamily: "sans-serif", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em" }}>
              <Settings style={{ width: "16px", height: "16px" }} />
              PENGATURAN
            </a>
          </nav>
        </div>

        {/* User Footer Profile */}
        <div style={{ paddingTop: "16px", borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "12px", fontFamily: "sans-serif" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#1B4332", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
            A
          </div>
          <div>
            <p style={{ fontSize: "10px", fontWeight: "bold", color: "#A0AEC0", margin: 0, textTransform: "uppercase" }}>ADMINISTRATOR</p>
            <p style={{ fontSize: "12px", fontWeight: "bold", color: "#2D3748", margin: 0 }}>Admin Utama</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header Bar */}
        <header style={{ height: "64px", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "sans-serif", flexShrink: 0 }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "0.05em", color: "#A0AEC0", margin: 0 }}>SISTEM KEUANGAN INSTITUSI</p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search style={{ width: "16px", height: "16px", color: "#A0AEC0", position: "absolute", left: "12px" }} />
              <input 
                type="text" 
                placeholder="Cari data..." 
                style={{ paddingLeft: "36px", paddingRight: "16px", paddingTop: "6px", paddingBottom: "6px", fontSize: "12px", border: "1px solid #CBD5E0", borderRadius: "2px", width: "256px", background: "transparent", outline: "none" }}
              />
            </div>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: "#718096" }}>
              <Bell style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px", overflowY: "auto" }}>
          
          {/* Header Title & Actions */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#1A202C", fontFamily: "sans-serif", margin: 0 }}>
                Buku Induk Harian
              </h2>
              <p style={{ fontSize: "12px", fontFamily: "sans-serif", color: "#718096", marginTop: "4px", marginBottom: 0 }}>
                Posisi Keuangan per {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", fontFamily: "sans-serif", fontSize: "12px", fontWeight: "bold" }}>
              <button style={{ padding: "10px 16px", border: "1px solid #1A202C", background: "transparent", color: "#1A202C", cursor: "pointer", letterSpacing: "0.05em" }}>
                VERIFIKASI ({berkasMenunggu})
              </button>
              <button style={{ padding: "10px 16px", backgroundColor: "#1B4332", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "0.05em" }}>
                <Plus style={{ width: "16px", height: "16px" }} /> BUAT TAGIHAN
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid #CBD5E0", backgroundColor: "white", fontFamily: "sans-serif" }}>
            <div style={{ padding: "24px", backgroundColor: "#FAF8F5", borderRight: "1px solid #CBD5E0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.05em", color: "#718096" }}>TOTAL TAGIHAN AKTIF</span>
                <CreditCard style={{ width: "16px", height: "16px", color: "#A0AEC0" }} />
              </div>
              <p style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "monospace", color: "#1A202C", marginTop: "16px", marginBottom: 0 }}>
                <span style={{ fontSize: "14px", color: "#718096" }}>Rp </span>
                {formatRupiah(totalTagihanAktif._sum.nominalAkhir)}
              </p>
            </div>

            <div style={{ padding: "24px", backgroundColor: "#FAF8F5", borderRight: "1px solid #CBD5E0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.05em", color: "#718096" }}>MENUNGGU VERIFIKASI</span>
                <FileText style={{ width: "16px", height: "16px", color: "#A0AEC0" }} />
              </div>
              <p style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "serif", color: "#1A202C", marginTop: "16px", marginBottom: 0 }}>
                {berkasMenunggu} <span style={{ fontSize: "18px", fontStyle: "italic", fontWeight: "normal" }}>Berkas</span>
              </p>
            </div>

            <div style={{ padding: "24px", backgroundColor: "#FFF8F7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.05em", color: "#C53030" }}>TOTAL TUNGGAKAN</span>
                <AlertTriangle style={{ width: "16px", height: "16px", color: "#E53E3E" }} />
              </div>
              <p style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "monospace", color: "#C53030", marginTop: "16px", marginBottom: 0 }}>
                <span style={{ fontSize: "14px", opacity: 0.7 }}>Rp </span>
                {formatRupiah(totalTunggakan._sum.nominalAkhir)}
              </p>
            </div>
          </div>

          {/* 2-Column Section (Table + Right Panel) */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "sans-serif" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Riwayat Transaksi</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "6px", border: "1px solid #CBD5E0", background: "white", cursor: "pointer" }}><Filter style={{ width: "14px", height: "14px" }} /></button>
                  <button style={{ padding: "6px", border: "1px solid #CBD5E0", background: "white", cursor: "pointer" }}><Download style={{ width: "14px", height: "14px" }} /></button>
                </div>
              </div>

              {/* Data Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #CBD5E0", backgroundColor: "white", fontFamily: "sans-serif", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F5F2EB", color: "#718096", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #CBD5E0", borderRight: "1px solid #CBD5E0" }}>SISWA</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #CBD5E0", borderRight: "1px solid #CBD5E0" }}>KELAS</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #CBD5E0", borderRight: "1px solid #CBD5E0" }}>JENIS TAGIHAN</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #CBD5E0", borderRight: "1px solid #CBD5E0" }}>NOMINAL</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #CBD5E0" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(riwayatTransaksi) && riwayatTransaksi.length > 0 ? (
                    riwayatTransaksi.map((item) => {
                      const badge = getStatusBadge(item);
                      return (
                        <tr key={item.id}>
                          <td style={{ padding: "12px", borderBottom: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>
                            <strong>{item.tagihan?.siswa?.name ?? "Tanpa Nama"}</strong>
                            <div style={{ fontSize: "10px", color: "#A0AEC0", fontFamily: "monospace" }}>
                              NISN: {item.tagihan?.siswa?.nisn ?? "-"}
                            </div>
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>{item.tagihan?.siswa?.kelas?.name ?? "-"}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>{item.tagihan?.jenisTagihan?.name ?? "-"}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0", fontFamily: "monospace", fontWeight: "bold" }}>
                            Rp {formatRupiah(item.tagihan?.nominalAkhir)}
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #E2E8F0" }}>
                            <span style={{ padding: "2px 8px", fontSize: "9px", fontWeight: 800, letterSpacing: "0.05em", color: "white", textTransform: "uppercase", backgroundColor: badge.bg }}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#A0AEC0", padding: "32px", fontStyle: "italic" }}>
                        Belum ada riwayat transaksi tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Right Widget Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "sans-serif" }}>
              <div style={{ border: "1px solid #CBD5E0", backgroundColor: "white", padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#A0AEC0", letterSpacing: "0.05em", marginBottom: "12px" }}>
                  KOLEKTIBILITAS BULAN INI
                </div>
                <div style={{ width: "128px", height: "128px", borderRadius: "50%", border: "8px solid #EDF2F7", borderTopColor: "#1B4332", borderRightColor: "#1B4332", borderBottomColor: "#1B4332", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", margin: "24px auto" }}>
                  <span style={{ fontSize: "24px", fontWeight: 900, fontFamily: "monospace" }}>-</span>
                  <span style={{ fontSize: "9px", color: "#A0AEC0", fontWeight: "bold" }}>TERCAPAI</span>
                </div>
              </div>

              <div style={{ border: "1px solid #CBD5E0", backgroundColor: "#FAF8F5", padding: "24px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#A0AEC0", letterSpacing: "0.05em", marginBottom: "12px" }}>
                  PRATINJAU KUITANSI TERAKHIR
                </div>
                <div style={{ borderBottom: "1px solid #CBD5E0", paddingBottom: "12px", marginBottom: "12px" }}>
                  <h5 style={{ margin: 0, fontFamily: "monospace", fontSize: "12px" }}>
                    {kuitansiTerakhir ? `#KW-${kuitansiTerakhir.id.slice(0, 8)}` : "#KW-EMPTY"}
                  </h5>
                </div>
                <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A0AEC0", fontSize: "10px" }}>DITERIMA DARI</span>
                    <strong>{kuitansiTerakhir?.tagihan?.siswa?.name ?? "-"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A0AEC0", fontSize: "10px" }}>PEMBAYARAN</span>
                    <span>{kuitansiTerakhir?.tagihan?.jenisTagihan?.name ?? "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}