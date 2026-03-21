import { SelectOption } from "../components/SelectField";
import { BazarBgSchemaKey } from "../types/listing";

export type BazarBgFieldType = "text" | "number" | "textarea" | "select" | "tel";

export type BazarBgFieldDefinition = {
  name: string;
  label: string;
  type: BazarBgFieldType;
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
  dependsOn?: string | null;
};

export type BazarBgFieldGroup = {
  title: string;
  fields: BazarBgFieldDefinition[];
};

export type BazarBgSchema = {
  key: BazarBgSchemaKey;
  label: string;
  categoryPath: string[];
  titleField: string;
  priceField: string;
  descriptionField: string;
  locationFields: string[];
  contactFields: string[];
  fieldGroups: BazarBgFieldGroup[];
};

type BazarBgCategoryNode = {
  id: string;
  label: string;
};

function makeOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ label: value, value }));
}

function toSelectOptions(nodes: BazarBgCategoryNode[]): SelectOption[] {
  return nodes.map((node) => ({
    label: node.label,
    value: node.id
  }));
}

export const BAZAR_BG_TOP_LEVEL_CATEGORIES: BazarBgCategoryNode[] = [
  { id: "2", label: "Авто" },
  { id: "3", label: "Имоти" },
  { id: "6", label: "Мода" },
  { id: "4", label: "Електроника" },
  { id: "10", label: "Детски и бебешки" },
  { id: "7", label: "Дом и градина" },
  { id: "11", label: "Спорт, Хоби, Книги" },
  { id: "12", label: "Животни" },
  { id: "9", label: "Бизнес, Машини, Инструменти" },
  { id: "5", label: "Услуги" },
  { id: "8", label: "Работа" },
  { id: "106", label: "Туризъм и Екскурзии" }
];

export const BAZAR_BG_TOP_LEVEL_CATEGORY_OPTIONS = toSelectOptions(BAZAR_BG_TOP_LEVEL_CATEGORIES);

