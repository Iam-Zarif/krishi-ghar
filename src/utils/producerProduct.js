const KNOWN_UNIT_MAP = {
  kg: "KG",
  kilogram: "KG",
  kilograms: "KG",
  pic: "Piece",
  piece: "Piece",
  pieces: "Piece",
  ton: "Ton",
  tons: "Ton",
  dozen: "Dozen",
  quarter: "Quarter",
  pair: "Pair",
};

export const normalizeProducerCategoryId = (category) =>
  category?._id || category?.id || category || "";

export const normalizeProducerCategoryName = (category) =>
  category?.name || category?.label || category || "N/A";

export const normalizeSellPostBoolean = (value) => {
  if (value === true || String(value || "").toLowerCase() === "yes") {
    return true;
  }

  if (value === false || String(value || "").toLowerCase() === "no") {
    return false;
  }

  return null;
};

export const normalizeSellPostValue = (value) =>
  normalizeSellPostBoolean(value) ? "yes" : "no";

export const resolveProductImageUrl = (image, baseUrl) => {
  if (!image) {
    return "";
  }

  return String(image).startsWith("http") ? image : `${baseUrl}/${image}`;
};

export const parseProducerQuantity = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return { quantity: "", unit: "KG", customUnitNote: "" };
  }

  const match = raw.match(/^(\d+(?:\.\d+)?)\s*([^\d].*)?$/);
  const quantity = match?.[1] || raw;
  const rawUnit = String(match?.[2] || "").trim();
  const normalizedUnitKey = rawUnit.toLowerCase();
  const knownUnit = KNOWN_UNIT_MAP[normalizedUnitKey];

  if (knownUnit) {
    return { quantity, unit: knownUnit, customUnitNote: "" };
  }

  if (!rawUnit) {
    return { quantity, unit: "KG", customUnitNote: "" };
  }

  return {
    quantity,
    unit: "অন্যান্য",
    customUnitNote: rawUnit,
  };
};

export const formatProducerQuantity = (quantity, unit, customUnitNote = "") => {
  const amount = String(quantity || "").trim();
  if (!amount) {
    return "";
  }

  const chosenUnit =
    unit === "অন্যান্য" ? String(customUnitNote || "").trim() : String(unit || "").trim();

  return chosenUnit ? `${amount} ${chosenUnit}` : amount;
};
