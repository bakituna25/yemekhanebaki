// Göndermeden önizleme: görüntüyü onizleme-<tasarım>.png olarak kaydeder, açıklamayı ekrana basar.
//   node preview.mjs                      -> .env'deki TASARIM (varsayılan: acik)
//   node preview.mjs hepsi                -> üç tasarımın hepsi
//   node preview.mjs renkli 2026-11-24    -> belirli tasarım ve tarih
import { writeFile } from 'node:fs/promises';
import { TASARIMLAR, weeklyMenu } from './weekly.mjs';

const args = process.argv.slice(2);
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const choice = args.find((a) => a !== dateArg) || process.env.TASARIM || 'acik';
const now = dateArg ? new Date(`${dateArg}T09:00:00+03:00`) : new Date();

for (const tasarim of choice === 'hepsi' ? TASARIMLAR : [choice]) {
  const result = await weeklyMenu({ now, tasarim });
  if (!result) {
    console.log('Bu hafta için sitede menü yok.');
    break;
  }
  const file = `onizleme-${tasarim}.png`;
  await writeFile(new URL(`./${file}`, import.meta.url), result.image);
  console.log(`${tasarim}: whatsapp-bot/${file}`);
  if (tasarim === TASARIMLAR.at(-1) || choice !== 'hepsi') console.log(`\nAçıklama:\n${result.caption}`);
}
