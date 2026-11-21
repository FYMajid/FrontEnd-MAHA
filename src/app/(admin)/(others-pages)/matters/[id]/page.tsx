import MatterDetail from "@/components/matters/MatterDetail";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Matter Detail | MAHA",
};

export default function MatterDetailPage() {
  return <MatterDetail />;
}
