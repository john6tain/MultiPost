import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { t } from "../i18n";
import { sendListing, uploadListingImages } from "../services/api";
import { ListingPayload } from "../types/listing";
import { RootStackParamList } from "../types/navigation";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ListingPreview">;

export default function ListingPreviewScreen({ navigation, route }: Props) {
  const { language, pairingSession, listingDrafts } = useAppState();
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
    phone: listingDraft?.phone.trim() ?? "",
    images: listingDraft?.images.map((image) => image.uri) ?? [],
    postingTargets: listingDraft?.postingTargets ?? [],
    marketplaceData: listingDraft?.marketplaceData ?? {}
  }), [listingDraft]);

  async function handleSend() {
    if (!listingDraft) {
      Alert.alert(t(language, "preview.noListingTitle"), t(language, "preview.noListingMessage"));
      return;
    }

    if (!pairingSession) {
      Alert.alert(t(language, "preview.notConnectedTitle"), t(language, "preview.notConnectedMessage"));
      return;
    }

    setIsSending(true);

    try {
      const uploadedImages = await uploadListingImages(listingDraft.images);

      await sendListing(pairingSession.pairingToken, {
        ...listingPayload,
        images: uploadedImages
      });

      Alert.alert(t(language, "preview.sentTitle"), t(language, "preview.sentMessage"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(language, "preview.sendFailedMessage");
      Alert.alert(t(language, "preview.sendFailedTitle"), message);
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
        <Text style={styles.title}>{listingPayload.title || t(language, "preview.untitled")}</Text>
        <Text style={styles.price}>{listingPayload.price ? `${listingPayload.price} lv` : t(language, "preview.noPrice")}</Text>
        <Text style={styles.meta}>{listingPayload.category || t(language, "preview.noCategory")}</Text>
        <Text style={styles.meta}>{listingPayload.location || t(language, "preview.noLocation")}</Text>
        <Text style={styles.meta}>
          {listingPayload.postingTargets.length
            ? t(language, "preview.targets", { targets: listingPayload.postingTargets.join(", ") })
            : t(language, "preview.targetsNotSet")}
        </Text>
        <Text style={styles.description}>{listingPayload.description || t(language, "preview.noDescription")}</Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
        {(listingDraft?.images ?? []).map((image) => (
          <Image key={image.uri} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </ScrollView>

      <PrimaryButton
        title={pairingSession ? (isSending ? t(language, "preview.sending") : t(language, "preview.sendToDesktop")) : t(language, "preview.pairDesktopFirst")}
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
