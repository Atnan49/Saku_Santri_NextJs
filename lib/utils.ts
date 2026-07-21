// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend) & Usva (Frontend)
// Deskripsi: Utilitas pembantu untuk format data yang konsisten di aplikasi.
//            Atnan & Usva bertanggung jawab menggunakan fungsi-fungsi ini di
//            halaman dashboard, invoice, dan laporan.
// =========================================================================

// Format angka ke format mata uang Rupiah Indonesia (Rp xx.xxx.xxx)
export function formatIDR(value: number | string | parseFloat): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : (value as number);
  if (isNaN(numericValue)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

// Format objek Date ke tanggal lokal Indonesia (misal: "21 Juli 2026")
export function formatDateIndonesian(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Helper untuk menggabungkan class CSS secara dinamis (biasanya digunakan di Tailwind / Vanilla CSS Modules)
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
