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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds timeout

  try {
    const formData = new FormData();
    formData.append("target", targetPhone);
    formData.append("message", message);

    const response = await fetch(providerUrl, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn("WhatsApp API HTTP error:", response.status);
      return { error: "API returned non-200" };
    }
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("WhatsApp API Timeout");
      return { error: "timeout" }; // Graceful degrade without crashing
    }
    console.error("Gagal mengirim pesan WhatsApp:", error.message);
    return { error: error.message };
  }
}
