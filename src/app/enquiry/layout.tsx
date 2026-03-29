import { EnquirySiteHeader } from "@/components/enquiry/EnquirySiteHeader";

export default function EnquirySectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <EnquirySiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
