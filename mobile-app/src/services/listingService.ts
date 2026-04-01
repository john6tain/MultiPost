import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListingDraft, SavedListingDraft } from "../types/listing";

const LISTINGS_STORAGE_KEY = "listingDrafts";
const LEGACY_LISTING_STORAGE_KEY = "listingDraft";

export const emptyListingDraft: ListingDraft = {
  title: "",
  description: "",
  price: "",
  category: "",
  location: "",
  phone: "",
  images: [],
  postingTargets: ["olx"],
  marketplaceData: {}
};

function normalizeListingDraft(value: Partial<ListingDraft> | null | undefined): ListingDraft {
  return {
    ...emptyListingDraft,
    ...value,
    images: Array.isArray(value?.images) ? value.images : [],
    postingTargets: Array.isArray(value?.postingTargets) && value.postingTargets.length
      ? value.postingTargets
      : emptyListingDraft.postingTargets,
    marketplaceData: value?.marketplaceData ?? {}
  };
}

function normalizeSavedListingDraft(value: Partial<SavedListingDraft> | null | undefined): SavedListingDraft {
  return {
    ...normalizeListingDraft(value),
    id: typeof value?.id === "string" && value.id ? value.id : "",
    updatedAt: typeof value?.updatedAt === "number" ? value.updatedAt : Date.now()
  };
}

export function createListingId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getStoredListings(): Promise<SavedListingDraft[]> {
  const rawValue = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
  if (rawValue) {
    const parsed = JSON.parse(rawValue) as Partial<SavedListingDraft>[];
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => normalizeSavedListingDraft(item))
        .filter((item) => item.id);
    }
  }

  const legacyRawValue = await AsyncStorage.getItem(LEGACY_LISTING_STORAGE_KEY);
  if (!legacyRawValue) {
    return [];
  }

  const legacyListing = normalizeListingDraft(JSON.parse(legacyRawValue) as Partial<ListingDraft>);
  const migratedListing: SavedListingDraft = {
    ...legacyListing,
    id: createListingId(),
    updatedAt: Date.now()
  };

  await AsyncStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify([migratedListing]));
  await AsyncStorage.removeItem(LEGACY_LISTING_STORAGE_KEY);
  return [migratedListing];
}

export async function saveStoredListings(listings: SavedListingDraft[]) {
  await AsyncStorage.setItem(
    LISTINGS_STORAGE_KEY,
    JSON.stringify(
      listings.map((listing) => normalizeSavedListingDraft(listing)).filter((listing) => listing.id)
    )
  );
}

export async function clearStoredListings() {
  await AsyncStorage.removeItem(LISTINGS_STORAGE_KEY);
  await AsyncStorage.removeItem(LEGACY_LISTING_STORAGE_KEY);
}
