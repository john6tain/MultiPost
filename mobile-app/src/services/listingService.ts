import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListingDraft } from "../types/listing";

const LISTING_STORAGE_KEY = "listingDraft";

export const emptyListingDraft: ListingDraft = {
  title: "",
  description: "",
  price: "",
  category: "",
  location: "",
  images: []
};

export async function getStoredListing(): Promise<ListingDraft | null> {
  const rawValue = await AsyncStorage.getItem(LISTING_STORAGE_KEY);
  return rawValue ? (JSON.parse(rawValue) as ListingDraft) : null;
}

export async function saveStoredListing(listing: ListingDraft) {
  await AsyncStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(listing));
}

export async function clearStoredListing() {
  await AsyncStorage.removeItem(LISTING_STORAGE_KEY);
}
