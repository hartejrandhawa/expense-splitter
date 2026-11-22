import { balanceSign, formatMoney } from "./money";

const TONE = { 1: "positive", "-1": "negative", 0: "neutral" };

/** Plain-language balance for the signed-in user: "You're owed $12.00". */
export function yourBalanceText(amount) {
  const sign = balanceSign(amount);
  if (sign > 0) return { tone: TONE[1], text: `You're owed ${formatMoney(amount)}` };
  if (sign < 0) return { tone: TONE[-1], text: `You owe ${formatMoney(amount)}` };
  return { tone: TONE[0], text: "You're all settled up" };
}

/** Short balance for anyone: "gets back $12.00" / "owes $4.00" / "settled up". */
export function memberBalanceText(amount) {
  const sign = balanceSign(amount);
  if (sign > 0) return { tone: TONE[1], text: `gets back ${formatMoney(amount)}` };
  if (sign < 0) return { tone: TONE[-1], text: `owes ${formatMoney(amount)}` };
  return { tone: TONE[0], text: "settled up" };
}
