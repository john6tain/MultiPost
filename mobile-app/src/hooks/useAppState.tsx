import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearStoredListings, createListingId, emptyListingDraft, getStoredListings, saveStoredListings } from "../services/listingService";
import { ListingDraft, SavedListingDraft } from "../types/listing";
import { PairingSession } from "../types/pairing";

const PAIRING_STORAGE_KEY = "pairingSession";

type AppStateValue = {
  isReady: boolean;
  pairingSession: PairingSession | null;
  listingDrafts: SavedListingDraft[];
  setPairingSession: (session: PairingSession | null) => Promise<void>;
  saveListingDraft: (listing: ListingDraft, listingId?: string) => Promise<string>;
  deleteListingDraft: (listingId: string) => Promise<void>;
  clearListingDrafts: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [pairingSession, setPairingSessionState] = useState<PairingSession | null>(null);
  const [listingDrafts, setListingDrafts] = useState<SavedListingDraft[]>([]);

  useEffect(() => {
    async function hydrate() {
      const [storedPairing, storedListing] = await Promise.all([
        AsyncStorage.getItem(PAIRING_STORAGE_KEY),
        getStoredListings()
      ]);

      if (storedPairing) {
        setPairingSessionState(JSON.parse(storedPairing) as PairingSession);
      }

      if (storedListing.length) {
        const sorted = [...storedListing].sort((a, b) => b.updatedAt - a.updatedAt);
        setListingDrafts(sorted);
      }

      setIsReady(true);
    }

    hydrate().catch(() => {
      setIsReady(true);
    });
  }, []);

  async function setPairingSession(session: PairingSession | null) {
    setPairingSessionState(session);

    if (session) {
      await AsyncStorage.setItem(PAIRING_STORAGE_KEY, JSON.stringify(session));
      return;
    }

    await AsyncStorage.removeItem(PAIRING_STORAGE_KEY);
  }

  async function saveListingDraft(listing: ListingDraft, listingId?: string) {
    const id = listingId || createListingId();

    const nextListing: SavedListingDraft = {
      ...emptyListingDraft,
      ...listing,
      id,
      updatedAt: Date.now()
    };

    const nextDrafts = (() => {
      const existingIndex = listingDrafts.findIndex((item) => item.id === id);
      if (existingIndex === -1) {
        return [nextListing, ...listingDrafts];
      }

      const copy = [...listingDrafts];
      copy[existingIndex] = nextListing;
      return copy;
    })().sort((a, b) => b.updatedAt - a.updatedAt);

    setListingDrafts(nextDrafts);
    await saveStoredListings(nextDrafts);
    return id;
  }

  async function deleteListingDraft(listingId: string) {
    const nextDrafts = listingDrafts.filter((item) => item.id !== listingId);
    setListingDrafts(nextDrafts);
    await saveStoredListings(nextDrafts);
  }

  async function clearListingDrafts() {
    setListingDrafts([]);
    await clearStoredListings();
  }

  return (
    <AppStateContext.Provider
      value={{
        isReady,
        pairingSession,
        listingDrafts,
        setPairingSession,
        saveListingDraft,
        deleteListingDraft,
        clearListingDrafts
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider.");
  }

  return context;
}
