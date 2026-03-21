import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { sendListing, uploadListingImages } from "../services/api";
import { ListingPayload } from "../types/listing";
import { RootStackParamList } from "../types/navigation";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ListingPreview">;

export default function ListingPreviewScreen({ navigation, route }: Props) {
  const { pairingSession, listingDrafts } = useAppState();
  const listingId = route.params?.listingId;
  const listingDraft = (typeof listingId === "string"
    ? listingDrafts.find((item) => item.id === listingId)
    : listingDrafts[0]) ?? null;
  const [isSending, setIsSending] = useState(false);

  const listingPayload = useMemo<ListingPayload>(() => ({
    title: listingDraft?.title.trim() ?? "",
    description: listingDraft?.description.trim() ?? "",
    price: Number(listingDraft?.price ?? "") || 0,
    category: listingDraft?.category.trim() ?? "",
    location: listingDraft?.location.trim() ?? "",
    images: listingDraft?.images.map((image) => image.uri) ?? [],
    postingTargets: listingDraft?.postingTargets ?? [],
    marketplaceData: listingDraft?.marketplaceData ?? {}
  }), [listingDraft]);

  async function handleSend() {
    if (!listingDraft) {
      Alert.alert("No listing", "Create a listing first.");
      return;
    }

    if (!pairingSession) {
      Alert.alert("Desktop not connected", "Scan the desktop QR code before sending a listing.");
      return;
    }

    setIsSending(true);

    try {
      const uploadedImages = await uploadListingImages(listingDraft.images);

      await sendListing(pairingSession.pairingToken, {
        ...listingPayload,
        images: uploadedImages
      });

      Alert.alert("Sent", "Listing sent to desktop.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send listing.";
      Alert.alert("Send failed", message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable
        onPress={() => navigation.navigate("CreateListing", { mode: "edit", listingId: listingDraft?.id })}
        style={styles.card}
      >
        <Text style={styles.title}>{listingPayload.title || "Untitled listing"}</Text>
        <Text style={styles.price}>{listingPayload.price ? `${listingPayload.price} lv` : "No price"}</Text>
        <Text style={styles.meta}>{listingPayload.category || "No category"}</Text>
        <Text style={styles.meta}>{listingPayload.location || "No location"}</Text>
        <Text style={styles.meta}>
          {listingPayload.postingTargets.length
            ? `Targets: ${listingPayload.postingTargets.join(", ")}`
            : "Targets: not set"}
        </Text>
        <Text style={styles.description}>{listingPayload.description || "No description"}</Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
        {(listingDraft?.images ?? []).map((image) => (
          <Image key={image.uri} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </ScrollView>

      <PrimaryButton
        title={pairingSession ? (isSending ? "Sending..." : "Send to Desktop") : "Pair Desktop First"}
        onPress={handleSend}
        disabled={isSending || !pairingSession || !listingDraft}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary
  },
  meta: {
    color: theme.colors.textMuted
  },
  description: {
    color: theme.colors.text,
    lineHeight: 20
  },
  imageRow: {
    gap: 8
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceAlt
  }
});