export const BAZAR_BG_SUBCATEGORIES_BY_TOP_LEVEL: Record<string, BazarBgCategoryNode[]> = {
  "2": [
    { id: "14", label: "Автомобили и джипове" },
    { id: "15", label: "Бусове и автобуси" },
    { id: "16", label: "Камиони" },
    { id: "17", label: "Специализирана техника" },
    { id: "18", label: "Мотоциклети и мототехника" },
    { id: "19", label: "Каравани и кемпери" },
    { id: "20", label: "Воден транспорт" },
    { id: "21", label: "Ремаркета" },
    { id: "23", label: "Части" },
    { id: "22", label: "Аксесоари и консумативи" },
    { id: "24", label: "Гуми и джанти" },
    { id: "25", label: "Авто услуги" }
  ],
  "3": [
    { id: "26", label: "Апартаменти" },
    { id: "28", label: "Къщи, вили" },
    { id: "155", label: "Парцели" },
    { id: "156", label: "Земеделска земя" },
    { id: "30", label: "Бизнес имоти" },
    { id: "31", label: "Гаражи и паркоместа" },
    { id: "27", label: "Стаи под наем" }
  ],
  "6": [
    { id: "53", label: "Дамски дрехи" },
    { id: "54", label: "Мъжки дрехи" },
    { id: "55", label: "Дамски обувки" },
    { id: "56", label: "Мъжки обувки" },
    { id: "326", label: "Козметика" },
    { id: "57", label: "Парфюмерия" },
    { id: "58", label: "Бижутерия" },
    { id: "59", label: "Часовници" },
    { id: "60", label: "Аксесоари" },
    { id: "61", label: "Подаръци и сувенири" }
  ],
  "4": [
    { id: "36", label: "Телефони" },
    { id: "209", label: "Аксесоари и части за телефони" },
    { id: "497", label: "Аудио техника" },
    { id: "503", label: "TV техника" },
    { id: "551", label: "Битова техника" },
    { id: "505", label: "Фотоапарати и камери" },
    { id: "166", label: "Лаптопи" },
    { id: "168", label: "Настолни компютри" },
    { id: "496", label: "Компютърна периферия" },
    { id: "495", label: "Компютърни компоненти и части" },
    { id: "172", label: "Мрежово оборудване" },
    { id: "173", label: "Таблети" },
    { id: "1135", label: "Електронни четци" },
    { id: "34", label: "Игри и Конзоли" },
    { id: "174", label: "Видеонаблюдение, СОТ" },
    { id: "175", label: "Навигация" },
    { id: "1145", label: "Дронове и аксесоари" },
    { id: "678", label: "Смарт гривни" },
    { id: "176", label: "Друга електроника" },
    { id: "557", label: "Ремонт на телефони и електроника" },
    { id: "558", label: "Ремонт на компютри и офис техника" }
  ],
  "10": [
    { id: "971", label: "Бебешки дрехи (0-2г)" },
    { id: "91", label: "Детски дрехи" },
    { id: "92", label: "Обувки" },
    { id: "93", label: "Играчки" },
    { id: "94", label: "За детската стая" },
    { id: "95", label: "За разходка с детето" },
    { id: "96", label: "Бебешки аксесоари" },
    { id: "1013", label: "Детски аксесоари" },
    { id: "98", label: "Стоки за близнаци" }
  ],
  "7": [
    { id: "62", label: "Мебели" },
    { id: "63", label: "Битова Техника" },
    { id: "233", label: "Здраве и красота" },
    { id: "65", label: "Изкуство и декорация" },
    { id: "66", label: "Осветление" },
    { id: "64", label: "Кухненски принадлежности" },
    { id: "67", label: "Домашен текстил" },
    { id: "452", label: "Домашни потреби и битова химия" },
    { id: "103", label: "Храна, добавки и напитки" },
    { id: "538", label: "Градина" },
    { id: "69", label: "Стайни растения" },
    { id: "68", label: "Строителство" },
    { id: "964", label: "Подови настилки" },
    { id: "960", label: "Врати" },
    { id: "546", label: "Инструменти" },
    { id: "1333", label: "Горива за отопление" },
    { id: "453", label: "Инвалидни колички, помощни средства" },
    { id: "70", label: "Други стоки за дома" },
    { id: "554", label: "Занаятчийски услуги" }
  ],
  "11": [
    { id: "494", label: "Книги, канцеларски материали" },
    { id: "100", label: "Спортни стоки" },
    { id: "247", label: "Филми" },
    { id: "248", label: "Музика" },
    { id: "101", label: "Музикални инструменти" },
    { id: "102", label: "Антики и колекционерски" },
    { id: "526", label: "Оръжия, лов и риболов" },
    { id: "255", label: "Къмпинг оборудване" },
    { id: "257", label: "Забавни игри" },
    { id: "105", label: "Билети и Събития" },
    { id: "104", label: "Вейпове (без пълнители) и наргилета" },
    { id: "553", label: "Храна, добавки и напитки" }
  ],
  "12": [
    { id: "107", label: "Кучета" },
    { id: "108", label: "Котки" },
    { id: "109", label: "Птици" },
    { id: "110", label: "Декоративни рибки" },
    { id: "111", label: "Гризачи и дребни животни" },
    { id: "112", label: "Екзотични и терариумни" },
    { id: "113", label: "Селскостопански" },
    { id: "114", label: "Други животни" },
    { id: "115", label: "Стоки за животни" },
    { id: "116", label: "Ветеринари и услуги" },
    { id: "117", label: "Търси партньор" },
    { id: "118", label: "Изгубени/намерени" }
  ],
  "9": [
    { id: "86", label: "Търговско оборудване" },
    { id: "87", label: "Хотелско и ресторантьорско оборудване" },
    { id: "88", label: "Фризьорско и козметично оборудване" },
    { id: "560", label: "Индустриална авто техника" },
    { id: "89", label: "Медицинско оборудване" },
    { id: "561", label: "Селскостопанска авто техника" },
    { id: "241", label: "Инструменти" },
    { id: "90", label: "Машини и промишлено оборудване" },
    { id: "448", label: "Офис обзавеждане и материали" }
  ],
  "5": [
    { id: "37", label: "Курсове и обучение" },
    { id: "38", label: "Строителни и ремонтни" },
    { id: "42", label: "Почистване" },
    { id: "39", label: "Транспортни, хамалски" },
    { id: "40", label: "Финансови, правни" },
    { id: "85", label: "Бизнес партньорство" },
    { id: "41", label: "Преводи, легализации" },
    { id: "43", label: "Сватби, събития, кетъринг" },
    { id: "44", label: "Фризьорски и козметични" },
    { id: "45", label: "Болногледачи, хосписи" },
    { id: "46", label: "Детегледачки, детски центрове" },
    { id: "47", label: "Охранителни, детективски" },
    { id: "48", label: "Медицински, стоматологични" },
    { id: "49", label: "Занаятчийски" },
    { id: "50", label: "Ясновидство" },
    { id: "51", label: "Ремонт на бяла и черна техника" },
    { id: "171", label: "Ремонт на компютри и офис техника" },
    { id: "212", label: "Ремонт на телефони и електроника" },
    { id: "1078", label: "Копирни услуги" },
    { id: "1079", label: "Траурни и погребални услуги" },
    { id: "52", label: "Други услуги" }
  ],
  "8": [
    { id: "71", label: "Детегледачки" },
    { id: "72", label: "Домашни помощници" },
    { id: "73", label: "Търговски представители и дистрибуция" },
    { id: "74", label: "Охранители" },
    { id: "680", label: "Готвачи и кухненски работници" },
    { id: "679", label: "Бармани" },
    { id: "75", label: "Сервитьори" },
    { id: "681", label: "Камериерки" },
    { id: "76", label: "Рецепционисти" },
    { id: "77", label: "Шофьори" },
    { id: "78", label: "Общи работници" },
    { id: "682", label: "Автомонтьори" },
    { id: "79", label: "Строителство" },
    { id: "1235", label: "Производство" },
    { id: "80", label: "Фризьори, козметици" },
    { id: "683", label: "Манекени, фотомодели, рекламни лица" },
    { id: "684", label: "Продавачи и касиери" },
    { id: "81", label: "Аниматори, танцьори, статисти" },
    { id: "82", label: "Шивачи" },
    { id: "685", label: "Надомна работа" },
    { id: "83", label: "Работа в Чужбина" },
    { id: "1247", label: "Оператори в кол център" },
    { id: "1248", label: "Администрация и офис сътрудници" },
    { id: "1249", label: "Счетоводители и финансови консултанти" },
    { id: "1250", label: "IT специалисти и програмисти" },
    { id: "1251", label: "Учители и преподаватели" },
    { id: "1252", label: "Мениджъри и експерти" },
    { id: "1253", label: "Брокери" },
    { id: "1254", label: "Хигиенисти и миячи" },
    { id: "1255", label: "Куриери и доставчици" },
    { id: "1256", label: "Инженери" },
    { id: "1257", label: "Медицински работници" },
    { id: "1258", label: "Болногледачи и социални работници" },
    { id: "1259", label: "Разпространители на рекламни материали" },
    { id: "1239", label: "Техници, монтаж и ремонт" },
    { id: "84", label: "Други оферти за работа" }
  ],
  "106": [
    { id: "1080", label: "Почивки в България" },
    { id: "686", label: "Каравани под наем" },
    { id: "687", label: "Почивки в чужбина" },
    { id: "275", label: "Квартири, нощувки" },
    { id: "1091", label: "Сафари почивки" },
    { id: "1092", label: "Еднодневни екскурзии и почивки" },
    { id: "1093", label: "Уикенд почивки и екскурзии" },
    { id: "278", label: "Самолетни екскурзии" },
    { id: "279", label: "Автобусни екскурзии" },
    { id: "280", label: "Екзотични дестинации" },
    { id: "281", label: "Круизи" },
    { id: "282", label: "Празнични оферти" }
  ]
};

