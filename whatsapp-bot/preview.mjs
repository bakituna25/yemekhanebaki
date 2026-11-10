// Göndermeden önizleme: görüntüyü onizleme.png olarak kaydeder, açıklamayı ekrana basar.
//   node preview.mjs [YYYY-MM-DD]   (verilen tarihte çalışmış gibi davranır)
import { writeFile } from 'node:fs/promises';
import { weeklyMenu } from './weekly.mjs';

const now = process.argv[2] ? new Date(`${process.argv[2]}T09:00:00+03:00`) : new Date();
const result = await weeklyMenu({ now });
if (!result) {
  console.log('Bu hafta için sitede menü yok.');
} else {
  await writeFile(new URL('./onizleme.png', import.meta.url), result.image);
  console.log(`Günler: ${result.days.join(', ')}\n\n${result.caption}\n\nGörüntü: whatsapp-bot/onizleme.png`);
}
