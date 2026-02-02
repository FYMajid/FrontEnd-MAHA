import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DashboardPage from "@/components/Dashboard";
import MatterPage from "@/components/tasks/MettersTask";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title:
    "Dashboard | Maha Agency",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Dashboard() {
  return (
    <div>
      <MatterPage />
    </div>
  );
}