export const BAZAR_BG_THIRD_LEVEL_BY_SUBCATEGORY: Record<string, BazarBgCategoryNode[]> = {
  "36": [
    { id: "195", label: "Alcatel" },
    { id: "631", label: "Allview" },
    { id: "194", label: "Apple iPhone" },
    { id: "630", label: "Asus" },
    { id: "196", label: "Blackberry" },
    { id: "447", label: "CAT" },
    { id: "197", label: "HTC" },
    { id: "206", label: "Huawei" },
    { id: "199", label: "Lenovo" },
    { id: "198", label: "LG" },
    { id: "1119", label: "Meizu" },
    { id: "460", label: "Microsoft" },
    { id: "200", label: "Motorola" },
    { id: "201", label: "Nokia" },
    { id: "202", label: "Samsung" },
    { id: "1117", label: "Siemens" },
    { id: "204", label: "Sony" },
    { id: "203", label: "Sony Ericsson" },
    { id: "1118", label: "Vertu" },
    { id: "1116", label: "Vodafone" },
    { id: "446", label: "Xiaomi" },
    { id: "207", label: "ZTE" },
    { id: "208", label: "Други" },
    { id: "632", label: "Телефони с две сим карти" },
    { id: "211", label: "Стационарни телефони и факсове" }
  ],
  "93": [
    { id: "373", label: "Образователни игри" },
    { id: "370", label: "Плюшени играчки" },
    { id: "374", label: "Музикални играчки" },
    { id: "1001", label: "Надуваеми играчки" },
    { id: "369", label: "Кукли" },
    { id: "1002", label: "Конструктори" },
    { id: "375", label: "Рисуване и оцветяване" },
    { id: "1003", label: "Игри и пъзели" },
    { id: "1004", label: "Електрически играчки" },
    { id: "372", label: "Коли, камиони, мотори, писти" },
    { id: "1005", label: "Влакчета, самолети, хеликоптери" },
    { id: "1006", label: "Играчки за стая" },
    { id: "1007", label: "Дрънкалки и чесалки" },
    { id: "1356", label: "Фигурки" },
    { id: "371", label: "Скутери и тротинетки" },
    { id: "1357", label: "Детски топки" },
    { id: "1358", label: "Пластелини, моделини и пясъци" },
    { id: "376", label: "Други" }
  ]
};

