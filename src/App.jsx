import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Utensils, Info, MapPin, Clock, Moon, Sun, Grid, List, Leaf, ArrowRightLeft, RefreshCw, Languages } from 'lucide-react';

// AGÜ Kurumsal Renkleri:
// Kırmızı: #C41230

// Çoklu Dil Desteği İçin Veri Yapısı
const RAW_MENU_ITEMS = [
  // 1. Hafta
  {
    date: '2025-12-01',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Yayla Çorbası', en: 'Yogurt Soup', c: 115 },
    main: { tr: 'Çıtır Tavuk', en: 'Crispy Chicken', c: 280 },
    veg: { tr: 'Şakşuka', en: 'Shakshuka', c: 154 },
    side: { tr: 'Meyhane Pilavı', en: 'Bulgur Pilaf with Vegetables', c: 290 },
    extra: { tr: 'İçecek', en: 'Beverage', c: 150 }
  },
  {
    date: '2025-12-02',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Mercimek Çorbası', en: 'Lentil Soup', c: 195 },
    main: { tr: 'Mengen Musakka', en: 'Mengen Style Moussaka', c: 300 },
    veg: { tr: 'Soslu Brokoli', en: 'Broccoli with Sauce', c: 162 },
    side: { tr: 'Tereyağlı Erişte', en: 'Buttered Noodles', c: 230 },
    extra: { tr: 'Haydari', en: 'Haydari', c: 70 }
  },
  {
    date: '2025-12-03',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Tarhana Çorbası', en: 'Tarhana Soup', c: 183 },
    main: { tr: 'Etli Nohut Yahni', en: 'Chickpea Stew with Meat', c: 367 },
    veg: { tr: 'Karnabahar Kızartma', en: 'Fried Cauliflower', c: 300 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 390 },
    extra: { tr: 'Soğuk Baklava', en: 'Cold Baklava', c: 115 }
  },
  {
    date: '2025-12-04',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Kremalı Sebze Çorbası', en: 'Creamy Vegetable Soup', c: 160 },
    main: { tr: 'Fırın Köfte', en: 'Oven Meatballs', c: 450 },
    veg: { tr: 'Barbunya Plaki', en: 'Kidney Bean Stew', c: 250 },
    side: { tr: 'Soslu Makarna', en: 'Pasta with Sauce', c: 230 },
    extra: { tr: 'Salat Bar', en: 'Salad Bar', c: 85 }
  },
  {
    date: '2025-12-05',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Düğün Çorba', en: 'Wedding Soup', c: 140 },
    main: { tr: 'Piliç Topkapı', en: 'Stuffed Chicken', c: 425 },
    veg: { tr: 'Zeytinyağlı Taze Fasulye', en: 'Green Beans in Olive Oil', c: 298 },
    side: { tr: 'Mısırlı Pirinç Pilavı', en: 'Rice Pilaf with Corn', c: 390 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 70 }
  },

  // 2. Hafta
  {
    date: '2025-12-08',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Bahar Çorbası', en: 'Spring Soup', c: 125 },
    main: { tr: 'Parmak Patlıcan Kebap', en: 'Finger Eggplant Kebab', c: 300 },
    veg: { tr: 'Soslu Brokoli', en: 'Broccoli with Sauce', c: 162 },
    side: { tr: 'Kremalı Makarna', en: 'Creamy Pasta', c: 260 },
    extra: { tr: 'Yoğurt', en: 'Yogurt', c: 90 }
  },
  {
    date: '2025-12-09',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Tel Şehriye Çorbası', en: 'Vermicelli Soup', c: 115 },
    main: { tr: 'Tavuk Külbastı', en: 'Chicken Cutlet', c: 390 },
    veg: { tr: 'Çıtır Kabak', en: 'Crispy Zucchini', c: 150 },
    side: { tr: 'Meyhane Pilavı', en: 'Bulgur Pilaf with Vegetables', c: 290 },
    extra: { tr: 'Kakaolu Puding', en: 'Cocoa Pudding', c: 115 }
  },
  {
    date: '2025-12-10',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Tandır Çorba', en: 'Tandoori Soup', c: 183 },
    main: { tr: 'Etli Kuru Fasulye', en: 'White Beans with Meat', c: 290 },
    veg: { tr: 'Şakşuka', en: 'Shakshuka', c: 154 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 390 },
    extra: { tr: 'Karışık Turşu', en: 'Mixed Pickles', c: 85 }
  },
  {
    date: '2025-12-11',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Kremalı Tavuk Çorba', en: 'Creamy Chicken Soup', c: 200 },
    main: { tr: 'Soslu İzmir Köfte', en: 'Izmir Meatballs with Sauce', c: 450 },
    veg: { tr: 'Ekşili Pırasa', en: 'Leeks with Olive Oil', c: 154 },
    side: { tr: 'Börek', en: 'Pastry', c: 310 },
    extra: { tr: 'İçecek', en: 'Beverage', c: 150 }
  },
  {
    date: '2025-12-12',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Kremalı Domates Çorba', en: 'Creamy Tomato Soup', c: 150 },
    main: { tr: 'Tavuk Döner', en: 'Chicken Doner', c: 450 },
    veg: { tr: 'Zeytinyağlı Brüksel Lahanası', en: 'Brussels Sprouts in Olive Oil', c: 154 },
    side: { tr: 'Nohutlu Pirinç Pilavı', en: 'Rice Pilaf with Chickpeas', c: 390 },
    extra: { tr: 'Salat Bar', en: 'Salad Bar', c: 85 }
  },

  // 3. Hafta
  {
    date: '2025-12-15',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Yayla Çorbası', en: 'Yogurt Soup', c: 115 },
    main: { tr: 'Et Tas Kebap', en: 'Meat Cube Stew', c: 400 },
    veg: { tr: 'Soslu Patlıcan', en: 'Eggplant with Sauce', c: 154 },
    side: { tr: 'Tereyağlı Erişte', en: 'Buttered Noodles', c: 230 },
    extra: { tr: 'Aşure', en: "Noah's Pudding", c: 125 }
  },
  {
    date: '2025-12-16',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Tel Şehriye Çorba', en: 'Vermicelli Soup', c: 115 },
    main: { tr: 'Tavuk Haşlama', en: 'Boiled Chicken', c: 350 },
    veg: { tr: 'Soslu Brüksel Lahanası', en: 'Brussels Sprouts with Sauce', c: 154 },
    side: { tr: 'Bulgur Pilavı', en: 'Bulgur Pilaf', c: 290 },
    extra: { tr: 'Pembe Sultan', en: 'Pink Sultan', c: 70 }
  },
  {
    date: '2025-12-17',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Tarhana Çorba', en: 'Tarhana Soup', c: 183 },
    main: { tr: 'Etli Nohut Yahni', en: 'Chickpea Stew with Meat', c: 367 },
    veg: { tr: 'Karnabahar Kızartma', en: 'Fried Cauliflower', c: 300 },
    side: { tr: 'Mısırlı Pirinç Pilavı', en: 'Rice Pilaf with Corn', c: 390 },
    extra: { tr: 'Soğuk Baklava', en: 'Cold Baklava', c: 115 }
  },
  {
    date: '2025-12-18',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Ezogelin Çorba', en: 'Ezogelin Soup', c: 195 },
    main: { tr: 'Dalyan Köfte', en: 'Roast Meatballs', c: 450 },
    veg: { tr: 'Kabak Mücver', en: 'Zucchini Fritters', c: 200 },
    side: { tr: 'Soslu Makarna', en: 'Pasta with Sauce', c: 230 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 70 }
  },
  {
    date: '2025-12-19',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Kremalı Domates Çorba', en: 'Creamy Tomato Soup', c: 115 },
    main: { tr: 'Çıtır Tavuk', en: 'Crispy Chicken', c: 280 },
    veg: { tr: 'Zeytinyağlı Bamya', en: 'Okra in Olive Oil', c: 154 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 390 },
    extra: { tr: 'İçecek', en: 'Beverage', c: 150 }
  },

  // 4. Hafta
  {
    date: '2025-12-22',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Kremalı Şehriye Çorba', en: 'Creamy Vermicelli Soup', c: 120 },
    main: { tr: 'Patlıcan Güveç', en: 'Eggplant Casserole', c: 300 },
    veg: { tr: 'Karnabahar Kızartma', en: 'Fried Cauliflower', c: 300 },
    side: { tr: 'Börek', en: 'Pastry', c: 310 },
    extra: { tr: 'Yoğurt', en: 'Yogurt', c: 90 }
  },
  {
    date: '2025-12-23',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Ezogelin Çorba', en: 'Ezogelin Soup', c: 195 },
    main: { tr: 'Fırın Kanat', en: 'Oven Baked Chicken Wings', c: 366 },
    veg: { tr: 'Ekşili Pırasa', en: 'Leeks with Olive Oil', c: 154 },
    side: { tr: 'Garnitürlü Pirinç Pilavı', en: 'Rice Pilaf with Garnish', c: 390 },
    extra: { tr: 'Havuç Tarator', en: 'Carrot Tarator', c: 70 }
  },
  {
    date: '2025-12-24',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Salçalı Yarma Çorba', en: 'Wheat Soup with Tomato Paste', c: 183 },
    main: { tr: 'Etli Kuru Fasulye', en: 'White Beans with Meat', c: 290 },
    veg: { tr: 'Karışık Kızartma', en: 'Mixed Fried Vegetables', c: 298 },
    side: { tr: 'Meyhane Pilavı', en: 'Bulgur Pilaf with Vegetables', c: 290 },
    extra: { tr: 'Kakaolu Puding', en: 'Cocoa Pudding', c: 115 }
  },
  {
    date: '2025-12-25',
    dayTr: 'Perşembe', dayEn: 'Thursday',
    soup: { tr: 'Mercimek Çorba', en: 'Lentil Soup', c: 195 },
    main: { tr: 'Ekşili Misket Köfte', en: 'Sour Meatballs', c: 450 },
    veg: { tr: 'Soslu Brokoli', en: 'Broccoli with Sauce', c: 162 },
    side: { tr: 'Soslu Makarna', en: 'Pasta with Sauce', c: 230 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 70 }
  },
  {
    date: '2025-12-26',
    dayTr: 'Cuma', dayEn: 'Friday',
    soup: { tr: 'Düğün Çorba', en: 'Wedding Soup', c: 140 },
    main: { tr: 'Tavuk Döner - Cips', en: 'Chicken Doner & Chips', c: 450 },
    veg: { tr: 'Zeytinyağlı Karışık Dolma', en: 'Stuffed Vegetables in Olive Oil', c: 154 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 390 },
    extra: { tr: 'Salata', en: 'Salad', c: 85 }
  },

  // 5. Hafta
  {
    date: '2025-12-29',
    dayTr: 'Pazartesi', dayEn: 'Monday',
    soup: { tr: 'Tel Şehriye Çorba', en: 'Vermicelli Soup', c: 115 },
    main: { tr: 'Kıymalı Patates Kaplama', en: 'Potato Bake with Minced Meat', c: 300 },
    veg: { tr: 'Karnabahar Kızartma', en: 'Fried Cauliflower', c: 300 },
    side: { tr: 'Meyhane Pilavı', en: 'Bulgur Pilaf with Vegetables', c: 290 },
    extra: { tr: 'Meyve', en: 'Fruit', c: 70 }
  },
  {
    date: '2025-12-30',
    dayTr: 'Salı', dayEn: 'Tuesday',
    soup: { tr: 'Kremalı Domates Çorba', en: 'Creamy Tomato Soup', c: 115 },
    main: { tr: 'Piliç Topkapı', en: 'Stuffed Chicken', c: 425 },
    veg: { tr: 'Zeytinyağlı Bamya', en: 'Okra in Olive Oil', c: 154 },
    side: { tr: 'Kremalı Makarna', en: 'Creamy Pasta', c: 260 },
    extra: { tr: 'Salata', en: 'Salad', c: 85 }
  },
  {
    date: '2025-12-31',
    dayTr: 'Çarşamba', dayEn: 'Wednesday',
    soup: { tr: 'Yayla Çorbası', en: 'Yogurt Soup', c: 115 },
    main: { tr: 'Etli Nohut Yahni', en: 'Chickpea Stew with Meat', c: 367 },
    veg: { tr: 'Karışık Kızartma', en: 'Mixed Fried Vegetables', c: 298 },
    side: { tr: 'Şehriyeli Pirinç Pilavı', en: 'Rice Pilaf with Orzo', c: 390 },
    extra: { tr: 'Karışık Turşu', en: 'Mixed Pickles', c: 85 }
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
    switchMain: 'Klasik Menüye Geç'
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
    switchMain: 'Switch to Classic Menu'
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
  const [isDarkMode, setIsDarkMode] = useState(false); // Varsayılan: Light
  const [isEnglish, setIsEnglish] = useState(false); // Varsayılan: Türkçe

  useEffect(() => {
    setCurrentRefDate(new Date());
  }, []);

  // Dark mode sınıfını html etiketine ekle (Gerçek sitelerde düzgün çalışması için)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const isCurrentMonthDecember = currentRefDate.getMonth() === 11 && currentRefDate.getFullYear() === 2025;
  const currentLabels = LABELS[isEnglish ? 'en' : 'tr'];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-slate-200 selection:bg-[#C41230] selection:text-white transition-colors duration-300">
      <header className="bg-white dark:bg-zinc-900 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center text-gray-900 dark:text-white font-bold text-lg tracking-tight">
            <Clock className="mr-2" size={24} />
            <span>11.00 - 14.00</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dil Değiştirme Butonu */}
            <button
              onClick={() => setIsEnglish(!isEnglish)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title={isEnglish ? "Türkçe'ye Geç" : "Switch to English"}
            >
              <Languages size={18} />
              <span>{isEnglish ? 'EN' : 'TR'}</span>
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>

            {/* Tema Değiştirme Butonu */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
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
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800'
                  }`}
              >
                <mode.icon size={16} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Tarih Navigasyonu */}
          <div className="flex items-center space-x-4 bg-gray-100 dark:bg-zinc-900 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 w-full md:w-auto justify-between md:justify-end shadow-sm">
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
                      {isCurrentMonthDecember ? currentLabels.noService : currentLabels.noData}
                    </h3>
                    <p className="text-gray-400 dark:text-slate-500 text-base mt-2">
                      {isCurrentMonthDecember
                        ? currentLabels.noServiceDesc
                        : currentLabels.dataNotFoundDesc}
                    </p>
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