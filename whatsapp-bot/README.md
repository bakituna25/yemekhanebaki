# Yemekhane WhatsApp Botu

Haftada bir kez, sitedeki **Haftalık** görünümün menü kartlarını (son boşluğa haftanın vejetaryen yemeklerini
gösteren bir kutu eklenerek) görüntü olarak alır ve seçtiğin WhatsApp grubuna
resim olarak gönderir. Bot, site adresini (`SITE_URL`) tarayıcıda açıp kartların görüntüsünü alır. Bu yüzden siteyi
güncellemen yeterli. Kartlar her zaman açık temada ve Türkçe alınır.

Resmin altındaki açıklama (emojisiz):

```
*AGÜ Yemekhane Haftalık Menü*
9 - 13 Kasım 2026
Servis saatleri: 11.00 - 14.30

Güncel menü: https://…
```

- Hafta içi çalıştırılırsa o haftanın menüsünü, hafta sonu çalıştırılırsa gelecek haftanınkini gönderir.
- Sitede o hafta için menü yoksa mesaj göndermez.
- Önizleme (bir şey göndermez): `npm run onizle` → `whatsapp-bot/onizleme.png` dosyasına bak.
  Belirli bir tarih için: `node --env-file=.env preview.mjs 2026-11-28`

İki yöntem var; birini seç.

---

## Yöntem 1: Kendi numaranla, ücretsiz (Baileys)

Bot, WhatsApp Web gibi senin numarana "bağlı cihaz" olarak bağlanır ve mesajı senin adına atar.
Gönderim saatinde **bilgisayarın (veya Raspberry Pi / VPS) açık ve bot çalışıyor olmalı.**

```bash
cd whatsapp-bot
npm install          # tarayıcıyı (Chromium) da indirir
cp .env.example .env
```

1. `.env` içine `SITE_URL=` olarak sitenin adresini yaz. `npm run onizle` ile görüntünün doğru çıktığını kontrol et.
2. `npm run gruplar` → terminalde çıkan QR'ı telefondan **WhatsApp > Bağlı cihazlar > Cihaz bağla** ile okut.
   Grupların listelenir. Menünün gideceği grubun `...@g.us` ile biten kimliğini `.env` içindeki `GROUP_ID=` satırına yaz.
3. Test: `npm run gonder` → haftanın menüsü hemen gruba gider.
4. Otomatik: `npm run baslat` → açık kaldığı sürece her pazartesi 09:30'da gönderir (`.env` içindeki `CRON` ile değiştirilebilir).
   Sürekli çalışması için ör. `npx pm2 start "npm run baslat" --name yemekhane` kullanabilirsin.

Notlar:
- Oturum bilgisi `whatsapp-bot/auth/` klasöründe tutulur (git'e gitmez). Bunu kimseyle paylaşma.
- Bu yöntem WhatsApp'ın resmi API'si değildir. Haftada bir mesaj gibi düşük kullanımda sorun çıkması beklenmez,
  ama istersen ana numaran yerine ayrı bir numara kullanabilirsin.

---

## Yöntem 2: Bilgisayar açık kalmadan, GitHub Actions + Green API

[Green API](https://green-api.com) bir WhatsApp numarasını HTTP API'ye bağlayan bir servis (ücretsiz geliştirici
planı ve ücretli planları var). Gönderim GitHub'ın sunucularında, `.github/workflows/whatsapp-menu.yml` ile
her pazartesi 09:30'da otomatik çalışır.

1. green-api.com'da hesap aç, bir instance oluştur, QR'ı telefonla okutarak numaranı bağla.
   Paneldeki `idInstance`, `apiTokenInstance`, `apiUrl` ve `mediaUrl` değerlerini not al.
2. Grup kimliğini bul: `whatsapp-bot/.env` içine `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN` ve `GREEN_API_URL` yaz, sonra
   `npm run greenapi -- gruplar` çalıştır (veya Green API panelindeki `getContacts` metodunu kullan).
3. GitHub'da repo → **Settings → Secrets and variables → Actions**:
   - Secrets: `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN`, `WHATSAPP_GROUP_ID`
   - Variables: `SITE_URL` (sitenin adresi), `GREEN_API_URL` (apiUrl), `GREEN_API_MEDIA_URL` (mediaUrl)
4. **Actions → WhatsApp haftalık menü → Run workflow** ile hemen test et.

GitHub zamanlanmış görevleri yalnızca varsayılan dalda (`main`) çalıştırır; bu dosyaların `main`'de olması gerekir.
