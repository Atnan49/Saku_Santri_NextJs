// =========================================================================
// TANGGUNG JAWAB: Atnan (Backend/Logic)
// Deskripsi: Halaman root (Redirector).
//            Atnan bertanggung jawab memeriksa sesi pengguna saat mengakses URL utama:
//            - Jika belum login -> Redirect ke `/login`.
//            - Jika login sebagai ADMIN -> Redirect ke `/admin/dashboard`.
//            - Jika login sebagai BENDAHARA -> Redirect ke `/bendahara/dashboard`.
//            - Jika login sebagai WALIMURID -> Redirect ke `/wali/dashboard`.
// =========================================================================

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function IndexPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  switch (role) {
    case "ADMIN":
      redirect("/admin/dashboard");
    case "BENDAHARA":
      redirect("/bendahara/dashboard");
    case "WALIMURID":
      redirect("/wali/dashboard");
    default:
      redirect("/login");
  }
}
