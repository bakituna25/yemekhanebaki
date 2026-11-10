# Yemekhane WhatsApp Botu

Sitedeki menüyü (`src/App.jsx` → `RAW_MENU_ITEMS`) okur ve günün menüsünü seçtiğin WhatsApp grubuna gönderir.
Menü eklemek için siteyi her zamanki gibi güncellemen yeterli; bot ayrıca bir veriye ihtiyaç duymaz.

Örnek mesaj:

```
🍽️ *Günün Menüsü* — 24.11.2026 Salı

🥣 *Çorba:* Ezogelin Çorba _(90 kcal)_
🍖 *Ana Yemek:* Patates Oturtma _(450 kcal)_
🥦 *Vejetaryen:* Kabak Kalye _(160 kcal)_
🍚 *Yan Yemek:* Penne Makarna _(300 kcal)_
🍮 *Ekstra:* Triliçe _(195 kcal)_

🔥 Toplam: ~1035 kcal
```

Önizleme (bir şey göndermez): `npm run onizle` veya `node preview.mjs 2026-11-24`

İki yöntem var; birini seç.

---

## Yöntem 1: Kendi numaranla, ücretsiz (Baileys)

Bot, WhatsApp Web gibi senin numarana "bağlı cihaz" olarak bağlanır ve mesajı senin adına atar.
Gönderim saatinde **bilgisayarın (veya Raspberry Pi / VPS) açık ve bot çalışıyor olmalı.**

```bash
cd whatsapp-bot
npm install
cp .env.example .env
```

1. `npm run gruplar` → terminalde çıkan QR'ı telefondan **WhatsApp > Bağlı cihazlar > Cihaz bağla** ile okut.
   Grupların listelenir; menünün gideceği grubun `...@g.us` ile biten kimliğini kopyala.
2. `.env` içinde `GROUP_ID=` satırına yapıştır. İstersen `CRON` (saat) ve `SITE_URL` değerlerini de düzenle.
3. Test: `npm run gonder` → bugünün menüsü hemen gruba gider.
4. Otomatik: `npm run baslat` → açık kaldığı sürece her hafta içi 10:30'da gönderir.
   Sürekli çalışması için ör. `npx pm2 start "npm run baslat" --name yemekhane` kullanabilirsin.

Notlar:
- Oturum bilgisi `whatsapp-bot/auth/` klasöründe tutulur (git'e gitmez). Bunu kimseyle paylaşma.
- `.env` içindeki `MENU_SOURCE_URL` sayesinde bot menüyü her gün GitHub'dan en güncel haliyle çeker; `git pull` yapman gerekmez.
- Bu yöntem WhatsApp'ın resmi API'si değildir. Günde bir mesaj gibi düşük kullanımda sorun çıkması beklenmez, ama
  istersen ana numaran yerine ayrı bir numara kullanabilirsin.

---

## Yöntem 2: Bilgisayar açık kalmadan, GitHub Actions + Green API

[Green API](https://green-api.com) bir WhatsApp numarasını HTTP API'ye bağlayan bir servis (ücretsiz geliştirici
planı ve ücretli planları var). Gönderim GitHub'ın sunucularında, `.github/workflows/whatsapp-menu.yml` ile
her hafta içi 10:30'da otomatik çalışır.

1. green-api.com'da hesap aç, bir instance oluştur, QR'ı telefonla okutarak numaranı bağla.
   `idInstance` ve `apiTokenInstance` değerlerini not al.
2. Grup kimliğini bul: `whatsapp-bot/.env` içine `GREEN_API_INSTANCE_ID` ve `GREEN_API_TOKEN` yaz, sonra
   `npm run greenapi -- gruplar` çalıştır (veya Green API panelindeki `getContacts` metodunu kullan).
3. GitHub'da repo → **Settings → Secrets and variables → Actions**:
   - Secrets: `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN`, `WHATSAPP_GROUP_ID`
   - (İsteğe bağlı) Variables: `SITE_URL`, `GREEN_API_URL` (Green API panelinde farklı bir apiUrl görüyorsan)
4. **Actions → WhatsApp günlük menü → Run workflow** ile hemen test et.

Workflow `main` dalındaki menüyü kullanır ve o gün için menü yoksa (hafta sonu, tatil) mesaj göndermez.
