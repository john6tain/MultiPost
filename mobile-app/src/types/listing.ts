export type ListingImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type ListingDraft = {
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  images: ListingImage[];
};

export type ListingPayload = {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
};
