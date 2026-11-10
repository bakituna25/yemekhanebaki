// Mesajı göndermeden ekrana basar:  node preview.mjs [YYYY-MM-DD]
import { messageFor, todayInIstanbul } from './menu.mjs';

const date = process.argv[2] || todayInIstanbul();
const msg = await messageFor(date);
console.log(msg ?? `${date} için menü yok.`);
