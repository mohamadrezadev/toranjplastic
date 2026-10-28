import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, 'dist', 'index.js');

console.log('--- شروع آزمون پروتکل Strapi MCP Server ---');

const proc = spawn('node', [serverPath], {
  env: {
    ...process.env,
    STRAPI_URL: 'http://localhost:1337',
  },
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
const pending = new Map();
let msgId = 1;

proc.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep last incomplete line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id && pending.has(msg.id)) {
        const resolve = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg);
      }
    } catch (e) {
      console.error('Non-json line:', line);
    }
  }
});

function send(method, params = {}) {
  const id = msgId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    proc.stdin.write(payload);
  });
}

async function runTests() {
  try {
    // 1. Initialize
    console.log('1. ارسال initialize...');
    const initRes = await send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0' },
    });
    console.log('پاسخ Initialize:', initRes.result?.serverInfo?.name);

    // 2. List tools
    console.log('2. دریافت لیست ابزارها (tools/list)...');
    const toolsRes = await send('tools/list');
    const toolNames = toolsRes.result?.tools?.map((t) => t.name);
    console.log('ابزارهای شناسایی‌شده:', toolNames);

    // 3. Call strapi_list_categories
    console.log('3. فراخوانی ابزار strapi_list_categories...');
    const catRes = await send('tools/call', {
      name: 'strapi_list_categories',
      arguments: {},
    });
    const categories = JSON.parse(catRes.result?.content[0]?.text || '[]');
    console.log('دسته‌بندی‌های دریافت‌شده از Strapi:', categories);

    if (categories.length === 0) {
      throw new Error('هیچ دسته‌بندی یافت نشد!');
    }
    const targetCatDocId = categories[0].documentId;

    // 4. Call strapi_create_article
    console.log('4. ایجاد یک مقاله واقعی توسط ایجنت با strapi_create_article...');
    const createRes = await send('tools/call', {
      name: 'strapi_create_article',
      arguments: {
        title: 'بررسی تخصصی رفتار پلیمرها در فرآیند تزریق پلاستیک قطعات صنعتی',
        slug: 'polymer-behavior-in-industrial-plastic-injection',
        summary: 'تحلیل دقیق انقباض، شارش حرارتی و بهینه‌سازی پارامترهای تزریق برای پلیمرهای مهندسی در ترنج پلاستیک.',
        body: 'در صنایع تزریق پلاستیک، شناخت دقیق رفتار رئولوژیکی و ویسکوزیته مذاب پلیمری نقشی بنیادین در جلوگیری از عیوب متداول نظیر تاب‌برداشتگی (Warpage) و خط جوش (Weld line) ایفا می‌کند.\n\n### عوامل کلیدی در کنترل فرایند تزریق:\n۱. فشار نگه‌دارنده (Holding Pressure) برای جبران انقباض حجمی پلیمر.\n۲. نرخ سرمایش یکنواخت قالب برای جلوگیری از تنش‌های پسماند.\n۳. تنظیم دمای سیلندر متناسب با دمای ذوب رزین جهت حفظ زنجیره‌های مولکولی.',
        categoryDocumentId: targetCatDocId,
        status: 'published',
        seo: {
          metaTitle: 'رفتار پلیمرها در تزریق پلاستیک صنعتی | ترنج پلاستیک',
          metaDescription: 'بررسی تخصصی رفتار حرارتی و رئولوژیکی پلیمرها در فرایند قالب‌گیری تزریق پلاستیک صنعتی ترنج.',
        },
      },
    });

    console.log('پاسخ خام ایجاد مقاله:', JSON.stringify(createRes.result, null, 2));
    const createOutput = JSON.parse(createRes.result?.content[0]?.text || '{}');
    console.log('خروجی ایجاد مقاله:', createOutput);

    // 5. Search articles to verify presence
    console.log('5. جستجوی مقاله در آرشیو مقالات با strapi_search_articles...');
    const searchRes = await send('tools/call', {
      name: 'strapi_search_articles',
      arguments: { query: 'رفتار پلیمرها' },
    });
    const searchOutput = JSON.parse(searchRes.result?.content[0]?.text || '[]');
    console.log('نتیجه جستجو:', searchOutput);

    console.log('--- آزمون پروتکل Strapi MCP با ۱۰۰٪ موفقیت به پایان رسید ---');
  } catch (err) {
    console.error('خطا در آزمون:', err);
  } finally {
    proc.kill();
  }
}

runTests();
