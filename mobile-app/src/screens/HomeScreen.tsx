import React from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { RootStackParamList } from "../types/navigation";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { isReady, pairingSession, listingDrafts, setPairingSession } = useAppState();
  const hasSavedDrafts = listingDrafts.length > 0;

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.heading}>Pairing Status</Text>
        <Text style={styles.status}>
          {pairingSession ? `Connected to ${pairingSession.deviceName}` : "Not paired yet."}
        </Text>
      </View>

      {!pairingSession ? (
        <PrimaryButton title="Scan Desktop QR" onPress={() => navigation.navigate("QRScanner")} />
      ) : null}
      <PrimaryButton
        title="Create Listing"
        onPress={() => navigation.navigate("CreateListing", { mode: "new" })}
        variant="secondary"
      />
      {pairingSession ? (
        <PrimaryButton
          title="Disconnect"
          onPress={async () => {
            await setPairingSession(null);
            Alert.alert("Disconnected", "This phone is no longer linked to the desktop extension.");
          }}
          variant="danger"
        />
      ) : null}

      {hasSavedDrafts ? (
        <Text style={styles.heading}>Saved Listings ({listingDrafts.length})</Text>
      ) : null}
      {listingDrafts.map((listing) => (
        <Pressable
          key={listing.id}
          onLongPress={() => navigation.navigate("CreateListing", { mode: "edit", listingId: listing.id })}
          onPress={() => navigation.navigate("ListingPreview", { listingId: listing.id })}
          style={[styles.card, styles.draftCard]}
        >
          <Text style={styles.heading}>{listing.title || "Untitled listing"}</Text>
          <Text style={styles.status}>{listing.category || "No category"}</Text>
          <Text style={styles.linkText}>Tap to open. Hold to edit/delete.</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    gap: 12
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  draftCard: {
    backgroundColor: theme.colors.surfaceAlt
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text
  },
  status: {
    fontSize: 14,
    color: theme.colors.textMuted
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary
  }
});
