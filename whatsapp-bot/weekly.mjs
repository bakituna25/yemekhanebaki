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

export const TASARIMLAR = ['acik', 'koyu', 'renkli'];

// Siteyi açar, "bugün"ü hedef haftadan önceki cumartesiye sabitleyip haftalık görünümde o haftaya gider.
// Böylece kartlarda "BUGÜNÜN MENÜSÜ" vurgusu çıkmaz.
async function openWeek(browser, url, monday, dark) {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 900 },
    deviceScaleFactor: 2,
    timezoneId: TZ,
    locale: 'tr-TR',
    colorScheme: dark ? 'dark' : 'light',
  });
  await page.clock.setFixedTime(new Date(monday.getTime() - 2 * 86400000 + 9 * 3600000));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate((dark) => {
    localStorage.setItem('darkMode', String(dark));
    localStorage.setItem('language', 'tr');
  }, dark);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Haftalık' }).click();
  await page.locator('main button:has(svg.lucide-chevron-right)').click();
  const grid = page.locator('main .grid');
  await grid.waitFor();
  return { page, grid };
}

// Sitedeki kartlardan haftanın menüsünü okur. Vejetaryen seçenek için her kartta ana yemeğe
// tıklanır (sitedeki geçiş), okunur ve kart eski haline döndürülür.
async function scrape(page, grid) {
  const titles = await grid.locator('h3').allTextContents();
  if (titles.length === 0 || titles.includes('Veri Bulunamadı')) return null;
  const days = [];
  for (const card of await grid.locator(':scope > div').all()) {
    const day = await card.evaluate((c) => ({
      day: c.querySelector('h3').textContent,
      date: c.querySelector('h3 + p').textContent,
      items: [...c.querySelectorAll('.space-y-1 > div')].map((r) => ({
        label: r.querySelector('span.uppercase').textContent,
        name: r.querySelector('span.block').textContent,
        cal: r.querySelector('.text-right span').textContent,
      })),
      total: c.querySelector('.mt-6.pt-4 .text-right span')?.textContent,
    }));
    const toggle = card.locator('.cursor-pointer');
    await toggle.click();
    day.veg = {
      name: await toggle.locator('span.block').textContent(),
      cal: await toggle.locator('.text-right span').first().textContent(),
    };
    await toggle.click();
    days.push(day);
  }
  await page.mouse.move(0, 0); // son tıklanan kartta hover gölgesi kalmasın
  return days;
}

// "acik" / "koyu": sitenin kendi kartları; boş kalan yere aynı görünümde "Vejetaryen" kutusu eklenir.
async function siteImage(page, grid, days, label, dark) {
  await grid.evaluate((el, { items, label, dark }) => {
    const card = el.firstElementChild.cloneNode(true);
    card.querySelector('h3').textContent = 'Vejetaryen';
    card.querySelector('h3 + p').textContent = 'Haftanın vejetaryen seçenekleri';
    const list = card.querySelector('.space-y-1');
    const template = list.querySelector(':scope > div:not(.cursor-pointer)');
    list.replaceChildren(...items.map(({ day, name, cal }) => {
      const row = template.cloneNode(true);
      row.querySelector('span.uppercase').textContent = day;
      const nameEl = row.querySelector('span.block');
      nameEl.textContent = name;
      nameEl.classList.replace('text-gray-800', 'text-green-600');
      nameEl.classList.replace('dark:text-slate-200', 'dark:text-green-400');
      row.querySelector('.text-right span').textContent = cal;
      return row;
    }));
    card.querySelector('.mt-6.pt-4')?.remove(); // toplam kalori satırı bu kutuda anlamsız
    if (el.children.length % 2 === 0) card.style.gridColumn = '1 / -1'; // boşluk yoksa tam genişlik
    el.append(card);

    // Başlık ve kenar boşluğu
    const c = dark
      ? { bg: '#000', title: '#f1f5f9', sub: '#94a3b8', red: '#f87171' }
      : { bg: '#f9fafb', title: '#111827', sub: '#6b7280', red: '#C41230' };
    const wrap = el.parentElement;
    wrap.style.padding = '28px';
    wrap.style.background = c.bg;
    const head = document.createElement('div');
    head.style.cssText = `display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid ${c.red}`;
    head.innerHTML = `<div><div style="font-size:30px;font-weight:800;color:${c.title}">Haftalık Menü</div>
      <div style="font-size:18px;font-weight:600;color:${c.sub};margin-top:4px">${label}</div></div>
      <div style="text-align:right"><div style="font-size:20px;font-weight:800;color:${c.red}">AGÜ Yemekhane</div>
      <div style="font-size:15px;font-weight:600;color:${c.sub};margin-top:4px">11.00 - 14.30</div></div>`;
    wrap.prepend(head);
  }, { items: days.map((d) => ({ day: d.day, ...d.veg })), label, dark });
  return grid.locator('..').screenshot({ animations: 'disabled' });
}

