import axios from "axios";
import { ListingImage, ListingPayload } from "../types/listing";
import { PairingSession } from "../types/pairing";

// Replace localhost with your computer's LAN IP when testing on a real phone.
export const API_BASE_URL = "http://192.168.88.2:3000";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function pairExtension(pairingToken: string, deviceName: string): Promise<PairingSession> {
  try {
    const response = await client.post("/api/mobile/pair-extension", {
      pairingToken,
      deviceName
    });

    return {
      pairingToken,
      userId: response.data.userId,
      deviceName: response.data.deviceName,
      pairedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not pair with desktop."));
  }
}

export async function sendListing(pairingToken: string, listing: ListingPayload) {
  try {
    await client.post("/api/mobile/send-listing", {
      pairingToken,
      listing
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not send listing to desktop."));
  }
}

export async function uploadListingImages(images: ListingImage[]) {
  if (!images.length) {
    return [];
  }

  const formData = new FormData();

  images.forEach((image, index) => {
    formData.append("images", {
      uri: image.uri,
      name: image.fileName || `photo-${index + 1}.jpg`,
      type: image.mimeType || "image/jpeg"
    } as never);
  });

  try {
    const response = await client.post("/api/mobile/upload-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data.images;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not upload listing images."));
  }
}
