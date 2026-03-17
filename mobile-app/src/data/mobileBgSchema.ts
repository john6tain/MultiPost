import { SelectOption } from "../components/SelectField";
import { MobileBgPrimaryCategoryKey } from "../types/listing";

export type MobileBgFieldType = "text" | "number" | "select";

export type MobileBgFieldDefinition = {
  name: string;
  label: string;
  type: MobileBgFieldType;
  options?: SelectOption[];
  placeholder?: string;
};

export type MobileBgFieldGroup = {
  title: string;
  fields: MobileBgFieldDefinition[];
};

export type MobileBgFeatureDefinition = {
  name: string;
  label: string;
};

export type MobileBgFeatureGroup = {
  title: string;
  features: MobileBgFeatureDefinition[];
};

export type MobileBgCategorySchema = {
  key: MobileBgPrimaryCategoryKey;
  label: string;
  topmenu: string;
  rub?: string;
  titleField?: string;
  priceField: string;
  descriptionField: string;
  fieldGroups: MobileBgFieldGroup[];
  featureGroups: MobileBgFeatureGroup[];
};

function makeOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ label: value, value }));
}

function makeFeatures(items: Array<[string, string]>): MobileBgFeatureDefinition[] {
  return items.map(([name, label]) => ({ name, label }));
}

const MONTH_OPTIONS = makeOptions([
  "януари",
  "февруари",
  "март",
  "април",
  "май",
  "юни",
  "юли",
  "август",
  "септември",
  "октомври",
  "ноември",
  "декември"
]);

const YEAR_OPTIONS = makeOptions(Array.from({ length: 97 }, (_, index) => String(2026 - index)));
const CURRENCY_OPTIONS = makeOptions(["EUR", "USD"]);
const VAT_OPTIONS = makeOptions([
  "Частна продажба. / Освободена от ДДС продажба.",
  "Цената е с включено ДДС",
  "Цената е без ДДС"
]);

