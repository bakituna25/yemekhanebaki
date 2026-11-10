// Sunucu/bilgisayar açık tutmadan, GitHub Actions'tan Green API (green-api.com) ile gönderim.
// Gerekli ortam değişkenleri: GREEN_API_INSTANCE_ID, GREEN_API_TOKEN, GROUP_ID, SITE_URL
import { weeklyMenu } from './weekly.mjs';

const {
  GREEN_API_URL = 'https://api.green-api.com',
  GREEN_API_MEDIA_URL,
  GREEN_API_INSTANCE_ID: id,
  GREEN_API_TOKEN: token,
  GROUP_ID,
} = process.env;

const listGroups = process.argv[2] === 'gruplar';
if (!id || !token || (!listGroups && !GROUP_ID)) {
  console.error('GREEN_API_INSTANCE_ID, GREEN_API_TOKEN ve GROUP_ID tanımlı olmalı.');
  process.exit(1);
}

const api = (method, base = GREEN_API_URL) => `${base}/waInstance${id}/${method}/${token}`;

if (listGroups) {
  const res = await fetch(api('getContacts'));
  const contacts = await res.json();
  for (const c of contacts.filter((x) => x.type === 'group')) console.log(`  ${c.id}  →  ${c.name}`);
  process.exit(0);
}

const menu = await weeklyMenu();
if (!menu) {
  console.log('Bu hafta için sitede menü yok, mesaj gönderilmedi.');
  process.exit(0);
}
const form = new FormData();
form.append('chatId', GROUP_ID);
form.append('caption', menu.caption);
form.append('file', new Blob([menu.image], { type: 'image/png' }), 'haftalik-menu.png');
const res = await fetch(api('sendFileByUpload', GREEN_API_MEDIA_URL || GREEN_API_URL), { method: 'POST', body: form });
if (!res.ok) {
  console.error(`Gönderim başarısız (${res.status}):`, await res.text());
  process.exit(1);
}
console.log(`Haftalık menü gruba gönderildi (${menu.days.join(', ')}).`, await res.json());
