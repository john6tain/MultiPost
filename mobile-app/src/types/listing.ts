export type ListingImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type PostingTargetId = "olx" | "mobile-bg";

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
    tiresRims?: MobileBgTiresRimsData;
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
