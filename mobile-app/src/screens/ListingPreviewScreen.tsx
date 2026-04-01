import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImageManipulator from "expo-image-manipulator";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { t } from "../i18n";
import { buildListingWithEmbeddedImages, sendListingToExtension } from "../services/peerTransfer";
import { createRelaySession, updateRelaySession } from "../services/relay";
import { ListingImage, ListingPayload } from "../types/listing";
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
  const [sendProgress, setSendProgress] = useState("");
  const IMAGE_RELAY_CHUNK_SIZE = 40000;
  const IMAGE_RELAY_STAGE_TIMEOUT_MS = 30000;
  const MAX_IMAGE_RELAY_CHUNKS_TOTAL = 120;
  const RELAY_IMAGE_MAX_WIDTH = 1280;
  const RELAY_IMAGE_JPEG_COMPRESS = 0.6;

  async function updateRelayWithRetry(relayUrl: string, payload: unknown) {
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await updateRelaySession(relayUrl, payload);
        return;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Relay update failed.");
  }

  async function createRelaySessionWithRetry(payload: unknown) {
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await createRelaySession(payload);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Relay session create failed.");
  }

  async function withTimeout<T>(work: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    try {
      return await Promise.race([work, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  async function compressImagesForRelay(images: ListingImage[]) {
    const compressed: ListingImage[] = [];

    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      setSendProgress(`Optimizing image ${index + 1}/${images.length}...`);

      try {
        const manipulated = await ImageManipulator.manipulateAsync(
          image.uri,
          [{ resize: { width: RELAY_IMAGE_MAX_WIDTH } }],
          {
            compress: RELAY_IMAGE_JPEG_COMPRESS,
            format: ImageManipulator.SaveFormat.JPEG
          }
        );

        compressed.push({
          uri: manipulated.uri,
          fileName: image.fileName || `relay-${index + 1}.jpg`,
          mimeType: "image/jpeg"
        });
      } catch {
        compressed.push(image);
      }
    }

    return compressed;
  }

  const listingPayload = useMemo<ListingPayload>(() => ({
    title: listingDraft?.title.trim() ?? "",
    description: listingDraft?.description.trim() ?? "",
    price: Number(listingDraft?.price ?? "") || 0,
    category: listingDraft?.category.trim() ?? "",
    location: listingDraft?.location.trim() ?? "",
    phone: listingDraft?.phone.trim() ?? "",
    images: listingDraft?.images.map((image) => image.uri) ?? [],
    language,
    postingTargets: listingDraft?.postingTargets ?? [],
    marketplaceData: listingDraft?.marketplaceData ?? {}
  }), [language, listingDraft]);

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
    setSendProgress("Preparing listing...");

    try {
      const basePayload: ListingPayload = {
        ...listingPayload,
        images: []
      };

      if (pairingSession.relayUrl) {
        setSendProgress("Preparing relay payload...");
        const relayBasePayload = {
          sessionId: pairingSession.pairingToken,
          paired: true,
          deviceName: pairingSession.deviceName,
          listingUpdatedAt: Date.now()
        };

        try {
          const imageRelayChunkRefs = await withTimeout((async () => {
            const relayReadyImages = await compressImagesForRelay(listingDraft.images);
            const listingWithImages = await buildListingWithEmbeddedImages(basePayload, relayReadyImages);
            const chunkRefs: string[][] = [];
            let totalChunkCounter = 0;

            for (let imageIndex = 0; imageIndex < listingWithImages.images.length; imageIndex += 1) {
              const imageDataUrl = listingWithImages.images[imageIndex];
              const totalChunks = Math.ceil(imageDataUrl.length / IMAGE_RELAY_CHUNK_SIZE);
              totalChunkCounter += totalChunks;
              setSendProgress(`Uploading image ${imageIndex + 1}/${listingWithImages.images.length} (${totalChunks} chunks)...`);

              if (totalChunkCounter > MAX_IMAGE_RELAY_CHUNKS_TOTAL) {
                throw new Error("Too many image chunks for relay transfer.");
              }

              const chunkRelayUrls: string[] = [];

              for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
                const start = chunkIndex * IMAGE_RELAY_CHUNK_SIZE;
                const end = start + IMAGE_RELAY_CHUNK_SIZE;
                const chunk = imageDataUrl.slice(start, end);
                setSendProgress(`Uploading image ${imageIndex + 1}/${listingWithImages.images.length}, chunk ${chunkIndex + 1}/${totalChunks}...`);

                const chunkRelayUrl = await createRelaySessionWithRetry({
                  type: "listing-image-chunk",
                  imageIndex,
                  chunkIndex,
                  totalChunks,
                  chunk,
                  createdAt: Date.now()
                });

                chunkRelayUrls.push(chunkRelayUrl);
              }

              chunkRefs.push(chunkRelayUrls);
            }

            return chunkRefs;
          })(), IMAGE_RELAY_STAGE_TIMEOUT_MS, "Relay image upload timed out.");

          setSendProgress("Finalizing listing payload...");
          await updateRelayWithRetry(pairingSession.relayUrl, {
            ...relayBasePayload,
            mode: "relay-listing-with-image-refs",
            listing: {
              ...basePayload,
              images: [],
              imageRelayChunkRefs
            }
          });

          Alert.alert(t(language, "preview.sentTitle"), "Listing sent in relay mode (with images).");
          return;
        } catch (relayImageError) {
          setSendProgress("Falling back to text-only send...");
          await updateRelayWithRetry(pairingSession.relayUrl, {
            ...relayBasePayload,
            mode: "relay-listing-no-images",
            listing: {
              ...basePayload,
              images: []
            },
            listingWarning: "images_omitted_due_to_relay_image_upload_failure"
          });

          const errorMessage = relayImageError instanceof Error ? relayImageError.message : "Image relay upload failed.";
          Alert.alert(t(language, "preview.sentTitle"), `Listing sent without images. ${errorMessage}`);
          return;
        }
      } else {
        setSendProgress("Sending listing to extension...");
        await sendListingToExtension(basePayload, listingDraft.images);
      }

      Alert.alert(t(language, "preview.sentTitle"), t(language, "preview.sentMessage"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(language, "preview.sendFailedMessage");
      Alert.alert(t(language, "preview.sendFailedTitle"), message);
    } finally {
      setIsSending(false);
      setSendProgress("");
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
      {isSending && sendProgress ? <Text style={styles.progressText}>{sendProgress}</Text> : null}
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
  },
  progressText: {
    color: theme.colors.textMuted,
    fontSize: 13
  }
});
