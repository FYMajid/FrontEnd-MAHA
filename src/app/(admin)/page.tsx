import DashboardPage from "@/components/Dashboard";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title:
    "Dashboard | Maha Agency",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Dashboard() {
  return (
    <div>
      <DashboardPage />
    </div>
  );
}
