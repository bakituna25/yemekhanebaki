import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Utensils, Info, MapPin, Clock, Moon, Sun, Grid, List, Leaf, ArrowRightLeft, RefreshCw, Languages } from 'lucide-react';

// AGÜ Kurumsal Renkleri:
// Kırmızı: #C41230

// Çoklu Dil Desteği İçin Veri Yapısı
const RAW_MENU_ITEMS = [
  // 1. Hafta - Ocak 2026
  {
    date: '2026-01-02',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Köy Çorba', en: 'Village Soup', c: 130 },
    main: { tr: 'Çiftlik Köfte', en: 'Farm Meatballs', c: 450 },
    veg: { tr: 'Barbunya Plaki', en: 'Kidney Beans in Olive Oil', c: 330 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 300 },
    extra: { tr: 'Haydari', en: 'Haydari (Yogurt Dip)', c: 120 }
  },

  // 2. Hafta
  {
    date: '2026-01-05',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Mercimek Çorba', en: 'Lentil Soup', c: 130 },
    main: { tr: 'Piliç Fajita', en: 'Chicken Fajita', c: 480 },
    veg: { tr: 'Beşamel Soslu Brokoli', en: 'Broccoli with Bechamel Sauce', c: 280 },
    side: { tr: 'Soslu Makarna', en: 'Pasta with Sauce', c: 320 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 80 }
  },
  {
    date: '2026-01-06',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Şafak Çorba', en: 'Safak Soup', c: 150 },
    main: { tr: 'Kıymalı Sebze Sote', en: 'Sautéed Vegetables with Minced Meat', c: 350 },
    veg: { tr: 'Zeytinyağlı Pırasa', en: 'Leeks in Olive Oil', c: 250 },
    side: { tr: 'Meyhane Pilavı', en: 'Bulgur Pilaf with Vegetables', c: 320 },
    extra: { tr: 'Cacık', en: 'Tzatziki', c: 110 }
  },
  {
    date: '2026-01-07',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Ezogelin Çorba', en: 'Ezogelin Soup', c: 150 },
    main: { tr: 'İzmir Köfte', en: 'Izmir Meatballs', c: 540 },
    veg: { tr: 'Dolma Biber', en: 'Stuffed Peppers', c: 180 },
    side: { tr: 'Börek', en: 'Pastry (Börek)', c: 380 },
    extra: { tr: 'Supangle', en: 'Supangle (Chocolate Pudding)', c: 300 }
  },
  {
    date: '2026-01-08',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Arapaşı Çorba', en: 'Arapasi Soup', c: 140 },
    main: { tr: 'Etli Nohut', en: 'Chickpea Stew with Meat', c: 430 },
    veg: { tr: 'Etsiz Nohut', en: 'Chickpea Stew (Meatless)', c: 350 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 300 },
    extra: { tr: 'Mısırlı Salata', en: 'Corn Salad', c: 150 }
  },
  {
    date: '2026-01-09',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Yayla Çorba', en: 'Yayla (Yogurt) Soup', c: 100 },
    main: { tr: 'Ankara Tava', en: 'Ankara Casserole', c: 420 },
    veg: { tr: 'Arpa Şehriye Pilavı', en: 'Orzo Pilaf', c: 300 },
    side: { tr: 'Zeytinyağlı Fasulye', en: 'Green Beans in Olive Oil', c: 250 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 80 }
  },

  // 3. Hafta
  {
    date: '2026-01-12',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Ezogelin Çorba', en: 'Ezogelin Soup', c: 140 },
    main: { tr: 'Piliç Roti', en: 'Roast Chicken', c: 320 },
    veg: { tr: 'Sebze Buketi', en: 'Vegetable Bouquet', c: 200 },
    side: { tr: 'Soslu Makarna', en: 'Pasta with Sauce', c: 320 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 80 }
  },
  {
    date: '2026-01-13',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Tavuk Çorba', en: 'Chicken Soup', c: 120 },
    main: { tr: 'Etli Kuru Fasulye', en: 'White Bean Stew with Meat', c: 410 },
    veg: { tr: 'Fırın Karnabahar', en: 'Baked Cauliflower', c: 170 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 300 },
    extra: { tr: 'Turşu', en: 'Pickles', c: 30 }
  },
  {
    date: '2026-01-14',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Domates Çorba', en: 'Tomato Soup', c: 100 },
    main: { tr: 'Garnitürlü Izgara Köfte', en: 'Grilled Meatballs with Garnish', c: 480 },
    veg: { tr: 'Şakşuka', en: 'Shakshuka', c: 320 },
    side: { tr: 'Spagetti', en: 'Spaghetti', c: 320 },
    extra: { tr: 'Ayran', en: 'Ayran (Yogurt Drink)', c: 115 }
  },
  {
    date: '2026-01-15',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Toyga Çorba', en: 'Toyga Soup', c: 135 },
    main: { tr: 'Etli Türlü', en: 'Mixed Vegetable Stew with Meat', c: 450 },
    veg: { tr: 'Etsiz Türlü', en: 'Meatless Mixed Vegetable Stew', c: 320 },
    side: { tr: 'Meyhane Pilavı', en: 'Bulgur Pilaf with Vegetables', c: 320 },
    extra: { tr: 'Kalburabastı', en: 'Kalburabasti Dessert', c: 320 }
  },
  {
    date: '2026-01-16',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Mercimek Çorba', en: 'Lentil Soup', c: 130 },
    main: { tr: 'Tas Kebabı', en: 'Bowl Kebab (Tas Kebab)', c: 470 },
    veg: { tr: 'Kabak Kalye', en: 'Zucchini Stew', c: 220 },
    side: { tr: 'Börek', en: 'Pastry (Börek)', c: 380 },
    extra: { tr: 'Haydari', en: 'Haydari (Yogurt Dip)', c: 120 }
  },

  // 4. Hafta
  {
    date: '2026-01-19',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Mercimek Çorba', en: 'Lentil Soup', c: 130 },
    main: { tr: 'Püreli Rosto Köfte', en: 'Roast Meatballs with Puree', c: 510 },
    veg: { tr: 'Ispanak Yemeği', en: 'Spinach Dish', c: 280 },
    side: { tr: 'Napoliten Soslu Makarna', en: 'Pasta with Neapolitan Sauce', c: 300 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 80 }
  },
  {
    date: '2026-01-20',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Arabaşı Çorba', en: 'Arabasi Soup', c: 150 },
    main: { tr: 'Etli Nohut', en: 'Chickpea Stew with Meat', c: 430 },
    veg: { tr: 'Nohut Yemeği (Etsiz)', en: 'Chickpea Stew (Meatless)', c: 350 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 300 },
    extra: { tr: 'Mevsim Salata', en: 'Seasonal Salad', c: 60 }
  },
  {
    date: '2026-01-21',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Yayla Çorba', en: 'Yayla (Yogurt) Soup', c: 135 },
    main: { tr: 'Orman Kebabı', en: 'Forest Kebab', c: 425 },
    veg: { tr: 'Bezelye Yemeği', en: 'Peas Dish', c: 260 },
    side: { tr: 'Peynirli Börek', en: 'Cheese Pastry', c: 380 },
    extra: { tr: 'Browni', en: 'Brownie', c: 320 }
  },
  {
    date: '2026-01-22',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Mengen Çorba', en: 'Mengen Soup', c: 120 },
    main: { tr: 'Tavuk Tantuni', en: 'Chicken Tantuni', c: 400 },
    veg: { tr: 'Beşamel Soslu Brokoli', en: 'Broccoli with Bechamel Sauce', c: 280 },
    side: { tr: 'Nohutlu Pirinç Pilavı', en: 'Rice Pilaf with Chickpeas', c: 320 },
    extra: { tr: 'Ayran', en: 'Ayran (Yogurt Drink)', c: 115 }
  },
  {
    date: '2026-01-23',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Cennet Çorba', en: 'Paradise (Cennet) Soup', c: 140 },
    main: { tr: 'Karnıyarık', en: 'Split Eggplant with Meat (Karnıyarık)', c: 480 },
    veg: { tr: 'İmam Bayıldı', en: 'Stuffed Split Eggplant (Imam Bayildi)', c: 330 },
    side: { tr: 'Bulgur Pilavı', en: 'Bulgur Pilaf', c: 290 },
    extra: { tr: 'Cacık', en: 'Tzatziki', c: 110 }
  },

  // 5. Hafta
  {
    date: '2026-01-26',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Şehriye Çorba', en: 'Vermicelli Soup', c: 100 },
    main: { tr: 'Garnitürlü Tavuk Sarma', en: 'Stuffed Chicken Roll with Garnish', c: 480 },
    veg: { tr: 'Kabak Mücver', en: 'Zucchini Fritters', c: 220 },
    side: { tr: 'Garnitürlü Pirinç Pilavı', en: 'Rice Pilaf with Garnish', c: 330 },
    extra: { tr: 'Ayran', en: 'Ayran (Yogurt Drink)', c: 115 }
  },
  {
    date: '2026-01-27',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Köy Çorba', en: 'Village Soup', c: 130 },
    main: { tr: 'Bahçıvan Kebabı', en: 'Gardener\'s Kebab', c: 430 },
    veg: { tr: 'Ispanak Graten', en: 'Spinach Gratin', c: 300 },
    side: { tr: 'Kuskus Pilavı', en: 'Couscous Pilaf', c: 310 },
    extra: { tr: 'Trileçe', en: 'Tres Leches Cake', c: 250 }
  },
  {
    date: '2026-01-28',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Süzme Mercimek Çorba', en: 'Strained Lentil Soup', c: 130 },
    main: { tr: 'Terbiyeli Köfte', en: 'Meatballs in Sour Sauce', c: 420 },
    veg: { tr: 'Sebze Buketi', en: 'Vegetable Bouquet', c: 200 },
    side: { tr: 'Börek', en: 'Pastry (Börek)', c: 380 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 80 }
  },
  {
    date: '2026-01-29',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Tavuk Çorba', en: 'Chicken Soup', c: 120 },
    main: { tr: 'Etli Kuru Fasulye', en: 'White Bean Stew with Meat', c: 410 },
    veg: { tr: 'Etsiz Kuru Fasulye', en: 'Meatless White Bean Stew', c: 350 },
    side: { tr: 'Arpa Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 300 },
    extra: { tr: 'Karışık Turşu', en: 'Mixed Pickles', c: 30 }
  },
  {
    date: '2026-01-30',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Şafak Çorba', en: 'Safak Soup', c: 100 },
    main: { tr: 'Garnitürlü Cordon Blue', en: 'Cordon Bleu with Garnish', c: 510 },
    veg: { tr: 'Zeytinyağlı Pırasa', en: 'Leeks in Olive Oil', c: 250 },
    side: { tr: 'Soslu Makarna', en: 'Pasta with Sauce', c: 320 },
    extra: { tr: 'Karalahana Havuç Salata', en: 'Kale and Carrot Salad', c: 110 }
  },

  // --- 2026 MAYIS MENÜSÜ (MARJİNAL YEMEK HİZMETLERİ) ---
  
  // 1. Hafta
  { 
    date: '2026-05-04', 
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Zerdeçallı Mercimek Çorbası', en: 'Turmeric Lentil Soup', c: 178 },
    main: { tr: 'Fırında Piliç', en: 'Baked Chicken', c: 754 },
    veg: { tr: 'İmam Bayıldı', en: 'Stuffed Eggplant', c: 200 },
    side: { tr: 'Mısırlı Bulgur Pilavı', en: 'Bulgur Pilaf with Corn', c: 302 },
    extra: { tr: 'Salata & Ayran', en: 'Salad & Ayran', c: 210 } 
  },
  { 
    date: '2026-05-05', 
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Alaca Çorba', en: 'Alaca Soup', c: 175 },
    main: { tr: 'Kıymalı Taze Fasulye', en: 'Green Beans with Minced Meat', c: 289 },
    veg: { tr: 'Beşamel Soslu Patates', en: 'Potatoes with Béchamel Sauce', c: 396 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 341 },
    extra: { tr: 'Meyveli Yaş Pasta', en: 'Fruit Cake', c: 250 } 
  },
  { 
    date: '2026-05-06', 
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Cennet Çorbası', en: 'Cennet Soup', c: 105 },
    main: { tr: 'İzmir Köfte', en: 'Izmir Meatballs', c: 785 },
    veg: { tr: 'Zeytinyağlı Biber Dolma', en: 'Stuffed Peppers', c: 100 },
    side: { tr: 'Yoğurtlu Makarna', en: 'Pasta with Yogurt', c: 392 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 200 } 
  },
  { 
    date: '2026-05-07', 
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Ezogelin Çorbası', en: 'Ezogelin Soup', c: 186 },
    main: { tr: 'Kıymalı Patlıcan Musakka', en: 'Eggplant Moussaka', c: 368 },
    veg: { tr: 'Karışık Kızartma', en: 'Mixed Fried Vegetables', c: 436 },
    side: { tr: 'Nohutlu Pirinç Pilavı', en: 'Rice Pilaf with Chickpeas', c: 376 },
    extra: { tr: 'Yoğurt', en: 'Yogurt', c: 136 } 
  },
  { 
    date: '2026-05-08', 
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Kremalı Mantar Çorbası', en: 'Cream of Mushroom Soup', c: 231 },
    main: { tr: 'Tas Kebabı', en: 'Tas Kebab', c: 785 },
    veg: { tr: 'Zeytinyağlı Barbunya', en: 'Pinto Beans in Olive Oil', c: 190 },
    side: { tr: 'Saçaklı Pilav', en: 'Pilaf with Orzo', c: 302 },
    extra: { tr: 'Revani', en: 'Revani Dessert', c: 350 } 
  },

  // 2. Hafta
  { 
    date: '2026-05-11', 
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Sebze Çorbası', en: 'Vegetable Soup', c: 265 },
    main: { tr: 'Kadınbudu Köfte & Patates', en: 'Kadınbudu Meatballs & Potatoes', c: 363 },
    veg: { tr: 'Mantar Sote', en: 'Sauteed Mushrooms', c: 280 },
    side: { tr: 'Soslu Spagetti', en: 'Spaghetti with Sauce', c: 290 },
    extra: { tr: 'Salata', en: 'Salad', c: 135 } 
  },
  { 
    date: '2026-05-12', 
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Arabaşı Çorbası', en: 'Arabaşı Soup', c: 308 },
    main: { tr: 'Etli Patates Tava', en: 'Potato Pan with Meat', c: 430 },
    veg: { tr: 'Beşamel Soslu Karnabahar', en: 'Cauliflower with Béchamel Sauce', c: 536 },
    side: { tr: 'Arpa Şehriye Pilavı', en: 'Orzo Pilaf', c: 341 },
    extra: { tr: 'Kıbrıs Tatlısı', en: 'Cyprus Dessert', c: 350 } 
  }
];

// Dil metinleri
const LABELS = {
  tr: {
    daily: 'Günlük',
    weekly: 'Haftalık',
    monthly: 'Aylık',
    soup: 'Çorba',
    main: 'Ana Yemek',
    veg: 'Vejetaryen',
    side: 'Yan Yemek',
    extra: 'Ekstra',
    totalCal: 'Toplam Kalori',
    todayMenu: 'BUGÜNÜN MENÜSÜ',
    noData: 'Veri Bulunamadı',
    noService: 'Yemek Servisi Yok',
    noServiceDesc: 'Bu tarih için yemekhane kapalı veya menü planlanmamış.',
    dataNotFoundDesc: 'Bu tarih aralığı için menü verisi mevcut değil.',
    switchVeg: 'Vejetaryen Menüye Geç',
    switchMain: 'Klasik Menüye Geç',
    today: 'Bugün',
    prevWorkday: 'Önceki İş Günü',
    nextWorkday: 'Sonraki İş Günü'
  },
  en: {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    soup: 'Soup',
    main: 'Main Course',
    veg: 'Vegetarian',
    side: 'Side Dish',
    extra: 'Extra',
    totalCal: 'Total Calories',
    todayMenu: "TODAY'S MENU",
    noData: 'No Data Found',
    noService: 'No Service',
    noServiceDesc: 'The cafeteria is closed or no menu is planned for this date.',
    dataNotFoundDesc: 'No menu data available for this date range.',
    switchVeg: 'Switch to Vegetarian Menu',
    switchMain: 'Switch to Classic Menu',
    today: 'Today',
    prevWorkday: 'Prev Workday',
    nextWorkday: 'Next Workday'
  }
};

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MealCard = ({ title, item, isVeg = false, toggleAction = null }) => (
  <div
    onClick={toggleAction}
    className={`flex items-center py-4 border-b border-gray-100 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors px-3 rounded-lg -mx-2 ${toggleAction ? 'cursor-pointer group select-none active:bg-gray-100 dark:active:bg-slate-800' : ''}`}
  >

    <div className="flex-1 min-w-0 mr-4">
      {/* Başlık ve İkon */}
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`text-xs uppercase tracking-wider font-bold transition-colors ${toggleAction ? 'group-hover:text-gray-600 dark:group-hover:text-slate-300' : ''} text-gray-400 dark:text-slate-500`}>
          {title}
        </span>
        {toggleAction && (
          <RefreshCw
            size={12}
            strokeWidth={2.5}
            className={`transition-all duration-300 ${isVeg ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-600"} group-hover:rotate-180 opacity-60 group-hover:opacity-100`}
          />
        )}
      </div>

      <span className={`block font-medium text-base sm:text-lg leading-tight truncate ${isVeg ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-slate-200'}`}>
        {item.name}
      </span>
    </div>

    {/* Sağ Kısım: Kalori ve kcal yan yana */}
    <div className="text-right shrink-0 min-w-[3.5rem] whitespace-nowrap">
      <span className="text-sm font-bold text-[#C41230] dark:text-red-400">
        {item.cal}
      </span>
      <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase ml-1">
        kcal
      </span>
    </div>
  </div>
);

