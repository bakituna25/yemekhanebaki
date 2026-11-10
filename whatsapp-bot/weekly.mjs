// Siteyi tarayıcıda açar, "Haftalık" görünümüne geçer ve haftanın menü kartlarının
// görüntüsünü (PNG) alır. Hafta içi çalışırsa o haftayı, hafta sonu çalışırsa gelecek haftayı alır.
import { chromium } from 'playwright';

const TZ = 'Europe/Istanbul';
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// Türkiye saatine göre hedef haftanın pazartesi gününü (UTC gece yarısı Date) döndürür.
export function targetMonday(now = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(now).split('-').map(Number);
  const today = new Date(Date.UTC(y, m - 1, d));
  const dow = today.getUTCDay(); // 0 pazar, 6 cumartesi
  const offset = dow === 6 ? 2 : dow === 0 ? 1 : 1 - dow;
  return new Date(today.getTime() + offset * 86400000);
}

function weekLabel(monday) {
  const friday = new Date(monday.getTime() + 4 * 86400000);
  const a = `${monday.getUTCDate()}${monday.getUTCMonth() !== friday.getUTCMonth() ? ' ' + MONTHS[monday.getUTCMonth()] : ''}`;
  return `${a} - ${friday.getUTCDate()} ${MONTHS[friday.getUTCMonth()]} ${friday.getUTCFullYear()}`;
}

export function caption(monday) {
  const lines = ['*AGÜ Yemekhane Haftalık Menü*', weekLabel(monday), 'Servis saatleri: 11.00 - 14.30'];
  if (process.env.SITE_URL) lines.push('', `Güncel menü: ${process.env.SITE_URL}`);
  return lines.join('\n');
}

// { image: Buffer, caption: string } döndürür; o hafta için menü yoksa null.
export async function weeklyMenu({ url = process.env.SITE_URL, now = new Date() } = {}) {
  if (!url) throw new Error('SITE_URL boş. .env dosyasına sitenin adresini yaz.');
  const monday = targetMonday(now);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 900 },
      deviceScaleFactor: 2,
      timezoneId: TZ,
      locale: 'tr-TR',
      colorScheme: 'light',
    });
    // Sitenin "bugün"ünü, hedef haftadan önceki cumartesiye sabitliyoruz. Böylece kartlarda
    // "BUGÜNÜN MENÜSÜ" vurgusu çıkmaz; ardından bir hafta ileri gidip hedef haftayı açıyoruz.
    await page.clock.setFixedTime(new Date(monday.getTime() - 2 * 86400000 + 9 * 3600000));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('darkMode', 'false');
      localStorage.setItem('language', 'tr');
    });
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Haftalık' }).click();
    await page.locator('main button:has(svg.lucide-chevron-right)').click();

    const grid = page.locator('main .grid');
    await grid.waitFor();
    const cards = await grid.locator('h3').allTextContents();
    if (cards.length === 0 || cards.includes('Veri Bulunamadı')) return null;

    // Görüntünün başına başlık ekle, kenarlara boşluk ver.
    const label = weekLabel(monday);
    await grid.evaluate((el, label) => {
      const wrap = el.parentElement;
      wrap.style.padding = '28px';
      wrap.style.background = '#f9fafb';
      const head = document.createElement('div');
      head.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #C41230';
      head.innerHTML = `<div><div style="font-size:30px;font-weight:800;color:#111827">Haftalık Menü</div>
        <div style="font-size:18px;font-weight:600;color:#6b7280;margin-top:4px">${label}</div></div>
        <div style="text-align:right"><div style="font-size:20px;font-weight:800;color:#C41230">AGÜ Yemekhane</div>
        <div style="font-size:15px;font-weight:600;color:#6b7280;margin-top:4px">11.00 - 14.30</div></div>`;
      wrap.prepend(head);
    }, label);

    const image = await grid.locator('..').screenshot({ animations: 'disabled' });
    return { image, caption: caption(monday), days: cards };
  } finally {
    await browser.close();
  }
}
