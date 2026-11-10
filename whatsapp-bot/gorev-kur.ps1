# Windows Görev Zamanlayıcısı'na "her pazartesi 09:30'da haftalık menüyü gönder" görevini ekler.
# Arka planda sürekli çalışan bir şey olmaz: görev o saatte botu açar, mesajı gönderir, bot kapanır.
# Bilgisayar 09:30'da kapalıysa, açıldığında ilk fırsatta gönderir.
#
# Çalıştırmak için (whatsapp-bot klasöründe):
#   powershell -ExecutionPolicy Bypass -File gorev-kur.ps1
# Kaldırmak için:
#   powershell -ExecutionPolicy Bypass -File gorev-kur.ps1 -Kaldir

param([switch]$Kaldir, [string]$Saat = "09:30")

$GorevAdi = "Yemekhane WhatsApp Haftalik Menu"

if ($Kaldir) {
    Unregister-ScheduledTask -TaskName $GorevAdi -Confirm:$false
    Write-Host "Görev kaldırıldı."
    exit
}

$Klasor = $PSScriptRoot
$Node = (Get-Command node -ErrorAction Stop).Source
if (-not (Test-Path (Join-Path $Klasor ".env"))) { throw ".env dosyası yok. Önce kurulum adımlarını tamamla." }
if (-not (Test-Path (Join-Path $Klasor "auth"))) { throw "WhatsApp bağlantısı yok. Önce 'npm run gruplar' ile QR okut." }

$Komut = "/c `"`"$Node`" --env-file-if-exists=.env bot.mjs gonder >> gonder.log 2>&1`""
$Eylem = New-ScheduledTaskAction -Execute "cmd.exe" -Argument $Komut -WorkingDirectory $Klasor
$Tetik = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $Saat
$Ayar = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

Register-ScheduledTask -TaskName $GorevAdi -Action $Eylem -Trigger $Tetik -Settings $Ayar -Force | Out-Null

Write-Host ""
Write-Host "Tamam! Her pazartesi $Saat'da haftalık menü gruba gönderilecek." -ForegroundColor Green
Write-Host "Kayıtlar: $Klasor\gonder.log"
Write-Host "Hemen denemek için: Start-ScheduledTask -TaskName '$GorevAdi'"
