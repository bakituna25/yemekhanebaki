// WhatsApp Web üzerinden (Baileys) çalışan bot. Kendi numaranla QR okutarak bağlanır.
//   npm run gruplar  -> üyesi olduğun grupları ve kimliklerini listeler
//   npm run gonder   -> haftanın menüsünü (siteden alınan kart görüntüsü) hemen GROUP_ID grubuna gönderir
//   npm run baslat   -> sürekli açık kalır, CRON zamanında (varsayılan pazar 21:00, gelecek haftanın menüsü) otomatik gönderir
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from 'baileys';
import cron from 'node-cron';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { fileURLToPath } from 'node:url';
import { weeklyMenu } from './weekly.mjs';

const AUTH_DIR = fileURLToPath(new URL('./auth', import.meta.url));
const { GROUP_ID, CRON = '0 21 * * 0' } = process.env;
const command = process.argv[2] || 'baslat';

// Bağlantıyı kurar; koparsa (çıkış yapılmadıysa) 5 sn sonra yeniden bağlanır.
// "sock" her zaman en son açık bağlantıyı tutar.
let sock = null;
let waiters = [];
const waitOpen = () => (sock ? Promise.resolve(sock) : new Promise((res, rej) => waiters.push({ res, rej })));

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const s = makeWASocket({ auth: state, version, logger: pino({ level: 'silent' }) });
  s.ev.on('creds.update', saveCreds);
  s.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\nWhatsApp > Bağlı cihazlar > Cihaz bağla ile bu QR kodu okut:\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      console.log('✅ WhatsApp bağlantısı kuruldu');
      sock = s;
      waiters.forEach((w) => w.res(s));
      waiters = [];
    }
    if (connection === 'close') {
      sock = null;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        const err = new Error('Oturum kapatıldı. whatsapp-bot/auth klasörünü silip tekrar QR okut.');
        waiters.forEach((w) => w.rej(err));
        console.error(err.message);
        process.exit(1);
      }
      console.log(`Bağlantı koptu (${code ?? 'bilinmiyor'}), 5 sn sonra yeniden bağlanılıyor…`);
      setTimeout(() => connect().catch((e) => console.error(e)), 5000);
    }
  });
}

let started = false;
async function getSock() {
  if (!started) {
    started = true;
    await connect();
  }
  return waitOpen();
}

async function sendWeekly() {
  if (!GROUP_ID) throw new Error('GROUP_ID boş. Önce "npm run gruplar" ile grup kimliğini bulup .env dosyasına yaz.');
  const menu = await weeklyMenu();
  if (!menu) {
    console.log('Bu hafta için sitede menü yok, mesaj gönderilmedi.');
    return;
  }
  const s = await getSock();
  await s.sendMessage(GROUP_ID, { image: menu.image, caption: menu.caption });
  console.log(`Haftalık menü gruba gönderildi (${menu.days.join(', ')}).`);
}

if (command === 'gruplar') {
  const s = await getSock();
  const groups = Object.values(await s.groupFetchAllParticipating());
  console.log('\nGruplar (GROUP_ID olarak soldaki kimliği kullan):');
  for (const g of groups.sort((a, b) => a.subject.localeCompare(b.subject, 'tr'))) {
    console.log(`  ${g.id}  →  ${g.subject}`);
  }
  setTimeout(() => process.exit(0), 1000);
} else if (command === 'gonder') {
  // Zamanlanmış görevde internet geç gelirse bekler; 10 dakikada bitmezse vazgeçer.
  setTimeout(() => {
    console.error('10 dakikada gönderilemedi (internet/WhatsApp bağlantısı yok), vazgeçildi.');
    process.exit(1);
  }, 10 * 60 * 1000).unref();
  console.log(`--- ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })} ---`);
  await sendWeekly();
  setTimeout(() => process.exit(0), 5000); // mesajın iletilmesi için kısa bekleme
} else if (command === 'baslat') {
  if (!cron.validate(CRON)) throw new Error(`Geçersiz CRON: ${CRON}`);
  await getSock();
  cron.schedule(CRON, () => sendWeekly().catch((e) => console.error('Gönderim hatası:', e.message)), {
    timezone: 'Europe/Istanbul',
  });
  console.log(`⏰ Zamanlandı: "${CRON}" (Türkiye saati). Bu pencereyi açık bırak.`);
} else {
  console.log('Kullanım: node bot.mjs [gruplar|gonder|baslat]');
  process.exit(1);
}
