import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { evaluateDogGroupSuitability } from "@/server/suitability";
import { getSettingWithDefault } from "@/server/settings";
import { sendAdminWhatsappNotification } from "@/server/notifyWhatsapp";
import { sendCustomerEnquiryEmail } from "@/server/notifyEmail";
import { rateLimitCheck } from "@/server/rateLimit";
import {
  shouldSkipHcaptchaForRequest,
  verifyHcaptchaToken,
} from "@/server/hcaptcha";
import { formatUkPhoneE164, isValidUkPhoneNumber } from "@/lib/ukPhone";

export const runtime = "nodejs";

const ukPhoneZ = z
  .string()
  .refine((s) => isValidUkPhoneNumber(s), { message: "Invalid UK phone number" })
  .transform((s) => formatUkPhoneE164(s)!);

const dogSchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  breedScreeningText: z.string().optional(),
  ageMonths: z.number().int().positive(),
  sex: z.enum(["male", "female"]),
  neutered: z.boolean(),
});

const dogSubmitSchema = z.object({
  petType: z.literal("dog"),
  dogs: z.array(dogSchema).min(1),
  service: z.enum(["boarding", "daycare"]),
  bookingType: z.enum(["holiday", "regular", "oneOff"]),
  customerName: z.string().min(1),
  phone: ukPhoneZ,
  email: z.string().email(),
  agreedToTerms: z.literal(true),
  hp: z.string().optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
  hcaptchaToken: z.string().nullish(),
});

const catSubmitSchema = z.object({
  petType: z.literal("cat"),
  catName: z.string().min(1),
  bookingType: z.enum(["holiday", "regular", "oneOff"]),
  customerName: z.string().min(1),
  phone: ukPhoneZ,
  email: z.string().email(),
  agreedToTerms: z.literal(true),
  hp: z.string().optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
  hcaptchaToken: z.string().nullish(),
});

const smallPetSubmitSchema = z.object({
  petType: z.literal("smallPet"),
  petName: z.string().min(1),
  petTypeName: z.string().min(1),
  service: z.enum(["popIn", "boarding"]),
  customerName: z.string().min(1),
  phone: ukPhoneZ,
  email: z.string().email(),
  agreedToTerms: z.literal(true),
  hp: z.string().optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
  hcaptchaToken: z.string().nullish(),
});

const submitSchema = z.discriminatedUnion("petType", [
  dogSubmitSchema,
  catSubmitSchema,
  smallPetSubmitSchema,
]);

