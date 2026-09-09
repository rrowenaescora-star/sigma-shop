import type { Metadata } from "next";
import AdminSessionGuard from "@/components/AdminSessionGuard";

export const metadata: Metadata = { title: "Bloxhop Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminSessionGuard />
      {children}
    </>
  );
}