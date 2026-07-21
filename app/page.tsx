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
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

export default async function IndexPage() {
  // TODO (Atnan): Dapatkan session server, cek role, lalu redirect ke dashboard yang sesuai.
  // const session = await getServerSession(authOptions);
  
  // Jika belum login:
  // redirect("/login");

  // Jika ADMIN:
  // redirect("/admin/dashboard");

  // Jika BENDAHARA:
  // redirect("/bendahara/dashboard");

  // Jika WALIMURID:
  // redirect("/wali/dashboard");

  // Placeholder default (sementara redirect ke login):
  redirect("/login");
  
  return null;
}
