import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
import type { QuotationRow } from './quotation.mapper.js';

const fontPath = fileURLToPath(
  new URL(
    '../../node_modules/vazirmatn/fonts/ttf/Vazirmatn-Regular.ttf',
    import.meta.url,
  ),
);
const rial = (value: bigint) =>
  `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬')} ریال`;

@Injectable()
export class QuotationPdfService {
  render(row: QuotationRow): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 44, right: 44, bottom: 44, left: 44 },
        info: {
          Title: `Quotation ${row.quotationNumber} v${row.version}`,
          Author: 'Toranj Plastic',
          Subject: 'پیش‌فاکتور / پیشنهاد قیمت',
        },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc
        .font(fontPath)
        .fontSize(18)
        .text('پیش‌فاکتور / پیشنهاد قیمت', { align: 'right' });
      doc
        .moveDown(0.5)
        .fontSize(10)
        .text(`شماره: ${row.quotationNumber}   نسخه: ${row.version}`, {
          align: 'right',
        });
      doc.text(`اعتبار تا: ${row.validUntil.toISOString().slice(0, 10)}`, {
        align: 'right',
      });
      doc.moveDown();
      for (const item of row.items) {
        doc
          .fontSize(11)
          .text(`${item.position}. ${item.description}`, { align: 'right' });
        doc
          .fontSize(9)
          .text(
            `${item.quantity} ${item.unit} × ${rial(item.unitPriceRials)} = ${rial(item.lineTotalRials)}`,
            { align: 'right' },
          );
        doc.moveDown(0.35);
      }
      doc.moveDown().fontSize(10);
      doc.text(`جمع اقلام: ${rial(row.subtotalRials)}`, { align: 'right' });
      doc.text(`تخفیف: ${rial(row.discountRials)}`, { align: 'right' });
      doc.text(`مالیات: ${rial(row.taxRials)}`, { align: 'right' });
      doc.text(`هزینه جانبی: ${rial(row.additionalCostRials)}`, {
        align: 'right',
      });
      doc
        .fontSize(12)
        .text(`مبلغ نهایی: ${rial(row.totalRials)}`, {
          align: 'right',
          underline: true,
        });
      doc
        .moveDown()
        .fontSize(10)
        .text(`شرایط تحویل: ${row.deliveryTerms}`, { align: 'right' });
      doc.text(`شرایط پرداخت: ${row.paymentTerms}`, { align: 'right' });
      if (row.notes) doc.text(`توضیحات: ${row.notes}`, { align: 'right' });
      doc
        .moveDown()
        .fontSize(8)
        .text(
          'این سند پیش‌فاکتور / پیشنهاد قیمت است و صورتحساب مالیاتی محسوب نمی‌شود.',
          { align: 'right' },
        );
      doc.end();
    });
  }
}
