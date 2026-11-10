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

## Yöntem 1: Kendi numaranla, ücretsiz (Windows bilgisayar)

Bot, WhatsApp Web gibi senin numarana "bağlı cihaz" olarak bağlanır ve mesajı senin adına atar.
Arka planda sürekli çalışan bir şey yoktur: Windows Görev Zamanlayıcısı her pazartesi 09:30'da botu açar,
bot menüyü gönderir ve kapanır. Bilgisayar o saatte kapalıysa, açıldığında ilk fırsatta gönderir.

### Bir kerelik kurulum

1. **Node.js** kur: https://nodejs.org → "LTS" sürümünü indirip varsayılan ayarlarla kur.
2. **Git** kur (yoksa): https://git-scm.com/download/win
3. Başlat menüsünden **PowerShell** aç ve sırayla çalıştır:

   ```powershell
   cd $HOME\Documents
   git clone -b claude/determined-edison-sgw3uj https://github.com/bakituna25/yemekhanebaki.git
   cd yemekhanebaki\whatsapp-bot
   npm install
   copy .env.example .env
   ```

   `npm install` botun kullandığı tarayıcıyı (Chromium) da indirir, birkaç dakika sürebilir.

4. Görüntüyü kontrol et: `npm run onizle` → klasördeki `onizleme.png` dosyasını aç.
5. WhatsApp'ı bağla ve grubu bul: `npm run gruplar`
   - Ekranda çıkan QR kodu telefondan **WhatsApp > Ayarlar > Bağlı cihazlar > Cihaz bağla** ile okut.
   - Grupların listelenir. Menünün gideceği grubun `...@g.us` ile biten kimliğini kopyala.
6. `notepad .env` ile dosyayı aç, `GROUP_ID=` satırının sonuna kopyaladığın kimliği yapıştır, kaydet.
7. Deneme gönderimi: `npm run gonder` → haftanın menüsü hemen gruba gider.
8. Her pazartesi otomatik gönderim için görevi kur:

   ```powershell
   powershell -ExecutionPolicy Bypass -File gorev-kur.ps1
   ```

Bitti. Kontrol etmek istersen: Başlat menüsü → **Görev Zamanlayıcı** → "Yemekhane WhatsApp Haftalik Menu".
Her gönderimin kaydı `whatsapp-bot\gonder.log` dosyasına yazılır.

### Bilmen gerekenler

- Gönderim saatini değiştirmek: `powershell -ExecutionPolicy Bypass -File gorev-kur.ps1 -Saat 08:45`
- Görevi kaldırmak: `powershell -ExecutionPolicy Bypass -File gorev-kur.ps1 -Kaldir`
- Görev, Windows'ta oturum açıkken çalışır (bilgisayarı açıp giriş yapman yeterli).
- Telefonda **Bağlı cihazlar** listesinde bot bir cihaz olarak görünür. Oradan çıkış yaparsan bot çalışmaz;
  `whatsapp-bot\auth` klasörünü silip 5. adımı tekrarla.
- `auth` klasörü WhatsApp oturumundur, kimseyle paylaşma (git'e gönderilmez).
- Bu yöntem WhatsApp'ın resmi API'si değildir. Haftada bir mesajda sorun beklenmez.
- Bilgisayar sürekli açıksa, görev yerine `npm run baslat` ile botu açık bırakarak da kullanabilirsin
  (zamanı `.env` içindeki `CRON` belirler).

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
   - Variables: (isteğe bağlı) `SITE_URL` — boşsa https://yemeklist.vercel.app kullanılır, `GREEN_API_URL` (apiUrl), `GREEN_API_MEDIA_URL` (mediaUrl)
4. **Actions → WhatsApp haftalık menü → Run workflow** ile hemen test et.

GitHub zamanlanmış görevleri yalnızca varsayılan dalda (`main`) çalıştırır; bu dosyaların `main`'de olması gerekir.
