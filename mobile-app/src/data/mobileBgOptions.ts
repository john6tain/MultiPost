import { SelectOption } from "../components/SelectField";

function makeOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ label: value, value }));
}

export const MOBILE_BG_AD_TYPE_OPTIONS = makeOptions([
  "Гуми",
  "Джанти",
  "Гуми с джанти"
]);

export const MOBILE_BG_VAT_STATUS_OPTIONS = makeOptions([
  "Частна продажба. / Освободена от ДДС продажба.",
  "Цената е с включено ДДС",
  "Цената е без ДДС"
]);

export const MOBILE_BG_CURRENCY_OPTIONS = makeOptions(["EUR", "USD"]);

export const MOBILE_BG_CONDITION_OPTIONS = makeOptions([
  "Нов",
  "Употребяван",
  "Повреден/ударен",
  "За части"
]);

export const MOBILE_BG_SEASON_OPTIONS = makeOptions([
  "Всесезонни",
  "Зимни",
  "Летни"
]);

export const MOBILE_BG_TREAD_PATTERN_OPTIONS = makeOptions([
  "offroad",
  "on/offroad",
  "onroad"
]);

export const MOBILE_BG_RIM_MATERIAL_OPTIONS = makeOptions([
  "алуминиеви",
  "магнезиеви",
  "железни",
  "други"
]);

export const MOBILE_BG_RIM_TYPE_OPTIONS = makeOptions([
  "Неразглобяеми",
  "Разглобяеми"
]);

export const MOBILE_BG_REGION_OPTIONS = makeOptions([
  "Благоевград",
  "Бургас",
  "Варна",
  "Велико Търново",
  "Видин",
  "Враца",
  "Габрово",
  "Добрич",
  "Дупница",
  "Кърджали",
  "Кюстендил",
  "Ловеч",
  "Монтана",
  "Пазарджик",
  "Перник",
  "Плевен",
  "Пловдив",
  "Разград",
  "Русе",
  "Силистра",
  "Сливен",
  "Смолян",
  "София",
  "Стара Загора",
  "Търговище",
  "Хасково",
  "Шумен",
  "Ямбол",
  "Извън страната"
]);

export const MOBILE_BG_BOLTS_COUNT_OPTIONS = makeOptions(["3", "4", "5", "6", "8", "9", "10", "12"]);

export const MOBILE_BG_BOLT_SPACING_OPTIONS = makeOptions([
  "98",
  "100",
  "108",
  "108/114.3",
  "110",
  "112",
  "113.3",
  "114",
  "114.3",
  "114.4",
  "115",
  "120",
  "130",
  "139.7",
  "144.3",
  "256"
]);

export const MOBILE_BG_OFFSET_OPTIONS = makeOptions([
  "-30-20",
  "-20-10",
  "-10-0",
  "0-10",
  "10-20",
  "20-30",
  "30-40",
  "40-50",
  "50-60",
  "60-70",
  "70-80",
  "80-90",
  "90-100"
]);

export const MOBILE_BG_RIM_WIDTH_OPTIONS = makeOptions([
  "3.5",
  "4.0",
  "4.5",
  "5.0",
  "5.5",
  "6.0",
  "6.5",
  "7.0",
  "7.5",
  "8.0",
  "8.25",
  "8.5",
  "9.0",
  "9.5",
  "10.0",
  "10.5",
  "11.0",
  "11.5",
  "11.75",
  "12.0",
  "13.0",
  "14.0"
]);

export const MOBILE_BG_WIDTH_OPTIONS = makeOptions([
  "70", "80", "85", "90", "95", "100", "105", "110", "115", "120", "125", "130", "135", "140", "145",
  "150", "155", "160", "165", "170", "175", "180", "185", "190", "195", "200", "205", "210", "215",
  "220", "225", "230", "235", "240", "245", "250", "255", "260", "265", "270", "275", "280", "285",
  "295", "300", "305", "315", "325", "330", "335", "345", "355", "375", "385", "395", "425", "435", "445"
]);

