"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminLayout from "./AdminLayout";

export default function AdminGate({ children }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return children;

  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
