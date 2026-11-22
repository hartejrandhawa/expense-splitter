// Amounts are handled in integer cents to avoid floating point drift (0.1 + 0.2 !== 0.3).

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 12.5 -> "$12.50". Always positive; callers decide how to word the sign. */
export function formatMoney(amount) {
  return formatter.format(Math.abs(Number(amount) || 0));
}

/** "12.34" / 12.34 -> 1234. Returns NaN for anything that isn't a valid amount with ≤ 2 decimals. */
export function toCents(value) {
  const text = String(value ?? "").trim();
  if (!/^\d+(\.\d{0,2})?$|^\.\d{1,2}$/.test(text)) return NaN;
  const [whole, frac = ""] = text.split(".");
  return Number(whole || 0) * 100 + Number(frac.padEnd(2, "0"));
}

export function fromCents(cents) {
  return cents / 100;
}

/** Same rule as the backend: equal shares in cents, leftover cents go to the first people. */
export function equalSplit(totalCents, people) {
  if (!people.length || !Number.isFinite(totalCents)) return [];
  const base = Math.floor(totalCents / people.length);
  const remainder = totalCents % people.length;
  return people.map((username, i) => ({ username, cents: base + (i < remainder ? 1 : 0) }));
}

export function sumCents(values) {
  return values.reduce((total, v) => total + (Number.isFinite(v) ? v : 0), 0);
}

/** Sign of a balance in cents, tolerant of float noise from JSON numbers. */
export function balanceSign(amount) {
  const cents = Math.round(Number(amount) * 100);
  return cents > 0 ? 1 : cents < 0 ? -1 : 0;
}
