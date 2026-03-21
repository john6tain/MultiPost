export type RootStackParamList = {
  Home: undefined;
  QRScanner: undefined;
  CreateListing: {
    mode?: "new" | "edit";
    listingId?: string;
  } | undefined;
  ListingPreview: {
    listingId?: string;
  } | undefined;
};
