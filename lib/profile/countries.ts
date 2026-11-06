// ISO 3166-1 alpha-2 country codes with Persian + English names
// (trimmed list — add all 249 if you need full coverage)

export interface Country {
  code: string; // "IR"
  name: string; // "ایران"
  nameEn: string; // "Iran"
}

export const COUNTRIES: Country[] = [
  { code: "IR", name: "ایران", nameEn: "Iran" },
  { code: "AF", name: "افغانستان", nameEn: "Afghanistan" },
  { code: "TR", name: "ترکیه", nameEn: "Turkey" },
  { code: "IQ", name: "عراق", nameEn: "Iraq" },
  { code: "AE", name: "امارات متحده عربی", nameEn: "United Arab Emirates" },
  { code: "SA", name: "عربستان سعودی", nameEn: "Saudi Arabia" },
  { code: "QA", name: "قطر", nameEn: "Qatar" },
  { code: "KW", name: "کویت", nameEn: "Kuwait" },
  { code: "OM", name: "عمان", nameEn: "Oman" },
  { code: "BH", name: "بحرین", nameEn: "Bahrain" },
  { code: "US", name: "ایالات متحده آمریکا", nameEn: "United States" },
  { code: "GB", name: "بریتانیا", nameEn: "United Kingdom" },
  { code: "DE", name: "آلمان", nameEn: "Germany" },
  { code: "FR", name: "فرانسه", nameEn: "France" },
  { code: "IT", name: "ایتالیا", nameEn: "Italy" },
  { code: "ES", name: "اسپانیا", nameEn: "Spain" },
  { code: "NL", name: "هلند", nameEn: "Netherlands" },
  { code: "SE", name: "سوئد", nameEn: "Sweden" },
  { code: "NO", name: "نروژ", nameEn: "Norway" },
  { code: "DK", name: "دانمارک", nameEn: "Denmark" },
  { code: "CH", name: "سوئیس", nameEn: "Switzerland" },
  { code: "AT", name: "اتریش", nameEn: "Austria" },
  { code: "BE", name: "بلژیک", nameEn: "Belgium" },
  { code: "CA", name: "کانادا", nameEn: "Canada" },
  { code: "AU", name: "استرالیا", nameEn: "Australia" },
  { code: "JP", name: "ژاپن", nameEn: "Japan" },
  { code: "CN", name: "چین", nameEn: "China" },
  { code: "IN", name: "هند", nameEn: "India" },
  { code: "RU", name: "روسیه", nameEn: "Russia" },
  { code: "BR", name: "برزیل", nameEn: "Brazil" },
  // ...add more as needed
];

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
const byName = new Map(
  COUNTRIES.flatMap((c) => [
    [c.name.toLowerCase(), c] as const,
    [c.nameEn.toLowerCase(), c] as const,
  ]),
);

/** "IR" -> Country | undefined */
export function getCountryByCode(code: string): Country | undefined {
  return byCode.get(code.toUpperCase());
}

/** "Iran" or "ایران" -> Country | undefined (legacy data support) */
export function getCountryByName(name: string): Country | undefined {
  return byName.get(name.trim().toLowerCase());
}

/** Normalize any stored value to a 2-letter code (or "") */
export function normalizeCountryCode(value: string): string {
  if (!value) return "";
  const upper = value.trim().toUpperCase();
  if (upper.length === 2 && byCode.has(upper)) return upper;
  // Legacy: stored full name
  const byNameMatch = getCountryByName(value);
  return byNameMatch?.code ?? "";
}

/** Get display name for a code, with fallback */
export function getCountryLabel(code: string): string {
  if (!code) return "";
  return getCountryByCode(code)?.name ?? code;
}