const CONDITION_OPTIONS = makeOptions(["Употребяван", "Повреден/ударен", "За части"]);
const PARTS_CONDITION_OPTIONS = makeOptions(["Нов", "Употребяван", "Повреден/ударен"]);
const ENGINE_OPTIONS = makeOptions(["Бензинов", "Дизелов", "Електрически", "Хибриден", "Plug-in хибрид", "Газ", "Водород"]);
const BOAT_ENGINE_OPTIONS = makeOptions(["Без двигател", "Бензинов", "Дизелов", "Електрически", "Хибриден", "Plug-in хибрид", "Газ", "Водород"]);
const TRANSMISSION_OPTIONS = makeOptions(["Ръчна", "Автоматична", "Полуавтоматична"]);
const EURO_OPTIONS = makeOptions(["Евро 1", "Евро 2", "Евро 3", "Евро 4", "Евро 5", "Евро 6"]);
const REGION_OPTIONS = makeOptions([
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

const COLOR_OPTIONS = makeOptions([
  "Tъмно син",
  "Банан",
  "Беата",
  "Бежов",
  "Бордо",
  "Бронз",
  "Бял",
  "Винен",
  "Виолетов",
  "Вишнев",
  "Графит",
  "Жълт",
  "Зелен",
  "Златист",
  "Кафяв",
  "Керемиден",
  "Кремав",
  "Лилав",
  "Металик",
  "Оранжев",
  "Охра",
  "Пепеляв",
  "Перла",
  "Пясъчен",
  "Резидав",
  "Розов",
  "Сахара",
  "Светло сив",
  "Светло син",
  "Сив",
  "Син",
  "Слонова кост",
  "Сребърен",
  "Т.зелен",
  "Тъмно сив",
  "Тъмно син мет.",
  "Тъмно червен",
  "Тютюн",
  "Хамелеон",
  "Червен",
  "Черен"
]);

const CAR_BODY_OPTIONS = makeOptions(["Ван", "Джип", "Кабрио", "Комби", "Купе", "Миниван", "Пикап", "Седан", "Стреч лимузина", "Хечбек"]);
const BUS_BODY_OPTIONS = makeOptions(["Бордови", "Катафалка", "Линейка", "Пътнически", "Самосвал", "Самосвал с кран", "Товарен", "Товаропътнически", "Фургон"]);
const TRUCK_BODY_OPTIONS = makeOptions(["Автовоз", "Бордови", "Влекач", "Кран", "Мултилифт", "Самосвал", "Самосвал с кран", "Снегорин", "Фургон", "Цистерна"]);
const MOTORCYCLE_BODY_OPTIONS = makeOptions(["ATV", "Cafe Racer", "Naked", "Roadster", "UTV", "Бъги", "Ендуро", "Мото ролер", "Моторна шейна", "Кросов", "Пистов", "Скутер", "СуперМото", "Триколка", "Турър", "Чопър"]);
const MOTORCYCLE_COOLING_OPTIONS = makeOptions(["Водно", "Въздушно"]);
const MOTORCYCLE_TACT_OPTIONS = makeOptions(["2", "4"]);
const AXLES_OPTIONS = makeOptions(["1", "2", "3", "4", "5", "6", "7", "8"]);
const FORKLIFT_TYPE_OPTIONS = makeOptions(["Електрокар", "Мотокар"]);
const BOAT_CATEGORY_OPTIONS = makeOptions(["Ветроходна лодка", "Джет", "Извънбордов двигател", "Лодка", "Моторна яхта", "Надуваема лодка"]);
const BOAT_MATERIAL_OPTIONS = makeOptions(["Алуминий", "Желязо", "Пластмаса", "Дърво", "Бетон", "Кевлар", "PVC", "Hypalon", "Стъклопласт"]);
const BOAT_ENGINE_COUNT_OPTIONS = makeOptions(["1", "2", "3", "4"]);
const TRAILER_CATEGORY_OPTIONS = makeOptions(["За автомобил", "За камион", "За трактор", "Полуремарке"]);
const TRAILER_AXLES_OPTIONS = makeOptions(["1", "2", "3", "4", "5", "6", "7", "8"]);
const BICYCLE_TYPE_OPTIONS = makeOptions(["BMX", "Велодрезина", "Веломобил", "Велоприцеп", "Велорикша", "Водно колело", "Градски", "Едноколесен", "Инвалиден", "Летящ", "Лигерад", "Пистов", "Планински", "Сгъваем", "Тандем", "Товарен", "Триколесен", "Чопър", "Шосеен", "Велотакси", "Скутер", "Тротинетка"]);
const BICYCLE_SIZE_OPTIONS = makeOptions(['<10"', '10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '27"', '28"', '29"', "друг"]);
const BICYCLE_FRAME_OPTIONS = makeOptions(["алуминиева", "желязна", "карбонова", "друга"]);
const BICYCLE_GEARS_OPTIONS = makeOptions(["3", "4", "5", "6", "7", "8", "9", "10", "12", "14", "15", "16", "18", "20", "21", "24", ">24", "без скорости"]);
const PARTS_CATEGORY_OPTIONS = makeOptions(["Ауспуси, Гърнета", "Газови и метанови уредби", "Горивна система", "Двигател", "Електрическа система", "Запалителна система", "Интериор и аксесоари", "Климатична система", "Консумативи", "Кормилна система", "Окачване", "Охладителна система", "Рама и Каросерия", "Ремъци, Ролки, Вериги", "Светлини", "Спирачна система", "Трансмисия", "Филтри", "Ходова част"]);

export const MOBILE_BG_PRIMARY_CATEGORY_OPTIONS: SelectOption[] = [
  { label: "Автомобили и Джипове", value: "cars" },
  { label: "Бусове", value: "buses" },
  { label: "Камиони", value: "trucks" },
  { label: "Мотоциклети", value: "motorcycles" },
  { label: "Кари", value: "forklifts" },
  { label: "Яхти и Лодки", value: "boats" },
  { label: "Ремаркета", value: "trailers" },
  { label: "Велосипеди", value: "bicycles" },
  { label: "Части", value: "parts" },
  { label: "Гуми и джанти", value: "tires-rims" }
];

export const MOBILE_BG_CATEGORY_SCHEMAS: Partial<Record<MobileBgPrimaryCategoryKey, MobileBgCategorySchema>> = {
  cars: {
    key: "cars",
    label: "Автомобили и Джипове",
    topmenu: "1",
    priceField: "f12",
    descriptionField: "f21",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Марка", type: "text" },
        { name: "f6", label: "Модел", type: "text" },
        { name: "f7", label: "Модификация", type: "text" },
        { name: "f8", label: "Двигател", type: "select", options: ENGINE_OPTIONS },
        { name: "f25", label: "Състояние", type: "select", options: CONDITION_OPTIONS }
      ] },
      { title: "Технически", fields: [
        { name: "f9", label: "Мощност [к.с.]", type: "number" },
        { name: "f29", label: "Евростандарт", type: "select", options: EURO_OPTIONS },
        { name: "f10", label: "Скоростна кутия", type: "select", options: TRANSMISSION_OPTIONS },
        { name: "f11", label: "Категория", type: "select", options: CAR_BODY_OPTIONS },
        { name: "f30", label: "Кубатура [куб.см]", type: "number" },
        { name: "f33", label: "Пробег с едно зареждане [км]", type: "number" },
        { name: "f34", label: "Капацитет на батерията [kWh]", type: "number" }
      ] },
      { title: "Продажба", fields: [
        { name: "f31", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f13", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f16", label: "Пробег [км]", type: "number" },
        { name: "f14", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f15", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f17", label: "Цвят", type: "select", options: COLOR_OPTIONS },
        { name: "f18", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f19", label: "Град", type: "text" },
        { name: "f32", label: "VIN номер", type: "text" },
        { name: "f24", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: []
  },
  buses: {
    key: "buses",
    label: "Бусове",
    topmenu: "3",
    priceField: "f15",
    descriptionField: "f24",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Марка", type: "text" },
        { name: "f6", label: "Модел", type: "text" },
        { name: "f7", label: "Модификация", type: "text" },
        { name: "f8", label: "Двигател", type: "select", options: ENGINE_OPTIONS },
        { name: "f28", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f9", label: "Мощност [к.с.]", type: "number" },
        { name: "f32", label: "Евростандарт", type: "select", options: EURO_OPTIONS },
        { name: "f10", label: "Скоростна кутия", type: "select", options: TRANSMISSION_OPTIONS },
        { name: "f11", label: "Категория", type: "select", options: BUS_BODY_OPTIONS },
        { name: "f33", label: "Кубатура [куб.см]", type: "number" },
        { name: "f12", label: "Брой оси", type: "select", options: AXLES_OPTIONS },
        { name: "f13", label: "Брой места", type: "number" },
        { name: "f14", label: "Товароносимост [кг]", type: "number" }
      ] },
      { title: "Продажба", fields: [
        { name: "f34", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f16", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f19", label: "Пробег [км]", type: "number" },
        { name: "f17", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f18", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f20", label: "Цвят", type: "select", options: COLOR_OPTIONS },
        { name: "f21", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f22", label: "Град", type: "text" },
        { name: "f35", label: "VIN номер", type: "text" },
        { name: "f36", label: "Пробег с едно зареждане [км]", type: "number" },
        { name: "f37", label: "Капацитет на батерията [kWh]", type: "number" },
        { name: "f27", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: []
  },
  trucks: {
    key: "trucks",
    label: "Камиони",
    topmenu: "4",
    priceField: "f15",
    descriptionField: "f24",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Марка", type: "text" },
        { name: "f6", label: "Модел", type: "text" },
        { name: "f7", label: "Модификация", type: "text" },
        { name: "f8", label: "Двигател", type: "select", options: ENGINE_OPTIONS },
        { name: "f28", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f9", label: "Мощност [к.с.]", type: "number" },
        { name: "f32", label: "Евростандарт", type: "select", options: EURO_OPTIONS },
        { name: "f10", label: "Скоростна кутия", type: "select", options: TRANSMISSION_OPTIONS },
        { name: "f11", label: "Категория", type: "select", options: TRUCK_BODY_OPTIONS },
        { name: "f33", label: "Кубатура [куб.см]", type: "number" },
        { name: "f12", label: "Брой оси", type: "select", options: AXLES_OPTIONS },
        { name: "f13", label: "Брой места", type: "number" },
        { name: "f14", label: "Товароносимост [кг]", type: "number" }
      ] },
      { title: "Продажба", fields: [
        { name: "f34", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f16", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f19", label: "Пробег [км]", type: "number" },
        { name: "f17", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f18", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f20", label: "Цвят", type: "select", options: COLOR_OPTIONS },
        { name: "f21", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f22", label: "Град", type: "text" },
        { name: "f35", label: "VIN номер", type: "text" },
        { name: "f36", label: "Пробег с едно зареждане [км]", type: "number" },
        { name: "f37", label: "Капацитет на батерията [kWh]", type: "number" },
        { name: "f27", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: []
  },
  motorcycles: {
    key: "motorcycles",
    label: "Мотоциклети",
    topmenu: "5",
    priceField: "f15",
    descriptionField: "f24",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Марка", type: "text" },
        { name: "f6", label: "Модел", type: "text" },
        { name: "f7", label: "Модификация", type: "text" },
        { name: "f8", label: "Двигател", type: "select", options: ENGINE_OPTIONS },
        { name: "f28", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f9", label: "Мощност [к.с.]", type: "number" },
        { name: "f10", label: "Скоростна кутия", type: "select", options: TRANSMISSION_OPTIONS },
        { name: "f11", label: "Категория", type: "select", options: MOTORCYCLE_BODY_OPTIONS },
        { name: "f12", label: "Кубатура [куб.см]", type: "number" },
        { name: "f13", label: "Вид охлаждане", type: "select", options: MOTORCYCLE_COOLING_OPTIONS },
        { name: "f14", label: "Вид двигател", type: "select", options: MOTORCYCLE_TACT_OPTIONS }
      ] },
      { title: "Продажба", fields: [
        { name: "f32", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f16", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f19", label: "Пробег [км]", type: "number" },
        { name: "f17", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f18", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f20", label: "Цвят", type: "select", options: COLOR_OPTIONS },
        { name: "f21", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f22", label: "Град", type: "text" },
        { name: "f33", label: "VIN номер", type: "text" },
        { name: "f34", label: "Пробег с едно зареждане [км]", type: "number" },
        { name: "f35", label: "Капацитет на батерията [kWh]", type: "number" },
        { name: "f27", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: []
  },
  forklifts: {
    key: "forklifts",
    label: "Кари",
    topmenu: "8",
    priceField: "f11",
    descriptionField: "f20",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Категория", type: "select", options: FORKLIFT_TYPE_OPTIONS },
        { name: "f6", label: "Марка", type: "text" },
        { name: "f7", label: "Модел/Двигател", type: "text" },
        { name: "f24", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f28", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f12", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f13", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f14", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f17", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f18", label: "Град", type: "text" }
      ] },
      { title: "Технически", fields: [
        { name: "f8", label: "Двигател", type: "select", options: ENGINE_OPTIONS },
        { name: "f9", label: "Мощност [к.с.]", type: "number" },
        { name: "f10", label: "Товароподемност [кг]", type: "number" },
        { name: "f15", label: "Часове работа", type: "number" },
        { name: "f16", label: "Цвят", type: "select", options: COLOR_OPTIONS },
        { name: "f23", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: [
      { title: "Комфорт", features: makeFeatures([["f29", "Отопление"], ["f30", "виличен изправител"], ["f31", "дуплекс мачта"], ["f32", "пневматични гуми"], ["f33", "свободен ход"], ["f34", "сервоуправление"], ["f35", "супереластични гуми"], ["f36", "триплекс стрела"]]) },
      { title: "Други", features: makeFeatures([["f37", "Бартер"], ["f38", "Капариран/Продаден"], ["f39", "Лизинг"], ["f40", "Нов внос"], ["f41", "С регистрация"]]) },
      { title: "Защита", features: makeFeatures([["f42", "Каско"]]) }
    ]
  },
  boats: {
    key: "boats",
    label: "Яхти и Лодки",
    topmenu: "10",
    priceField: "f16",
    descriptionField: "f24",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Категория", type: "select", options: BOAT_CATEGORY_OPTIONS },
        { name: "f6", label: "Марка", type: "text" },
        { name: "f7", label: "Модел", type: "text" },
        { name: "f28", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f32", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f17", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f18", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f19", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f21", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f22", label: "Град", type: "text" }
      ] },
      { title: "Размери и двигател", fields: [
        { name: "f12", label: "Материал", type: "select", options: BOAT_MATERIAL_OPTIONS },
        { name: "f13", label: "Дължина [м]", type: "text" },
        { name: "f14", label: "Ширина [м]", type: "text" },
        { name: "f15", label: "Газене [м]", type: "text" },
        { name: "f8", label: "Двигател", type: "select", options: BOAT_ENGINE_OPTIONS },
        { name: "f9", label: "Брой двигатели", type: "select", options: BOAT_ENGINE_COUNT_OPTIONS },
        { name: "f10", label: "Мощност [к.с.]", type: "number" },
        { name: "f11", label: "Часове работа", type: "number" },
        { name: "f27", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: [
      { title: "Безопасност", features: makeFeatures([["f33", "Автопилот"], ["f34", "Ехолот"], ["f35", "Радар"], ["f36", "Радиостанция"], ["f37", "Чартплотер"]]) },
      { title: "Комфорт", features: makeFeatures([["f38", "DVD, TV"], ["f39", "Климатик"], ["f40", "Навигация"], ["f41", "Печка"], ["f42", "Стерео уредба"], ["f43", "хидрофорна система"], ["f44", "хладилник"]]) },
      { title: "Други", features: makeFeatures([["f45", "Бартер"], ["f46", "Воден резервоар"], ["f47", "Генератор"], ["f48", "Капариран/Продаден"], ["f49", "Лизинг"], ["f50", "Нов внос"], ["f51", "Помпа"], ["f52", "С регистрация"], ["f53", "С ремарке"], ["f54", "Тента"], ["f55", "кран"]]) },
      { title: "Защита", features: makeFeatures([["f56", "Каско"], ["f57", "Лебедка"], ["f58", "Покривало"], ["f59", "Противопожарно оборудване"], ["f60", "Хидравлични стабилизатори"]]) },
      { title: "Интериор", features: makeFeatures([["f61", "Баня"], ["f62", "Кухня"], ["f63", "Тоалетна"]]) }
    ]
  },
  trailers: {
    key: "trailers",
    label: "Ремаркета",
    topmenu: "11",
    priceField: "f10",
    descriptionField: "f18",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Категория", type: "select", options: TRAILER_CATEGORY_OPTIONS },
        { name: "f6", label: "Марка", type: "text" },
        { name: "f7", label: "Модел", type: "text" },
        { name: "f22", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f26", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f11", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f12", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f13", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f15", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f16", label: "Град", type: "text" }
      ] },
      { title: "Технически", fields: [
        { name: "f8", label: "Товароносимост [кг]", type: "number" },
        { name: "f9", label: "Брой оси", type: "select", options: TRAILER_AXLES_OPTIONS },
        { name: "f14", label: "Цвят", type: "select", options: COLOR_OPTIONS },
        { name: "f21", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: [
      { title: "Безопасност", features: makeFeatures([["f27", "Антиблокираща система"], ["f28", "Въздушно окачване"], ["f29", "Дискови спирачки"], ["f30", "Електронна система за завиване"], ["f31", "Завиващ мост"], ["f32", "Инерционен теглич"], ["f33", "Люлеещ теглич"], ["f34", "Пневматична спирачна система"], ["f35", "Твърд теглич"]]) },
      { title: "Други", features: makeFeatures([["f36", "Бартер"], ["f37", "Капариран/Продаден"], ["f38", "Лизинг"], ["f39", "Нов внос"], ["f40", "Подвижен под"], ["f41", "Подсилен под"], ["f42", "Ресьори"], ["f43", "С регистрация"]]) },
      { title: "Екстериор", features: makeFeatures([["f44", "2/3 странно изсипване"], ["f45", "Алуминиев кош"], ["f46", "Брезент"], ["f47", "Капаци"], ["f48", "Лети джанти"], ["f49", "Повдигащи се оси"], ["f50", "Тристранна щора"], ["f51", "Тристранно разтоварване"]]) },
      { title: "Защита", features: makeFeatures([["f52", "Каско"]]) },
      { title: "Специализирани", features: makeFeatures([["f53", "Автовоз"], ["f54", "Бордово"], ["f55", "Гондола"], ["f56", "За превоз на животни"], ["f57", "За превоз на лодка/яхта"], ["f58", "За превоз на опасни товари"], ["f59", "За превоз на стъкло"], ["f60", "За превоз на трупи/дървесина"], ["f61", "Зърновоз"], ["f62", "Изотермично"], ["f63", "Контейнеровоз"], ["f64", "Магазин"], ["f65", "Мобилно заведение"], ["f66", "Открито"], ["f67", "Палетоносач"], ["f68", "Платформа"], ["f69", "С ниска товарна площадка"], ["f70", "Самосвал"], ["f71", "Туристическо"], ["f72", "Фургон"], ["f73", "Хенгер"], ["f74", "Хладилно"], ["f75", "Циментовоз"], ["f76", "Цистерна"], ["f77", "Шаси"]]) }
    ]
  },
  bicycles: {
    key: "bicycles",
    label: "Велосипеди",
    topmenu: "12",
    priceField: "f12",
    descriptionField: "f17",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Вид", type: "select", options: BICYCLE_TYPE_OPTIONS },
        { name: "f6", label: "Модел", type: "text" },
        { name: "f21", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
        { name: "f7", label: "Марка", type: "text" },
        { name: "f8", label: "Размер", type: "select", options: BICYCLE_SIZE_OPTIONS },
        { name: "f9", label: "Рамка", type: "select", options: BICYCLE_FRAME_OPTIONS },
        { name: "f10", label: "Скорости", type: "select", options: BICYCLE_GEARS_OPTIONS },
        { name: "f11", label: "Цвят", type: "select", options: COLOR_OPTIONS }
      ] },
      { title: "Продажба", fields: [
        { name: "f25", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f13", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f14", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f15", label: "Град", type: "text" },
        { name: "f20", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: [
      { title: "Комфорт", features: makeFeatures([["f26", "Дискови спирачки"], ["f27", "Заден амортисьор"], ["f28", "Преден амортисьор"], ["f29", "Светлини"], ["f30", "Слънчеви батерии"], ["f31", "Хидравл. спирачки"]]) },
      { title: "Други", features: makeFeatures([["f32", "Бензинов двигател"], ["f33", "Вътрешни скорости"], ["f34", "Детски"], ["f35", "Ел. двигател"], ["f36", "Усилени капли"], ["f37", "Юношески"]]) }
    ]
  },
  parts: {
    key: "parts",
    label: "Части",
    topmenu: "1",
    rub: "5",
    titleField: "f24",
    priceField: "f12",
    descriptionField: "f17",
    fieldGroups: [
      { title: "Основни", fields: [
        { name: "f5", label: "Категория", type: "select", options: PARTS_CATEGORY_OPTIONS },
        { name: "f6", label: "Част", type: "text" },
        { name: "f9", label: "Състояние", type: "select", options: PARTS_CONDITION_OPTIONS },
        { name: "f7", label: "Марка", type: "text" },
        { name: "f8", label: "Модел", type: "text" }
      ] },
      { title: "Продажба", fields: [
        { name: "f25", label: "ДДС статус", type: "select", options: VAT_OPTIONS },
        { name: "f13", label: "Валута", type: "select", options: CURRENCY_OPTIONS },
        { name: "f10", label: "Месец", type: "select", options: MONTH_OPTIONS },
        { name: "f11", label: "Година", type: "select", options: YEAR_OPTIONS },
        { name: "f14", label: "Област", type: "select", options: REGION_OPTIONS },
        { name: "f15", label: "Град", type: "text" },
        { name: "f20", label: "Уебсайт", type: "text" }
      ] }
    ],
    featureGroups: []
  }
};
