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

// "renkli": her güne kendi rengi verilmiş, yumuşak tonlu ayrı bir tasarım (veriler yine siteden).
const RENKLER = {
  Pazartesi: { bg: '#EAF4FE', accent: '#0284C7', soft: '#D3E9FC' },
  Salı: { bg: '#F2EEFE', accent: '#7C3AED', soft: '#E3DAFC' },
  Çarşamba: { bg: '#FEF6E7', accent: '#D97706', soft: '#FCE8C3' },
  Perşembe: { bg: '#FEEEF1', accent: '#E11D48', soft: '#FBD7DF' },
  Cuma: { bg: '#E8F7F6', accent: '#0F9488', soft: '#CDEDEA' },
  Vejetaryen: { bg: '#ECF8EE', accent: '#16A34A', soft: '#D2EFD8' },
};
const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function renkliHtml(days, label) {
  const row = (label, name, cal, c) => `
    <div class="row"><div class="txt"><div class="lbl" style="color:${c.accent}">${esc(label)}</div>
    <div class="name">${esc(name)}</div></div><div class="cal">${esc(cal)}<small>kcal</small></div></div>`;
  const card = (title, sub, rows, c, footer = '', wide = false) => `
    <div class="card" style="background:${c.bg}${wide ? ';grid-column:1/-1' : ''}">
      <div class="top"><span class="dot" style="background:${c.accent}"></span>
        <div><div class="day" style="color:${c.accent}">${esc(title)}</div><div class="date">${esc(sub)}</div></div></div>
      <div class="rows">${rows}</div>${footer}</div>`;
  const cards = days.map((d) => {
    const c = RENKLER[d.day] ?? RENKLER.Pazartesi;
    const footer = d.total
      ? `<div class="total" style="background:${c.soft}"><span>Toplam</span><b style="color:${c.accent}">${esc(d.total)} kcal</b></div>` : '';
    return card(d.day, d.date, d.items.map((i) => row(i.label, i.name, i.cal, c)).join(''), c, footer);
  });
  const v = RENKLER.Vejetaryen;
  cards.push(card('Vejetaryen', 'Haftanın vejetaryen seçenekleri',
    days.map((d) => row(d.day, d.veg.name, d.veg.cal, v)).join(''), v, '', days.length % 2 === 0));
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, system-ui, sans-serif;
      background: #FBFAF8; color: #1F2937; width: 1000px; }
    #wrap { padding: 32px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
    .week { font-size: 17px; color: #6B7280; font-weight: 600; margin-top: 4px; }
    .brand { text-align: right; }
    .pill { display: inline-block; background: #C41230; color: #fff; font-weight: 800; font-size: 16px;
      padding: 8px 16px; border-radius: 999px; }
    .hours { font-size: 14px; color: #6B7280; font-weight: 600; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; grid-auto-rows: 1fr; }
    .card { border-radius: 26px; padding: 26px; display: flex; flex-direction: column; }
    .top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .dot { width: 12px; height: 44px; border-radius: 6px; }
    .day { font-size: 26px; font-weight: 800; letter-spacing: -0.3px; }
    .date { font-size: 14px; color: #6B7280; font-weight: 500; margin-top: 2px; }
    .rows { display: flex; flex-direction: column; gap: 9px; flex: 1; }
    .row { background: rgba(255,255,255,.78); border-radius: 16px; padding: 11px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .txt { min-width: 0; }
    .lbl { font-size: 11px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
    .name { font-size: 17px; font-weight: 600; margin-top: 2px; }
    .cal { font-size: 14px; font-weight: 700; color: #4B5563; white-space: nowrap; }
    .cal small { font-size: 10px; color: #9CA3AF; font-weight: 600; margin-left: 3px; text-transform: uppercase; }
    .total { margin-top: 14px; border-radius: 14px; padding: 11px 16px; display: flex; justify-content: space-between;
      font-size: 14px; font-weight: 600; color: #4B5563; }
    .total b { font-size: 16px; }
  </style></head><body><div id="wrap">
    <header><div><h1>Haftalık Menü</h1><div class="week">${esc(label)}</div></div>
      <div class="brand"><span class="pill">AGÜ Yemekhane</span><div class="hours">Servis: 11.00 - 14.30</div></div></header>
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