// "renkli": sade, kurumsal bir tasarım; her gün yalnızca ince bir renk vurgusuyla ayrılır (veriler yine siteden).
const RENKLER = {
  Pazartesi: { accent: '#3E6A9A' },
  Salı: { accent: '#6E5A96' },
  Çarşamba: { accent: '#A9772B' },
  Perşembe: { accent: '#A6504F' },
  Cuma: { accent: '#2F7A72' },
  Vejetaryen: { accent: '#4A8058' },
};
const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function renkliHtml(days, label) {
  const row = (lbl, name, cal) => `
    <div class="row"><div class="lbl">${esc(lbl)}</div><div class="name">${esc(name)}</div>
    <div class="cal">${esc(cal)}<span>kcal</span></div></div>`;
  const card = ({ title, sub, rows, c, total, wide }) => `
    <section class="card" style="--a:${c.accent}${wide ? ';grid-column:1/-1' : ''}">
      <div class="head"><div class="day">${esc(title)}</div><div class="date">${esc(sub)}</div></div>
      <div class="rows">${rows}</div>
      ${total ? `<div class="total"><span>Toplam kalori</span><b>${esc(total)} <small>kcal</small></b></div>` : ''}
    </section>`;
  const cards = days.map((d) => card({
    title: d.day, sub: d.date, c: RENKLER[d.day] ?? RENKLER.Pazartesi, total: d.total,
    rows: d.items.map((i) => row(i.label, i.name, i.cal)).join(''),
  }));
  cards.push(card({
    title: 'Vejetaryen', sub: 'Haftanın vejetaryen seçenekleri', c: RENKLER.Vejetaryen, wide: days.length % 2 === 0,
    rows: days.map((d) => row(d.day, d.veg.name, d.veg.cal)).join(''),
  }));
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, Roboto, system-ui, sans-serif;
      background: #F3F2EF; color: #1C1C1E; width: 1000px; -webkit-font-smoothing: antialiased; }
    #wrap { padding: 40px 36px 36px; }
    header { display: flex; justify-content: space-between; align-items: flex-end;
      padding-bottom: 22px; margin-bottom: 26px; border-bottom: 1px solid #DAD8D2; }
    .kicker { font-size: 12px; font-weight: 700; letter-spacing: 2.2px; color: #C41230; }
    h1 { font-size: 34px; font-weight: 700; letter-spacing: -0.6px; margin-top: 6px; }
    .meta { text-align: right; font-size: 14px; color: #6B6A66; line-height: 1.6; }
    .meta b { display: block; font-size: 17px; color: #1C1C1E; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; grid-auto-rows: 1fr; }
    .card { position: relative; overflow: hidden; background: #fff; border: 1px solid #E4E2DC; border-radius: 14px;
      padding: 26px 24px 20px; display: flex; flex-direction: column; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--a); }
    .head { padding-bottom: 14px; border-bottom: 1px solid #EEECE7; }
    .day { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .date { font-size: 13px; color: #8A8984; margin-top: 3px; }
    .rows { flex: 1; }
    .row { display: grid; grid-template-columns: 96px 1fr auto; align-items: baseline; gap: 12px;
      padding: 13px 0; border-bottom: 1px solid #F1EFEA; }
    .row:last-child { border-bottom: 0; }
    .lbl { font-size: 10.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #9A9893; }
    .name { font-size: 16px; font-weight: 500; color: #1C1C1E; }
    .cal { font-size: 14px; font-weight: 500; color: #57564F; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .cal span, .total small { font-size: 10px; color: #A3A19B; margin-left: 3px; text-transform: uppercase; letter-spacing: .5px; }
    .total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px; padding-top: 14px;
      border-top: 1px solid #EEECE7; font-size: 12px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: #8A8984; }
    .total b { font-size: 18px; color: var(--a); letter-spacing: 0; font-variant-numeric: tabular-nums; }
  </style></head><body><div id="wrap">
    <header><div><div class="kicker">AGÜ YEMEKHANE</div><h1>Haftalık Menü</h1></div>
      <div class="meta"><b>${esc(label)}</b>Servis saatleri 11.00 – 14.30</div></header>
    <div class="grid">${cards.join('')}</div></div></body></html>`;
}

// { image, caption, days } döndürür; o hafta için sitede menü yoksa null.
//   tasarim: 'acik' (sitenin açık teması), 'koyu' (sitenin koyu teması), 'renkli' (her güne renk)
export async function weeklyMenu({ url = process.env.SITE_URL, now = new Date(), tasarim = process.env.TASARIM || 'acik' } = {}) {
  if (!url) throw new Error('SITE_URL boş. .env dosyasına sitenin adresini yaz.');
  if (!TASARIMLAR.includes(tasarim)) throw new Error(`TASARIM şunlardan biri olmalı: ${TASARIMLAR.join(', ')}`);
  const monday = targetMonday(now);
  const label = weekLabel(monday);

  const browser = await chromium.launch();
  try {
    const { page, grid } = await openWeek(browser, url, monday, tasarim === 'koyu');
    const days = await scrape(page, grid);
    if (!days) return null;

    let image;
    if (tasarim === 'renkli') {
      const p = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
      await p.setContent(renkliHtml(days, label));
      image = await p.locator('#wrap').screenshot();
    } else {
      image = await siteImage(page, grid, days, label, tasarim === 'koyu');
    }
    return { image, caption: caption(monday), days: days.map((d) => d.day) };
  } finally {
    await browser.close();
  }
}
