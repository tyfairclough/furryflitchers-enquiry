import twilio from "twilio";

export type WhatsappAdminNotification = {
  enquiryId: string;
  petType: "dog" | "cat" | "smallPet";
  customerName: string;
  phone: string;
  email: string;
  adminNumber: string;
};

function twilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!accountSid || !authToken || !from) return null;
  return { accountSid, authToken, from };
}

export async function sendAdminWhatsappNotification(
  n: WhatsappAdminNotification,
) {
  const cfg = twilioConfig();
  if (!cfg) return { ok: false as const, error: "Twilio not configured" };

  const client = twilio(cfg.accountSid, cfg.authToken);
  const body = [
    `New enquiry (${n.petType})`,
    `Customer: ${n.customerName}`,
    `Phone: ${n.phone}`,
    `Email: ${n.email}`,
    `ID: ${n.enquiryId}`,
  ].join("\n");

  await client.messages.create({
    from: cfg.from,
    to: `whatsapp:${n.adminNumber}`,
    body,
  });

  return { ok: true as const };
}

