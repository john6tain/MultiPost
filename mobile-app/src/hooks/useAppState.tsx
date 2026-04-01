import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearStoredListings, createListingId, emptyListingDraft, getStoredListings, saveStoredListings } from "../services/listingService";
import { getRelaySession } from "../services/relay";
import { DEFAULT_LANGUAGE, isLanguage, Language } from "../i18n";
import { ListingDraft, SavedListingDraft } from "../types/listing";
import { PairingSession } from "../types/pairing";

const PAIRING_STORAGE_KEY = "pairingSession";
const LANGUAGE_STORAGE_KEY = "language";

type AppStateValue = {
  isReady: boolean;
  language: Language;
  pairingSession: PairingSession | null;
  listingDrafts: SavedListingDraft[];
  setLanguage: (language: Language) => Promise<void>;
  setPairingSession: (session: PairingSession | null) => Promise<void>;
  saveListingDraft: (listing: ListingDraft, listingId?: string) => Promise<string>;
  deleteListingDraft: (listingId: string) => Promise<void>;
  clearListingDrafts: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [pairingSession, setPairingSessionState] = useState<PairingSession | null>(null);
  const [listingDrafts, setListingDrafts] = useState<SavedListingDraft[]>([]);

  useEffect(() => {
    async function hydrate() {
      const [storedPairing, storedLanguage, storedListing] = await Promise.all([
        AsyncStorage.getItem(PAIRING_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
        getStoredListings()
      ]);

      if (storedPairing) {
        setPairingSessionState(JSON.parse(storedPairing) as PairingSession);
      }

      if (storedLanguage && isLanguage(storedLanguage)) {
        setLanguageState(storedLanguage);
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

  useEffect(() => {
    if (!pairingSession?.relayUrl) {
      return;
    }

    let cancelled = false;

    const intervalId = setInterval(async () => {
      try {
        const relayPayload = await getRelaySession(pairingSession.relayUrl!);
        if (cancelled) {
          return;
        }

        if (relayPayload?.disconnected === true) {
          setPairingSessionState(null);
          await AsyncStorage.removeItem(PAIRING_STORAGE_KEY);
        }
      } catch {
        // Best-effort polling.
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [pairingSession?.pairingToken, pairingSession?.relayUrl]);

  async function setLanguage(language: Language) {
    setLanguageState(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

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
        language,
        pairingSession,
        listingDrafts,
        setLanguage,
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
