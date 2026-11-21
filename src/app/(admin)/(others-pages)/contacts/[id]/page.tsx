import ContactDetail from "@/components/contacts/ContactDetail";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Contact Detail | MAHA",
  description: "Contact detail page",
};

export default function Page() {
  return <ContactDetail />;
}
