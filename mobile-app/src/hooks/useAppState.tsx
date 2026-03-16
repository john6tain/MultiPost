import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearStoredListing, emptyListingDraft, getStoredListing, saveStoredListing } from "../services/listingService";
import { ListingDraft } from "../types/listing";
import { PairingSession } from "../types/pairing";

const PAIRING_STORAGE_KEY = "pairingSession";

type AppStateValue = {
  isReady: boolean;
  pairingSession: PairingSession | null;
  listingDraft: ListingDraft;
  setPairingSession: (session: PairingSession | null) => Promise<void>;
  saveListingDraft: (listing: ListingDraft) => Promise<void>;
  clearListingDraft: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [pairingSession, setPairingSessionState] = useState<PairingSession | null>(null);
  const [listingDraft, setListingDraft] = useState<ListingDraft>(emptyListingDraft);

  useEffect(() => {
    async function hydrate() {
      const [storedPairing, storedListing] = await Promise.all([
        AsyncStorage.getItem(PAIRING_STORAGE_KEY),
        getStoredListing()
      ]);

      if (storedPairing) {
        setPairingSessionState(JSON.parse(storedPairing) as PairingSession);
      }

      if (storedListing) {
        setListingDraft(storedListing);
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

  async function saveListingDraft(listing: ListingDraft) {
    setListingDraft(listing);
    await saveStoredListing(listing);
  }

  async function clearListingDraft() {
    setListingDraft(emptyListingDraft);
    await clearStoredListing();
  }

  return (
    <AppStateContext.Provider
      value={{
        isReady,
        pairingSession,
        listingDraft,
        setPairingSession,
        saveListingDraft,
        clearListingDraft
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
