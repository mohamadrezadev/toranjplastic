import { BadRequestException } from '@nestjs/common';

export const MAX_RIALS = 9_000_000_000_000_000_000n;
const quantityPattern = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,3}))?$/;
const moneyPattern = /^(0|[1-9]\d{0,18})$/;

export interface QuotationCalculationItem {
  quantity: string;
  unitPriceRials: string;
  lineTotalRials: string;
}

export interface QuotationCalculationInput {
  items: QuotationCalculationItem[];
  subtotalRials: string;
  discountRials: string;
  taxRials: string;
  additionalCostRials: string;
  totalRials: string;
}

const invalid = () =>
  new BadRequestException({
    code: 'QUOTATION_TOTAL_MISMATCH',
    message: 'مبالغ پیشنهاد قیمت معتبر نیست.',
  });

export function parseRials(value: string): bigint {
  if (!moneyPattern.test(value)) throw invalid();
  const amount = BigInt(value);
  if (amount > MAX_RIALS) throw invalid();
  return amount;
}

export function parseQuantityThousandths(value: string): bigint {
  const match = quantityPattern.exec(value);
  if (!match) throw invalid();
  const whole = BigInt(value.split('.')[0]);
  const fraction = (match[1] ?? '').padEnd(3, '0');
  const amount = whole * 1000n + BigInt(fraction || '0');
  if (amount <= 0n) throw invalid();
  return amount;
}

export function calculateQuotation(input: QuotationCalculationInput) {
  if (input.items.length < 1 || input.items.length > 50) throw invalid();
  const items = input.items.map((item) => {
    const quantity = parseQuantityThousandths(item.quantity);
    const unitPrice = parseRials(item.unitPriceRials);
    const scaled = quantity * unitPrice;
    if (scaled % 1000n !== 0n) throw invalid();
    const lineTotal = scaled / 1000n;
    if (lineTotal > MAX_RIALS || parseRials(item.lineTotalRials) !== lineTotal)
      throw invalid();
    return {
      quantity: item.quantity,
      unitPriceRials: unitPrice,
      lineTotalRials: lineTotal,
    };
  });
  const subtotalRials = items.reduce(
    (sum, item) => sum + item.lineTotalRials,
    0n,
  );
  const discountRials = parseRials(input.discountRials);
  const taxRials = parseRials(input.taxRials);
  const additionalCostRials = parseRials(input.additionalCostRials);
  if (
    discountRials > subtotalRials ||
    parseRials(input.subtotalRials) !== subtotalRials
  )
    throw invalid();
  const totalRials =
    subtotalRials - discountRials + taxRials + additionalCostRials;
  if (totalRials > MAX_RIALS || parseRials(input.totalRials) !== totalRials)
    throw invalid();
  return {
    items,
    subtotalRials,
    discountRials,
    taxRials,
    additionalCostRials,
    totalRials,
  };
}