export const BAZAR_BG_SCHEMA_OPTIONS: SelectOption[] = [
  { label: "Generic goods / classifieds", value: "generic_goods" },
  { label: "Auto accessories / consumables", value: "auto_accessories" },
  { label: "Real estate", value: "real_estate" },
  { label: "Jobs / services", value: "jobs_services" }
];

export function getBazarBgTopLevelLabel(id: string): string {
  return BAZAR_BG_TOP_LEVEL_CATEGORIES.find((item) => item.id === id)?.label ?? "";
}

export function getBazarBgSubcategoryLabel(topLevelId: string, subcategoryId: string): string {
  return (BAZAR_BG_SUBCATEGORIES_BY_TOP_LEVEL[topLevelId] ?? []).find((item) => item.id === subcategoryId)?.label ?? "";
}

export function getBazarBgThirdLevelLabel(subcategoryId: string, leafCategoryId: string): string {
  return (BAZAR_BG_THIRD_LEVEL_BY_SUBCATEGORY[subcategoryId] ?? []).find((item) => item.id === leafCategoryId)?.label ?? "";
}

const CONDITION_OPTIONS = makeOptions(["Ново", "Използвано"]);
const DEAL_TYPE_OPTIONS = makeOptions(["Продава", "Дава под наем"]);
const CONSTRUCTION_TYPE_OPTIONS = makeOptions(["Панел", "Тухла", "ЕПК", "ПК", "Гредоред"]);
const PRICE_TYPE_OPTIONS = [
  { label: "Fixed price (rprice2)", value: "2" },
  { label: "Negotiable (rprice1)", value: "1" },
  { label: "By offer (rprice3)", value: "3" }
];
const CURRENCY_OPTIONS = [
  { label: "EUR", value: "2" },
  { label: "BGN", value: "1" },
  { label: "USD", value: "3" }
];
const YES_NO_OPTIONS = [
  { label: "No", value: "0" },
  { label: "Yes", value: "1" }
];

