const RECENT_SEARCHES_KEY = "krishi-ghar-recent-searches";
const MAX_RECENT_SEARCHES = 6;

export const normalizeSearchTerm = (value = "") =>
  String(value).replace(/\s+/g, " ").trim();

export const readRecentSearches = () => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeRecentSearches = (items) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
};

export const saveRecentSearch = (entry) => {
  const term = normalizeSearchTerm(entry?.term || entry?.name || "");
  if (!term) return readRecentSearches();

  const nextEntry = {
    id: entry?.id || term.toLowerCase(),
    term,
    name: entry?.name || term,
    image: entry?.image || "",
  };

  const next = [
    nextEntry,
    ...readRecentSearches().filter(
      (item) => item.id !== nextEntry.id && item.term.toLowerCase() !== term.toLowerCase()
    ),
  ].slice(0, MAX_RECENT_SEARCHES);

  writeRecentSearches(next);
  return next;
};

export const removeRecentSearch = (idOrTerm) => {
  const needle = String(idOrTerm || "").toLowerCase();
  const next = readRecentSearches().filter(
    (item) =>
      String(item.id || "").toLowerCase() !== needle &&
      String(item.term || "").toLowerCase() !== needle
  );
  writeRecentSearches(next);
  return next;
};
