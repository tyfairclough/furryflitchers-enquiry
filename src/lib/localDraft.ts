export type PetType = "dog" | "cat" | "smallPet";

export function draftKey(petType: PetType) {
  return `ff_enquiry_draft_${petType}`;
}

export function loadDraft<T>(petType: PetType): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(draftKey(petType));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveDraft<T>(petType: PetType, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(draftKey(petType), JSON.stringify(value));
}

export function clearDraft(petType: PetType) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(petType));
}

