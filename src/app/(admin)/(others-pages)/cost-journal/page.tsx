import CostJournalPage from "@/components/cost-journal";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Cost Journal | MAHA",
  description: "Halaman manajemen cost journal untuk biaya dan waktu perkara.",
};
export default function page() {
  return (
    <div>
      <CostJournalPage />
    </div>
  );
}
