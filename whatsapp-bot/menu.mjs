// Sitedeki menü verisini (src/App.jsx içindeki RAW_MENU_ITEMS) okur ve
// WhatsApp mesajı olarak biçimlendirir. Menü eklemek için siteyi güncellemen yeterli.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const LOCAL_APP = fileURLToPath(new URL('../src/App.jsx', import.meta.url));

async function loadSource() {
  // MENU_SOURCE_URL verilirse (ör. GitHub raw linki) her seferinde en güncel menü oradan çekilir.
  const url = process.env.MENU_SOURCE_URL;
  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Menü indirilemedi (${res.status}): ${url}`);
    return res.text();
  }
  return readFile(LOCAL_APP, 'utf8');
}

export async function loadMenus() {
  const src = await loadSource();
  const start = src.indexOf('const RAW_MENU_ITEMS = [');
  const end = src.indexOf('\n];', start);
  if (start === -1 || end === -1) throw new Error('App.jsx içinde RAW_MENU_ITEMS bulunamadı');
  const arrayCode = src.slice(src.indexOf('[', start), end + 2);
  return vm.runInNewContext(`(${arrayCode})`, {}, { timeout: 1000 });
}

// Europe/Istanbul saatine göre YYYY-MM-DD
export function todayInIstanbul(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export function formatMessage(menu) {
  const [y, m, d] = menu.date.split('-');
  const total = menu.soup.c + menu.main.c + menu.side.c + menu.extra.c;
  const line = (emoji, label, item) => `${emoji} *${label}:* ${item.tr} _(${item.c} kcal)_`;
  const lines = [
    `🍽️ *Günün Menüsü* — ${d}.${m}.${y} ${menu.dayTr}`,
    '',
    line('🥣', 'Çorba', menu.soup),
    line('🍖', 'Ana Yemek', menu.main),
    line('🥦', 'Vejetaryen', menu.veg),
    line('🍚', 'Yan Yemek', menu.side),
    line('🍮', 'Ekstra', menu.extra),
    '',
    `🔥 Toplam: ~${total} kcal`,
  ];
  if (process.env.SITE_URL) lines.push('', `📅 Tüm menü: ${process.env.SITE_URL}`);
  return lines.join('\n');
}

// Verilen günün mesajını döndürür; o gün menü yoksa null.
export async function messageFor(dateStr = todayInIstanbul()) {
  const menus = await loadMenus();
  const menu = menus.find((x) => x.date === dateStr);
  return menu ? formatMessage(menu) : null;
}
