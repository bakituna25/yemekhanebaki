#!/bin/bash
# macOS'a "her pazar 21:00'de gelecek haftanın menüsünü gönder" görevini ekler (launchd).
# Arka planda sürekli çalışan bir şey olmaz: macOS o saatte botu açar, mesajı gönderir, bot kapanır.
# Mac o saatte uykudaysa (kapak kapalı), uyandığında gönderir.
#
#   ./gorev-kur.sh            -> görevi kur (pazar 21:00)
#   ./gorev-kur.sh 08:45      -> farklı saatle kur
#   ./gorev-kur.sh kaldir     -> görevi kaldır
set -euo pipefail

ETIKET="com.yemekhane.whatsapp"
PLIST="${LAUNCH_AGENTS_DIR:-$HOME/Library/LaunchAgents}/$ETIKET.plist"
ALAN="gui/$(id -u)"

if [[ "${1:-}" == "kaldir" ]]; then
  launchctl bootout "$ALAN" "$PLIST" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Görev kaldırıldı."
  exit 0
fi

SAAT="${1:-21:00}"
if ! [[ "$SAAT" =~ ^([01]?[0-9]|2[0-3]):([0-5][0-9])$ ]]; then
  echo "Saat SS:DD biçiminde olmalı, ör. 21:00"; exit 1
fi
HH=$((10#${BASH_REMATCH[1]})); MM=$((10#${BASH_REMATCH[2]}))

KLASOR="$(cd "$(dirname "$0")" && pwd)"
NODE="$(command -v node || true)"
[[ -n "$NODE" ]] || { echo "Node.js bulunamadı. https://nodejs.org adresinden kur."; exit 1; }
[[ -f "$KLASOR/.env" ]] || { echo ".env dosyası yok. Önce kurulum adımlarını tamamla."; exit 1; }
[[ -d "$KLASOR/auth" ]] || { echo "WhatsApp bağlantısı yok. Önce 'npm run gruplar' ile QR okut."; exit 1; }
case "$KLASOR" in
  "$HOME/Documents"*|"$HOME/Desktop"*|"$HOME/Downloads"*)
    echo "Uyarı: macOS, zamanlanmış görevlerin Belgeler/Masaüstü/İndirilenler klasörlerine erişimini engelleyebilir."
    echo "Projeyi doğrudan ana klasörüne (~/yemekhanebaki) taşıman önerilir." ;;
esac

mkdir -p "$(dirname "$PLIST")"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$ETIKET</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>--env-file-if-exists=.env</string>
    <string>bot.mjs</string>
    <string>gonder</string>
  </array>
  <key>WorkingDirectory</key><string>$KLASOR</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>0</integer>
    <key>Hour</key><integer>$HH</integer>
    <key>Minute</key><integer>$MM</integer>
  </dict>
  <key>StandardOutPath</key><string>$KLASOR/gonder.log</string>
  <key>StandardErrorPath</key><string>$KLASOR/gonder.log</string>
</dict>
</plist>
PLIST

launchctl bootout "$ALAN" "$PLIST" 2>/dev/null || true
launchctl bootstrap "$ALAN" "$PLIST"

printf '\nTamam! Gelecek haftanın menüsü her pazar saat %02d:%02d itibarıyla gruba gönderilecek.\n' "$HH" "$MM"
echo "Kayıtlar: $KLASOR/gonder.log"
echo "Hemen denemek için: launchctl kickstart $ALAN/$ETIKET"
