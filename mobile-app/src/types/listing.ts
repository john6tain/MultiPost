export type ListingImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type PostingTargetId = "olx" | "mobile-bg" | "bazar-bg";

export type BazarBgSchemaKey =
  | "generic_goods"
  | "auto_accessories"
  | "real_estate"
  | "jobs_services";

export type MobileBgPrimaryCategoryKey =
  | "cars"
  | "buses"
  | "trucks"
  | "motorcycles"
  | "forklifts"
  | "boats"
  | "trailers"
  | "bicycles"
  | "parts"
  | "tires-rims";

export type MobileBgTiresRimsData = {
  categoryKey?: "tires-rims";
  adType?: string;
  vatStatus?: string;
  currency?: string;
  condition?: string;
  tireBrand?: string;
  tireWidthMm?: string;
  tireHeight?: string;
  rimDiameterInch?: string;
  season?: string;
  speedIndex?: string;
  loadIndex?: string;
  treadPattern?: string;
  carMake?: string;
  carModel?: string;
  rimBrand?: string;
  rimWidthInch?: string;
  rimMaterial?: string;
  rimOffsetEtMm?: string;
  boltsCount?: string;
  boltSpacing?: string;
  centerHole?: string;
  quantity?: string;
  region?: string;
  city?: string;
  rimType?: string;
};

export type MarketplaceData = {
  mobileBg?: {
    primaryCategoryKey?: MobileBgPrimaryCategoryKey;
    fields?: Record<string, string>;
    features?: string[];
    tiresRims?: MobileBgTiresRimsData;
  };
  bazarBg?: {
    schemaKey?: BazarBgSchemaKey;
    topLevelCategory?: string;
    topLevelCategoryId?: string;
    subcategory?: string;
    subcategoryId?: string;
    leafCategory?: string;
    leafCategoryId?: string;
    fields?: Record<string, string>;
  };
};

export type ListingDraft = {
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  images: ListingImage[];
  postingTargets: PostingTargetId[];
  marketplaceData?: MarketplaceData;
};

export type ListingPayload = {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  postingTargets: PostingTargetId[];
  marketplaceData?: MarketplaceData;
};

export type SavedListingDraft = ListingDraft & {
  id: string;
  updatedAt: number;
};
