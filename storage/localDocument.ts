import type { LocalDocument } from "@/lib/types";

const storageKey = "draftloop.document";

export function loadLocalDocument(): LocalDocument | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as LocalDocument;
  } catch {
    return null;
  }
}

export function saveLocalDocument(document: LocalDocument) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(document));
}