export const MOBILE_BG_HEIGHT_OPTIONS = makeOptions([
  "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80", "82", "85", "90", "95", "100",
  "105", "110", "115", "120"
]);

export const MOBILE_BG_RIM_DIAMETER_OPTIONS = makeOptions([
  "10", "11", "12", "13", "14", "15", "15.5", "16", "16.5", "17", "17.5", "18", "19", "19.5", "20",
  "21", "22", "22.5", "23", "24", "26", "28"
]);

export const MOBILE_BG_SPEED_INDEX_OPTIONS = makeOptions([
  "A1",
  "A2 - max 10 km/h",
  "A3 - max 15 km/h",
  "A4 - max 20 km/h",
  "A5 - max 25 km/h",
  "A6 - max 30 km/h",
  "A7 - max 35 km/h",
  "A8 - max 40 km/h",
  "B - max 50 km/h",
  "C - max 60 km/h",
  "D - max 65 km/h",
  "E - max 70 km/h",
  "F - max 80 km/h",
  "G - max 90 km/h",
  "J - max 100 km/h",
  "K - max 110 km/h",
  "L - max 120 km/h",
  "M - max 130 km/h",
  "N - max 140 km/h",
  "P - max 150 km/h",
  "Q - max 160 km/h",
  "R - max 170 km/h",
  "S - max 180 km/h",
  "T - max 190 km/h",
  "U - max 200 km/h",
  "H - max 210 km/h",
  "V - max 240 km/h",
  "W - max 270 km/h",
  "Y - max 300 km/h",
  "ZR - над 240 km/h"
]);

export const MOBILE_BG_LOAD_INDEX_OPTIONS = makeOptions(
  Array.from({ length: 69 }, (_, index) => String(index + 70))
);

export const MOBILE_BG_TIRE_BRAND_OPTIONS = makeOptions([
  "Accelera", "Achilles", "Admiral", "Alliance", "America", "Atturo", "Autogrip", "Avon", "BCT",
  "BF Goodrich", "Barum", "Belshina", "Bridgestone", "Capitol", "Ceat", "Clear", "Continental",
  "Cooper", "DMACK", "Davanti", "Dayton", "Debica", "Delinte", "Dextero", "Dunlop", "Duro", "Durun",
  "Dоuble Coin", "Effiplus", "Esa Tecar", "Eurostone", "Falken", "Federal", "Fedima", "Firestone",
  "Fortuna", "Fulda", "Fullway", "GT Radial", "General", "Gislaved", "GoldenTyre", "Goodride",
  "Goodyear", "Gremax", "HI FLY", "Haida", "Hankook", "Hercules", "Hero", "High Performer", "Infinity",
  "Insa Turbo", "Interco", "Interstate", "Kelly", "Kenda", "Kinforest", "King Meiler", "Kings Tire",
  "Kingstar", "Kleber", "Kormoran", "Kumho", "Lassa", "Lexani", "Linglong", "Maloya", "Marangoni",
  "Marix", "Marshal", "Mastersteel", "Matador", "Maxtrek", "Maxxis", "Meteor", "Michelin",
  "Mickey Thompson", "Minerva", "Nankang", "Nexen", "Nokian", "Novex", "Pace", "Petlas", "Pirelli",
  "Pneumant", "PowerTrac", "Recip", "Regal", "Riken", "Roadstone", "Rockstone", "Rotalla", "Rotex",
  "Runway", "Sailun", "Sava", "Semperit", "Silverstone", "Sonny", "Star", "Star Performer", "Starco",
  "Starfire", "Starmaxx", "Stunner", "Sunew", "Sunny", "Syron", "Tigar", "Toyo", "Trayal",
  "Triangle", "Tyfoon", "Uniroyal", "VSP", "Viking", "Vredestein", "Wanli", "Westlake", "Winter Tact",
  "Yokohama", "Zeetex", "Zetum", "Други"
]);