export const BAZAR_BG_SCHEMAS: Record<BazarBgSchemaKey, BazarBgSchema> = {
  generic_goods: {
    key: "generic_goods",
    label: "Generic goods / classifieds",
    categoryPath: ["multiple"],
    titleField: "title",
    priceField: "price",
    descriptionField: "description",
    locationFields: ["location"],
    contactFields: ["phone"],
    fieldGroups: [
      {
        title: "Core",
        fields: [
          { name: "title", label: "Заглавие", type: "text", required: true, placeholder: "Обява" },
          { name: "description", label: "Описание", type: "textarea", required: true, placeholder: "Добавете описание" },
          { name: "price", label: "Цена", type: "text", required: true, placeholder: "150" },
          { name: "price_type", label: "Price type", type: "select", options: PRICE_TYPE_OPTIONS, placeholder: "Fixed price" },
          { name: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, placeholder: "EUR" },
          { name: "condition", label: "Състояние", type: "select", options: CONDITION_OPTIONS, dependsOn: "category" },
          { name: "delivery", label: "Доставка", type: "text", dependsOn: "category", placeholder: "Лично предаване" },
          { name: "kind", label: "Вид", type: "text", dependsOn: "subcategory", placeholder: "Трапезни столове" },
          { name: "location", label: "Локация", type: "text", required: true, placeholder: "София" },
          { name: "province_city_location", label: "Province/City select value", type: "text", placeholder: "15" },
          { name: "populated_location", label: "Populated place select value", type: "text", placeholder: "1501" },
          { name: "province_id", label: "Province ID (hidden)", type: "text", placeholder: "15" },
          { name: "city_id", label: "City ID (hidden)", type: "text", placeholder: "1501" },
          { name: "district_id", label: "District ID (hidden)", type: "text", placeholder: "0" },
          { name: "phone", label: "Телефон", type: "tel", dependsOn: "account_state", placeholder: "08..." },
          { name: "hide_phone", label: "Hide phone", type: "select", options: YES_NO_OPTIONS },
          { name: "exact_coordinates", label: "Exact coordinates", type: "select", options: YES_NO_OPTIONS },
          { name: "lat", label: "Latitude", type: "text", placeholder: "42.6977" },
          { name: "long", label: "Longitude", type: "text", placeholder: "23.3219" }
        ]
      }
    ]
  },
  auto_accessories: {
    key: "auto_accessories",
    label: "Auto accessories / consumables",
    categoryPath: ["Авто", "Аксесоари и консумативи"],
    titleField: "title",
    priceField: "price",
    descriptionField: "description",
    locationFields: ["location"],
    contactFields: ["phone"],
    fieldGroups: [
      {
        title: "Core",
        fields: [
          { name: "title", label: "Заглавие", type: "text", required: true, placeholder: "Авто аксесоар" },
          { name: "description", label: "Описание", type: "textarea", required: true, placeholder: "Добавете описание" },
          { name: "price", label: "Цена", type: "text", required: true, placeholder: "120" },
          { name: "price_type", label: "Price type", type: "select", options: PRICE_TYPE_OPTIONS, placeholder: "Fixed price" },
          { name: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, placeholder: "EUR" },
          { name: "condition", label: "Състояние", type: "select", options: CONDITION_OPTIONS },
          { name: "vehicleType", label: "Тип мпс", type: "text", required: true, dependsOn: "category", placeholder: "Автомобил" },
          { name: "accessoryType", label: "Aксесоар", type: "text", required: true, dependsOn: "category", placeholder: "Стелки" },
          { name: "location", label: "Локация", type: "text", required: true, placeholder: "Пловдив" },
          { name: "province_city_location", label: "Province/City select value", type: "text", placeholder: "16" },
          { name: "populated_location", label: "Populated place select value", type: "text", placeholder: "1601" },
          { name: "phone", label: "Телефон", type: "tel", placeholder: "08..." },
          { name: "hide_phone", label: "Hide phone", type: "select", options: YES_NO_OPTIONS }
        ]
      }
    ]
  },
  real_estate: {
    key: "real_estate",
    label: "Real estate",
    categoryPath: ["Имоти", "multiple"],
    titleField: "title",
    priceField: "price",
    descriptionField: "description",
    locationFields: ["location"],
    contactFields: ["phone"],
    fieldGroups: [
      {
        title: "Listing",
        fields: [
          { name: "title", label: "Заглавие", type: "text", required: true, placeholder: "Двустаен апартамент" },
          { name: "description", label: "Описание", type: "textarea", required: true, placeholder: "Добавете описание" },
          { name: "price", label: "Цена", type: "text", required: true, placeholder: "95000" },
          { name: "price_type", label: "Price type", type: "select", options: PRICE_TYPE_OPTIONS, placeholder: "Fixed price" },
          { name: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, placeholder: "EUR" },
          { name: "location", label: "Локация", type: "text", required: true, placeholder: "София, Младост" },
          { name: "province_city_location", label: "Province/City select value", type: "text", placeholder: "15" },
          { name: "populated_location", label: "Populated place select value", type: "text", placeholder: "1501" },
          { name: "phone", label: "Телефон", type: "tel", placeholder: "08..." },
          { name: "hide_phone", label: "Hide phone", type: "select", options: YES_NO_OPTIONS },
          { name: "exact_coordinates", label: "Exact coordinates", type: "select", options: YES_NO_OPTIONS },
          { name: "lat", label: "Latitude", type: "text", placeholder: "42.6977" },
          { name: "long", label: "Longitude", type: "text", placeholder: "23.3219" }
        ]
      },
      {
        title: "Property specifics",
        fields: [
          { name: "dealType", label: "Тип сделка", type: "select", required: true, options: DEAL_TYPE_OPTIONS, dependsOn: "subcategory" },
          { name: "propertyType", label: "Тип апартамент / тип имот", type: "text", required: true, dependsOn: "subcategory", placeholder: "2-стаен" },
          { name: "areaSqm", label: "Квадратура", type: "number", required: true, placeholder: "78" },
          { name: "constructionType", label: "Вид строителство", type: "select", options: CONSTRUCTION_TYPE_OPTIONS, dependsOn: "subcategory" },
          { name: "floor", label: "Етаж", type: "number", dependsOn: "subcategory", placeholder: "4" },
          { name: "year", label: "Година", type: "number", dependsOn: "subcategory", placeholder: "2010" }
        ]
      }
    ]
  },
  jobs_services: {
    key: "jobs_services",
    label: "Jobs / services",
    categoryPath: ["Работа or Услуги", "multiple"],
    titleField: "title",
    priceField: "salary_or_price",
    descriptionField: "description",
    locationFields: ["location"],
    contactFields: ["phone"],
    fieldGroups: [
      {
        title: "Core",
        fields: [
          { name: "title", label: "Заглавие", type: "text", required: true, placeholder: "Шофьор категория C" },
          { name: "description", label: "Описание", type: "textarea", required: true, placeholder: "Добавете описание" },
          { name: "salary_or_price", label: "Заплата / Цена", type: "text", dependsOn: "category", placeholder: "2000" },
          { name: "price_type", label: "Price type", type: "select", options: PRICE_TYPE_OPTIONS, placeholder: "Fixed price" },
          { name: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, placeholder: "EUR" },
          { name: "location", label: "Локация", type: "text", required: true, placeholder: "Варна" },
          { name: "province_city_location", label: "Province/City select value", type: "text", placeholder: "3" },
          { name: "populated_location", label: "Populated place select value", type: "text", placeholder: "301" },
          { name: "phone", label: "Телефон", type: "tel", placeholder: "08..." },
          { name: "hide_phone", label: "Hide phone", type: "select", options: YES_NO_OPTIONS }
        ]
      }
    ]
  }
};
