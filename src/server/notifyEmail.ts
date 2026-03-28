import nodemailer from "nodemailer";

export type EnquiryEmailSummary = {
  id: string;
  petType: "dog" | "cat" | "smallPet";
  bookingType?: string | null;
  customerName: string;
  phone: string;
  email: string;
  dogs?: Array<{
    name: string;
    breed: string;
    ageMonths: number;
    sex: string;
    neutered: boolean;
    service?: string | null;
  }>;
  cat?: { name: string; service: string };
  smallPets?: Array<{ name: string; petType: string; service: string }>;
};

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  if (!host || !port || !user || !pass || !from) return null;
  return { host, port, user, pass, from };
}

export async function sendCustomerEnquiryEmail(summary: EnquiryEmailSummary) {
  const cfg = smtpConfig();
  if (!cfg) return { ok: false as const, error: "SMTP not configured" };

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  const lines: string[] = [];
  lines.push(`Enquiry ID: ${summary.id}`);
  lines.push(`Pet type: ${summary.petType}`);
  if (summary.bookingType) lines.push(`Booking type: ${summary.bookingType}`);
  lines.push("");
  lines.push("Your details:");
  lines.push(`- Name: ${summary.customerName}`);
  lines.push(`- Phone: ${summary.phone}`);
  lines.push(`- Email: ${summary.email}`);
  lines.push("");

  if (summary.petType === "dog" && summary.dogs?.length) {
    lines.push("Dogs:");
    for (const d of summary.dogs) {
      lines.push(
        `- ${d.name} (${d.breed}) · ${d.ageMonths} months · ${d.sex} · ${
          d.neutered ? "neutered" : "not neutered"
        }${d.service ? ` · service: ${d.service}` : ""}`,
      );
    }
  }
  if (summary.petType === "cat" && summary.cat) {
    lines.push("Cat:");
    lines.push(`- ${summary.cat.name} · service: ${summary.cat.service}`);
  }
  if (summary.petType === "smallPet" && summary.smallPets?.length) {
    lines.push("Small pets:");
    for (const p of summary.smallPets) {
      lines.push(`- ${p.name} · type: ${p.petType} · service: ${p.service}`);
    }
  }

  const text = [
    "Thanks for your enquiry. We’ve received your submission and will review it shortly.",
    "",
    ...lines,
  ].join("\n");

  await transporter.sendMail({
    from: cfg.from,
    to: summary.email,
    subject: "We received your enquiry",
    text,
  });

  return { ok: true as const };
}

