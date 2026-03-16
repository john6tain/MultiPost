import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Field from "../components/Field";
import PhotoPickerField from "../components/PhotoPickerField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { RootStackParamList } from "../types/navigation";
import { ListingDraft } from "../types/listing";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CreateListing">;

export default function CreateListingScreen({ navigation }: Props) {
  const { listingDraft, saveListingDraft } = useAppState();
  const [draft, setDraft] = useState<ListingDraft>(listingDraft);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function pickImages(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", fromCamera ? "Camera access is required." : "Photo library access is required.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8
        });

    if (result.canceled) {
      return;
    }

    const nextImages = result.assets.map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType
    }));
    updateField("images", [...draft.images, ...nextImages]);
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.description.trim() || !draft.price.trim()) {
      Alert.alert("Missing fields", "Title, description, and price are required.");
      return;
    }

    setIsSaving(true);

    try {
      await saveListingDraft(draft);
      navigation.navigate("ListingPreview");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Field label="Title" value={draft.title} onChangeText={(value) => updateField("title", value)} placeholder="Vintage bicycle" />
      <Field label="Description" value={draft.description} onChangeText={(value) => updateField("description", value)} multiline placeholder="Describe the item..." />
      <Field label="Price" value={draft.price} onChangeText={(value) => updateField("price", value)} keyboardType="numeric" placeholder="100" />
      <Field label="Category" value={draft.category} onChangeText={(value) => updateField("category", value)} placeholder="Bikes" />
      <Field label="Location" value={draft.location} onChangeText={(value) => updateField("location", value)} placeholder="Sofia" />
      <PhotoPickerField
        images={draft.images}
        onPickFromLibrary={() => pickImages(false)}
        onTakePhoto={() => pickImages(true)}
      />
      <View style={styles.actions}>
        <PrimaryButton title={isSaving ? "Saving..." : "Save Listing"} onPress={handleSave} disabled={isSaving} />
      </View>
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
    gap: 14
  },
  actions: {
    marginTop: 8
  }
});