const DailyMenuCard = ({ menu, isToday, compact = false, expanded = false, isEnglish }) => {
  const [isVegMode, setIsVegMode] = useState(false);
  const lang = isEnglish ? 'en' : 'tr';
  const texts = LABELS[lang];

  if (!menu) return null;

  const [y, m, d] = menu.date.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dateStr = dateObj.toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // İlgili dildeki veriyi seç
  const soup = { name: menu.soup[lang], cal: menu.soup.c };
  const main = { name: menu.main[lang], cal: menu.main.c };
  const veg = { name: menu.veg[lang], cal: menu.veg.c };
  const side = { name: menu.side[lang], cal: menu.side.c };
  const extra = { name: menu.extra[lang], cal: menu.extra.c };
  const dayName = isEnglish ? menu.dayEn : menu.dayTr;

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none border ${isToday ? 'border-[#C41230] ring-1 ring-[#C41230]/50' : 'border-gray-200 dark:border-zinc-800'} overflow-hidden transition-all duration-300 w-full h-full flex flex-col`}>
      {isToday && (
        <div className="bg-[#C41230] text-white text-center text-sm font-bold py-2 tracking-widest uppercase shadow-sm">
          {texts.todayMenu}
        </div>
      )}
      <div className={`p-6 sm:p-8 flex flex-col ${expanded ? 'justify-center h-full' : ''}`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-slate-700/50">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">{dayName}</h3>
            <p className="text-base text-gray-500 dark:text-slate-400 font-medium">{dateStr}</p>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          <MealCard title={texts.soup} item={soup} />

          {/* Ana Yemek / Vejetaryen Geçişli Kart */}
          <MealCard
            title={isVegMode ? texts.veg : texts.main}
            item={isVegMode ? veg : main}
            isVeg={isVegMode}
            toggleAction={() => setIsVegMode(!isVegMode)}
          />

          <MealCard title={texts.side} item={side} />
          {!compact && <MealCard title={texts.extra} item={extra} />}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
          <div className="text-sm text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wide">
            {texts.totalCal}
          </div>
          {/* Toplam Kalori ve kcal yan yana */}
          <div className="text-right whitespace-nowrap">
            <span className="text-xl font-bold text-[#C41230] dark:text-red-400">
              {isVegMode
                ? soup.cal + veg.cal + side.cal + extra.cal
                : soup.cal + main.cal + side.cal + extra.cal
              }
            </span>
            <span className="text-sm font-medium text-gray-400 dark:text-slate-500 uppercase ml-1">kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AGUDiningApp() {
  const [viewMode, setViewMode] = useState('weekly'); // 'daily', 'weekly', 'monthly'
  const [currentRefDate, setCurrentRefDate] = useState(new Date());

  // Dark mode state'ini localStorage'dan oku, yoksa sistem tercihini kullan
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      console.log('🚀 Initializing dark mode. localStorage value:', saved);
      
      let initialValue = false;
      // Eğer kullanıcı daha önce bir tercih yapmışsa onu kullan
      if (saved !== null) {
        console.log('📦 Using saved preference:', saved);
        initialValue = saved === 'true';
      } else {
        // Yoksa sistem tercihini kontrol et
        initialValue = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log('🖥️ No saved preference, using system preference:', initialValue ? 'dark' : 'light');
      }
      
      if (initialValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return initialValue;
    }
    return false;
  });

  // Dil state'ini localStorage'dan oku
  const [isEnglish, setIsEnglish] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return saved === 'en';
    }
    return false;
  });

  useEffect(() => {
    setCurrentRefDate(new Date());
  }, []);

  // Dark mode sınıfını html etiketine ekle ve localStorage'a kaydet
  useEffect(() => {
    console.log('🎨 Dark mode effect triggered. isDarkMode:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      console.log('✅ Set to DARK mode, saved to localStorage');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      console.log('✅ Set to LIGHT mode, saved to localStorage');
    }
  }, [isDarkMode]);

  // Dil tercihini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('language', isEnglish ? 'en' : 'tr');
  }, [isEnglish]);

  // Explicit handler functions for better production reliability
  const toggleDarkMode = () => {
    console.log('🌓 Toggle clicked! Current mode:', isDarkMode ? 'dark' : 'light');
    setIsDarkMode(prev => {
      const newValue = !prev;
      console.log('🌓 Changing to:', newValue ? 'dark' : 'light');
      
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      
      return newValue;
    });
  };

  const toggleLanguage = () => {
    setIsEnglish(prev => !prev);
  };

  const goToToday = () => {
    setCurrentRefDate(new Date());
  };

  const isRefDateToday = () => {
    const today = new Date();
    const current = currentRefDate;
    
    if (viewMode === 'daily') {
      return today.getDate() === current.getDate() && 
             today.getMonth() === current.getMonth() && 
             today.getFullYear() === current.getFullYear();
    }
    if (viewMode === 'weekly') {
      const getMonday = (d) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff).getTime();
      };
      return getMonday(today) === getMonday(current);
    }
    if (viewMode === 'monthly') {
      return today.getMonth() === current.getMonth() && 
             today.getFullYear() === current.getFullYear();
    }
    return false;
  };

  const changeDate = (direction) => {
    const newDate = new Date(currentRefDate);

    if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      const days = viewMode === 'weekly' ? direction * 7 : direction;
      newDate.setDate(newDate.getDate() + days);
    }

    setCurrentRefDate(newDate);
  };

  const getFilteredMenus = () => {
    const year = currentRefDate.getFullYear();
    const month = String(currentRefDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentRefDate.getDate()).padStart(2, '0');
    const refDateStr = `${year}-${month}-${day}`;

    if (viewMode === 'daily') {
      const menu = RAW_MENU_ITEMS.find(m => m.date === refDateStr);
      return menu ? [menu] : null;
    }

    if (viewMode === 'weekly') {
      const dayOfWeek = currentRefDate.getDay();
      const diff = currentRefDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(currentRefDate);
      monday.setDate(diff);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        weekDates.push(`${y}-${m}-${dy}`);
      }
      return RAW_MENU_ITEMS.filter(m => weekDates.includes(m.date));
    }

    if (viewMode === 'monthly') {
      const m = currentRefDate.getMonth();
      const y = currentRefDate.getFullYear();
      return RAW_MENU_ITEMS.filter(item => {
        const [iy, im, id] = item.date.split('-').map(Number);
        return (im - 1) === m && iy === y;
      });
    }

    return [];
  };

  const filteredMenus = getFilteredMenus();

  const getNavTitle = () => {
    const locale = isEnglish ? 'en-US' : 'tr-TR';
    const options = { year: 'numeric', month: 'long' };

    if (viewMode === 'daily') {
      return currentRefDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    }
    if (viewMode === 'weekly') {
      const day = currentRefDate.getDay();
      const diff = currentRefDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(currentRefDate);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return `${monday.getDate()} - ${sunday.getDate()} ${monday.toLocaleDateString(locale, { month: 'long' })}`;
    }
    if (viewMode === 'monthly') {
      return currentRefDate.toLocaleDateString(locale, options);
    }
  };

  const isCurrentMonthJanuary = currentRefDate.getMonth() === 0 && currentRefDate.getFullYear() === 2026;
  const currentLabels = LABELS[isEnglish ? 'en' : 'tr'];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-slate-200 selection:bg-[#C41230] selection:text-white transition-colors duration-300">
      <header className="bg-white dark:bg-zinc-900 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center text-gray-900 dark:text-white font-bold text-lg tracking-tight">
            <Clock className="mr-2" size={24} />
            <span>11.00 - 14.30</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dil Değiştirme Butonu */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              title={isEnglish ? "Türkçe'ye Geç" : "Switch to English"}
            >
              <Languages size={18} />
              <span>{isEnglish ? 'EN' : 'TR'}</span>
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>

            {/* Tema Değiştirme Butonu */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-6 py-6 sm:py-8">

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 w-full">

          {/* Görünüm Seçici (Daily/Weekly/Monthly) */}
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800 w-full md:w-auto shadow-sm">
            {[
              { id: 'daily', label: currentLabels.daily, icon: Calendar },
              { id: 'weekly', label: currentLabels.weekly, icon: List },
              { id: 'monthly', label: currentLabels.monthly, icon: Grid }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === mode.id
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-zinc-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-zinc-800'
                  }`}
              >
                <mode.icon size={16} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Tarih Navigasyonu ve Bugün Butonu */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Bugün Butonu */}
            <button
              onClick={goToToday}
              disabled={isRefDateToday()}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                isRefDateToday() 
                  ? 'bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-600 border-transparent cursor-not-allowed'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {currentLabels.today}
            </button>

            {/* Tarih Navigasyonu */}
            <div className="flex items-center space-x-4 bg-gray-100 dark:bg-zinc-900 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 flex-1 md:flex-none justify-between shadow-sm">
              <button
                onClick={() => changeDate(-1)}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm hover:shadow"
              >
                <ChevronLeft size={20} />
              </button>

              <span className={`text-base font-semibold text-gray-800 dark:text-slate-200 min-w-[160px] text-center ${viewMode === 'monthly' ? 'flex-1' : ''}`}>
                {getNavTitle()}
              </span>

              <button
                onClick={() => changeDate(1)}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm hover:shadow"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {viewMode === 'daily' ? (
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full max-w-2xl">
                {filteredMenus && filteredMenus.length > 0 ? (
                  <DailyMenuCard
                    menu={filteredMenus[0]}
                    isToday={filteredMenus[0].date === getTodayDateString()}
                    expanded={true}
                    isEnglish={isEnglish}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 w-full">
                    <Utensils size={64} className="text-gray-400 dark:text-slate-600 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-500 dark:text-slate-400">
                      {isCurrentMonthJanuary ? currentLabels.noService : currentLabels.noData}
                    </h3>
                    <p className="text-gray-400 dark:text-slate-500 text-base mt-2">
                      {isCurrentMonthJanuary
                        ? currentLabels.noServiceDesc
                        : currentLabels.dataNotFoundDesc}
                    </p>

                    {/* Hafta Sonu Akıllı Navigasyon */}
                    {viewMode === 'daily' && (currentRefDate.getDay() === 0 || currentRefDate.getDay() === 6) && (
                      <div className="flex items-center gap-4 mt-8">
                        <button
                          onClick={() => {
                            const newDate = new Date(currentRefDate);
                            // Cumartesi (6) ise 1 gün geri (Cuma), Pazar (0) ise 2 gün geri (Cuma)
                            newDate.setDate(newDate.getDate() - (newDate.getDay() === 6 ? 1 : 2));
                            setCurrentRefDate(newDate);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-400 hover:text-[#C41230] dark:hover:text-red-400 hover:border-[#C41230]/30 dark:hover:border-red-400/30 transition-all"
                        >
                          <ChevronLeft size={16} />
                          <span className="text-sm font-semibold">{currentLabels.prevWorkday}</span>
                        </button>
                        <button
                          onClick={() => {
                            const newDate = new Date(currentRefDate);
                            // Cumartesi (6) ise 2 gün ileri (Pazartesi), Pazar (0) ise 1 gün ileri (Pazartesi)
                            newDate.setDate(newDate.getDate() + (newDate.getDay() === 6 ? 2 : 1));
                            setCurrentRefDate(newDate);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-400 hover:text-[#C41230] dark:hover:text-red-400 hover:border-[#C41230]/30 dark:hover:border-red-400/30 transition-all"
                        >
                          <span className="text-sm font-semibold">{currentLabels.nextWorkday}</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
              {filteredMenus && filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => (
                  <DailyMenuCard
                    key={menu.date}
                    menu={menu}
                    isToday={menu.date === getTodayDateString()}
                    compact={viewMode === 'monthly'}
                    isEnglish={isEnglish}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center flex-1 py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800">
                  <Calendar size={48} className="text-gray-400 dark:text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 dark:text-slate-400">{currentLabels.noData}</h3>
                  <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">{currentLabels.dataNotFoundDesc}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      <footer className="py-6 text-center">
        <span className="text-sm font-bold tracking-widest text-gray-300 dark:text-zinc-800 select-none">
          BTY
        </span>
      </footer>
    </div>
  );
}