const DEFAULT_REJECTION_MESSAGE =
  "Thanks for your enquiry. Based on the details provided, we’re not able to accept this booking right now. If you think this is a mistake, please contact us and we’ll help.";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (!xf) return null;
  const first = xf.split(",")[0]?.trim();
  return first || null;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent");
  const clientIp = getClientIp(req);

  if (parsed.data.hp && parsed.data.hp.trim().length > 0) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const minSubmitMs = Number(
    await getSettingWithDefault("minSubmitMs", "3000"),
  );
  if (typeof parsed.data.elapsedMs === "number" && parsed.data.elapsedMs < minSubmitMs) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  const rl = rateLimitCheck({
    ip: clientIp,
    email: parsed.data.email,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const captcha = await verifyHcaptchaToken({
    token: parsed.data.hcaptchaToken ?? null,
    remoteip: clientIp,
    skipVerification: shouldSkipHcaptchaForRequest(req),
  });
  if (!captcha.ok) {
    return NextResponse.json({ error: "Captcha failed" }, { status: 429 });
  }

  const rejectionMessage = await getSettingWithDefault(
    "rejectionMessage",
    DEFAULT_REJECTION_MESSAGE,
  );

  if (parsed.data.petType === "dog") {
    const data = parsed.data;
    const suitability = await evaluateDogGroupSuitability(data.dogs);
    if (!suitability.accepted) {
      return NextResponse.json(
        { accepted: false, rejectionMessage, dogs: suitability.dogs },
        { status: 422 },
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        petType: "dog",
        status: "new",
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        agreedToTerms: true,
        bookingType: data.bookingType,
        rawSubmission: data,
        clientIp,
        userAgent: ua,
        dogs: {
          create: data.dogs.map((d) => ({
            name: d.name,
            ageMonths: d.ageMonths,
            sex: d.sex,
            neutered: d.neutered,
            suitability: "accepted",
            service: data.service,
          })),
        },
      },
      include: { dogs: true },
    });

    const adminNumber =
      (await prisma.setting.findUnique({
        where: { key: "adminWhatsappNumber" },
        select: { value: true },
      }))?.value ?? null;

    if (adminNumber) {
      await sendAdminWhatsappNotification({
        enquiryId: enquiry.id,
        petType: "dog",
        customerName: enquiry.customerName,
        phone: enquiry.phone,
        email: enquiry.email,
        adminNumber,
      }).catch(() => null);
    }

    await sendCustomerEnquiryEmail({
      id: enquiry.id,
      petType: "dog",
      bookingType: enquiry.bookingType ?? null,
      customerName: enquiry.customerName,
      phone: enquiry.phone,
      email: enquiry.email,
      dogs: enquiry.dogs.map((d) => ({
        name: d.name,
        breed: data.dogs.find((x) => x.name === d.name)?.breed ?? "",
        ageMonths: d.ageMonths,
        sex: d.sex,
        neutered: d.neutered,
        service: d.service ?? null,
      })),
    }).catch(() => null);

    return NextResponse.json({ ok: true, id: enquiry.id });
  }

  if (parsed.data.petType === "cat") {
    const data = parsed.data;
    const enquiry = await prisma.enquiry.create({
      data: {
        petType: "cat",
        status: "new",
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        agreedToTerms: true,
        bookingType: data.bookingType,
        rawSubmission: data,
        clientIp,
        userAgent: ua,
        cat: {
          create: { name: data.catName, service: "popIn" },
        },
      },
      include: { cat: true },
    });

    const adminNumber =
      (await prisma.setting.findUnique({
        where: { key: "adminWhatsappNumber" },
        select: { value: true },
      }))?.value ?? null;

    if (adminNumber) {
      await sendAdminWhatsappNotification({
        enquiryId: enquiry.id,
        petType: "cat",
        customerName: enquiry.customerName,
        phone: enquiry.phone,
        email: enquiry.email,
        adminNumber,
      }).catch(() => null);
    }

    await sendCustomerEnquiryEmail({
      id: enquiry.id,
      petType: "cat",
      bookingType: enquiry.bookingType ?? null,
      customerName: enquiry.customerName,
      phone: enquiry.phone,
      email: enquiry.email,
      cat: { name: enquiry.cat?.name ?? data.catName, service: "popIn" },
    }).catch(() => null);

    return NextResponse.json({ ok: true, id: enquiry.id });
  }

  // smallPet
  const data = parsed.data;
  if (data.petType !== "smallPet") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const animalType = await prisma.animalType.findFirst({
    where: { active: true, name: data.petTypeName },
    select: { id: true, name: true },
  });

  const enquiry = await prisma.enquiry.create({
    data: {
      petType: "smallPet",
      status: "new",
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      agreedToTerms: true,
      rawSubmission: data,
      clientIp,
      userAgent: ua,
      smallPets: {
        create: [
          {
            name: data.petName,
            animalTypeId: animalType?.id ?? null,
            service: data.service,
          },
        ],
      },
    },
    include: { smallPets: { include: { animalType: true } } },
  });

  const adminNumber =
    (await prisma.setting.findUnique({
      where: { key: "adminWhatsappNumber" },
      select: { value: true },
    }))?.value ?? null;

  if (adminNumber) {
    await sendAdminWhatsappNotification({
      enquiryId: enquiry.id,
      petType: "smallPet",
      customerName: enquiry.customerName,
      phone: enquiry.phone,
      email: enquiry.email,
      adminNumber,
    }).catch(() => null);
  }

  await sendCustomerEnquiryEmail({
    id: enquiry.id,
    petType: "smallPet",
    customerName: enquiry.customerName,
    phone: enquiry.phone,
    email: enquiry.email,
    smallPets: enquiry.smallPets.map((p) => ({
      name: p.name,
      petType: p.animalType?.name ?? data.petTypeName,
      service: p.service,
    })),
  }).catch(() => null);

  return NextResponse.json({ ok: true, id: enquiry.id });
}

