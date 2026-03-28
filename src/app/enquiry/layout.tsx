import { EnquirySiteHeader } from "@/components/enquiry/EnquirySiteHeader";

export default function EnquirySectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <EnquirySiteHeader />
      {children}
    </>
  );
}
