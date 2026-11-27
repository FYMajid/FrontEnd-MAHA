import ContactsPage from "@/components/contacts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacts | MAHA",
  description: "Manage client and non-client contacts.",
};
export default function page() {
  return (
    <div>
      <ContactsPage />
    </div>
  );
}
