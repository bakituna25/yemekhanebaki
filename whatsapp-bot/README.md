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
- Haftanın hiç menüsü yoksa mesaj göndermez. Bazı günlerin menüsü yoksa (tatil vb.) o günler `renkli` tasarımda
  "Yemek servisi yok" yazan boş kart olarak görünür.
- Üç tasarım var, `.env` içindeki `TASARIM` ile seçilir: `acik` (sitenin açık teması), `koyu` (sitenin koyu teması),
  `renkli` (sade kurumsal tasarım, her gün ince bir renk vurgusuyla).
- Önizleme (bir şey göndermez): `npm run onizle` → `onizleme-<tasarım>.png`. Üçünü birden görmek için
  `npm run onizle -- hepsi`, belirli bir tarih için `npm run onizle -- renkli 2026-11-24`

İki yöntem var; birini seç.

---

## Yöntem 1: Kendi numaranla, ücretsiz (Mac)

Bot, WhatsApp Web gibi senin numarana "bağlı cihaz" olarak bağlanır ve mesajı senin adına atar.
Arka planda sürekli çalışan bir şey yoktur: macOS her pazar 21:00'de botu açar, bot gelecek haftanın menüsünü gönderir ve kapanır.

### Bir kerelik kurulum

1. **Node.js** kur: https://nodejs.org → "LTS" sürümünü (macOS Installer) indirip kur.
2. **Terminal**'i aç (Spotlight: ⌘ + Boşluk → "Terminal") ve sırayla çalıştır:

   ```bash
   cd ~
   git clone -b claude/determined-edison-sgw3uj https://github.com/bakituna25/yemekhanebaki.git
   cd yemekhanebaki/whatsapp-bot
   npm install
   cp .env.example .env
   ```

   - `git` ilk kez kullanılıyorsa macOS "komut satırı geliştirici araçlarını yükle" penceresi açar: **Yükle** de,
     bitince `git clone` satırını tekrar çalıştır.
   - Projeyi ana klasöre (`~`) kuruyoruz; Belgeler/Masaüstü klasörlerine erişimi macOS zamanlanmış görevlere kısıtlıyor.
   - `npm install` botun kullandığı tarayıcıyı (Chromium) da indirir, birkaç dakika sürebilir.

3. Görüntüyü kontrol et: `npm run onizle -- hepsi`, sonra `open onizleme-*.png`
4. WhatsApp'ı bağla ve grubu bul: `npm run gruplar`
   - Terminalde çıkan QR kodu telefondan **WhatsApp > Ayarlar > Bağlı cihazlar > Cihaz bağla** ile okut.
   - Grupların listelenir. Menünün gideceği grubun `...@g.us` ile biten kimliğini kopyala.
5. `open -e .env` ile dosyayı aç, `GROUP_ID=` satırının sonuna kopyaladığın kimliği yapıştır, kaydet (⌘ + S).
6. Deneme gönderimi: `npm run gonder` → haftanın menüsü hemen gruba gider.
7. Her pazartesi otomatik gönderim için görevi kur: `./gorev-kur.sh`

Bitti. Her gönderimin kaydı `~/yemekhanebaki/whatsapp-bot/gonder.log` dosyasına yazılır (`open gonder.log`).

### Bilmen gerekenler

- Mac pazar 21:00'de **uykudaysa** (kapak kapalı), uyandığında gönderir. **Tamamen kapalıysa** o hafta gönderilmez;
  öyle bir haftada `npm run gonder` ile elle gönderebilirsin.
- Gönderim saatini değiştirmek: `./gorev-kur.sh 20:30` — görevi kaldırmak: `./gorev-kur.sh kaldir`
- Telefonda **Bağlı cihazlar** listesinde bot bir cihaz olarak görünür. Oradan çıkış yaparsan bot çalışmaz;
  `rm -rf auth` ile oturumu silip 4. adımı tekrarla.
- `auth` klasörü WhatsApp oturumundur, kimseyle paylaşma (git'e gönderilmez).
- Bu yöntem WhatsApp'ın resmi API'si değildir. Haftada bir mesajda sorun beklenmez.

---

## Yöntem 2: Bilgisayar açık kalmadan, GitHub Actions + Green API

[Green API](https://green-api.com) bir WhatsApp numarasını HTTP API'ye bağlayan bir servis (ücretsiz geliştirici
planı ve ücretli planları var). Gönderim GitHub'ın sunucularında, `.github/workflows/whatsapp-menu.yml` ile
her pazar 21:00'de otomatik çalışır.

1. green-api.com'da hesap aç, bir instance oluştur, QR'ı telefonla okutarak numaranı bağla.
   Paneldeki `idInstance`, `apiTokenInstance`, `apiUrl` ve `mediaUrl` değerlerini not al.
2. Grup kimliğini bul: `whatsapp-bot/.env` içine `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN` ve `GREEN_API_URL` yaz, sonra
   `npm run greenapi -- gruplar` çalıştır (veya Green API panelindeki `getContacts` metodunu kullan).
3. GitHub'da repo → **Settings → Secrets and variables → Actions**:
   - Secrets: `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN`, `WHATSAPP_GROUP_ID`
   - Variables: (isteğe bağlı) `SITE_URL` — boşsa https://yemeklist.vercel.app kullanılır, `GREEN_API_URL` (apiUrl), `GREEN_API_MEDIA_URL` (mediaUrl)
4. **Actions → WhatsApp haftalık menü → Run workflow** ile hemen test et.

GitHub zamanlanmış görevleri yalnızca varsayılan dalda (`main`) çalıştırır; bu dosyaların `main`'de olması gerekir.
