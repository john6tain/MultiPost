import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListingDraft } from "../types/listing";

const LISTING_STORAGE_KEY = "listingDraft";

export const emptyListingDraft: ListingDraft = {
  title: "",
  description: "",
  price: "",
  category: "",
  location: "",
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

export async function getStoredListing(): Promise<ListingDraft | null> {
  const rawValue = await AsyncStorage.getItem(LISTING_STORAGE_KEY);
  return rawValue ? normalizeListingDraft(JSON.parse(rawValue) as Partial<ListingDraft>) : null;
}

export async function saveStoredListing(listing: ListingDraft) {
  await AsyncStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(normalizeListingDraft(listing)));
}

export async function clearStoredListing() {
  await AsyncStorage.removeItem(LISTING_STORAGE_KEY);
}
