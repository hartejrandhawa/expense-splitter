import { describe, expect, it } from "vitest";
import { balanceSign, equalSplit, formatMoney, sumCents, toCents } from "./money";

describe("formatMoney", () => {
  it("formats as dollars with two decimals", () => {
    expect(formatMoney(12.5)).toBe("$12.50");
    expect(formatMoney(1234)).toBe("$1,234.00");
  });

  it("drops the sign so the wording can carry it", () => {
    expect(formatMoney(-3.2)).toBe("$3.20");
  });
});

describe("toCents", () => {
  it.each([
    ["10", 1000],
    ["10.5", 1050],
    ["10.05", 1005],
    [".99", 99],
    ["0.1", 10],
    [12.34, 1234],
  ])("parses %s", (input, cents) => {
    expect(toCents(input)).toBe(cents);
  });

  it.each(["", "abc", "1.234", "-5", "1,000"])("rejects %s", (input) => {
    expect(toCents(input)).toBeNaN();
  });

  it("avoids floating point error", () => {
    expect(toCents("0.29")).toBe(29); // 0.29 * 100 = 28.999999999999996 in floats
  });
});

describe("equalSplit", () => {
  it("gives leftover cents to the first people", () => {
    expect(equalSplit(1000, ["a", "b", "c"])).toEqual([
      { username: "a", cents: 334 },
      { username: "b", cents: 333 },
      { username: "c", cents: 333 },
    ]);
  });

  it("always adds back up to the total", () => {
    for (let total = 0; total <= 500; total++) {
      for (let n = 1; n <= 6; n++) {
        const people = Array.from({ length: n }, (_, i) => `p${i}`);
        expect(sumCents(equalSplit(total, people).map((s) => s.cents))).toBe(total);
      }
    }
  });

  it("returns nothing when nobody is selected", () => {
    expect(equalSplit(1000, [])).toEqual([]);
  });
});

describe("balanceSign", () => {
  it("treats sub-cent float noise as even", () => {
    expect(balanceSign(0.0000001)).toBe(0);
    expect(balanceSign(-0.01)).toBe(-1);
    expect(balanceSign(4)).toBe(1);
  });
});
