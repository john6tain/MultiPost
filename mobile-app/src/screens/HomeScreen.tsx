import React from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { RootStackParamList } from "../types/navigation";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { isReady, pairingSession, listingDraft, setPairingSession } = useAppState();

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

      <PrimaryButton title="Scan Desktop QR" onPress={() => navigation.navigate("QRScanner")} />
      <PrimaryButton title="Create Listing" onPress={() => navigation.navigate("CreateListing")} variant="secondary" />

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

      <Pressable
        onLongPress={() => navigation.navigate("CreateListing")}
        onPress={() => navigation.navigate("ListingPreview")}
        style={[styles.card, styles.draftCard]}
      >
        <Text style={styles.heading}>Draft Listing</Text>
        <Text style={styles.status}>{listingDraft.title ? listingDraft.title : "No draft saved yet."}</Text>
        <Text style={styles.linkText}>Tap to send to desktop. Long press to edit.</Text>
      </Pressable>
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
