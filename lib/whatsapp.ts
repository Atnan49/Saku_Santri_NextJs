// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend & Logic)
// Deskripsi: Helper untuk mengirim notifikasi WhatsApp menggunakan API pihak ketiga
//            (seperti Fonnte atau Wablas).
//            Atnan bertanggung jawab untuk:
//            1. Membuat fungsi helper `sendWhatsAppMessage` untuk mengirim pesan.
//            2. Mengintegrasikan pengiriman pesan ini pada aksi-aksi penting, seperti:
//               - Pembuatan tagihan baru (kirim info tagihan ke wali murid).
//               - Pembayaran diverifikasi/ditolak (tahap 1 & tahap 2).
//               - Pengingat (reminder) tunggakan.
// =========================================================================

export async function sendWhatsAppMessage({
  targetPhone,
  message,
}: {
  targetPhone: string;
  message: string;
}) {
  const token = process.env.WA_API_TOKEN;
  const providerUrl = process.env.WA_API_URL || "https://api.fonnte.com/send";

  if (!token) {
    console.warn("WhatsApp API Token tidak dikonfigurasi (.env)");
    return { error: "Token not configured" };
  }

  try {
    const response = await fetch(providerUrl, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: targetPhone,
        message: message,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gagal mengirim pesan WhatsApp:", error);
    throw error;
  }
}
