// Sunucu/bilgisayar açık tutmadan, GitHub Actions'tan Green API (green-api.com) ile gönderim.
// Gerekli ortam değişkenleri: GREEN_API_INSTANCE_ID, GREEN_API_TOKEN, GROUP_ID
import { messageFor, todayInIstanbul } from './menu.mjs';

const {
  GREEN_API_URL = 'https://api.green-api.com',
  GREEN_API_INSTANCE_ID: id,
  GREEN_API_TOKEN: token,
  GROUP_ID,
} = process.env;

const listGroups = process.argv[2] === 'gruplar';
if (!id || !token || (!listGroups && !GROUP_ID)) {
  console.error('GREEN_API_INSTANCE_ID, GREEN_API_TOKEN ve GROUP_ID tanımlı olmalı.');
  process.exit(1);
}

const api = (method) => `${GREEN_API_URL}/waInstance${id}/${method}/${token}`;

if (listGroups) {
  const res = await fetch(api('getContacts'));
  const contacts = await res.json();
  for (const c of contacts.filter((x) => x.type === 'group')) console.log(`  ${c.id}  →  ${c.name}`);
  process.exit(0);
}

const date = todayInIstanbul();
const text = await messageFor(date);
if (!text) {
  console.log(`${date}: menü yok, mesaj gönderilmedi.`);
  process.exit(0);
}
const res = await fetch(api('sendMessage'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chatId: GROUP_ID, message: text }),
});
if (!res.ok) {
  console.error(`Gönderim başarısız (${res.status}):`, await res.text());
  process.exit(1);
}
console.log(`${date}: menü gruba gönderildi.`, await res.json());
