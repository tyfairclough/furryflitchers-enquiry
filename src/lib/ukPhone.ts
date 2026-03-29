import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Shown under the field when the value is non-empty but not a valid UK number */
export const INVALID_UK_PHONE_HINT =
  "Enter a valid UK mobile or landline number (e.g. 07... or 01...).";

export function isValidUkPhoneNumber(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const phone = parsePhoneNumberFromString(trimmed, "GB");
  return phone?.isValid() === true && phone.country === "GB";
}

/** E.164, e.g. +447455747787 — call only when `isValidUkPhoneNumber` is true */
export function formatUkPhoneE164(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const phone = parsePhoneNumberFromString(trimmed, "GB");
  if (!phone?.isValid() || phone.country !== "GB") return null;
  return phone.format("E.164");
}
