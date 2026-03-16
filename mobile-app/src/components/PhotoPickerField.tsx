import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { ListingImage } from "../types/listing";
import { theme } from "../theme";

type PhotoPickerFieldProps = {
  images: ListingImage[];
  onPickFromLibrary: () => void;
  onTakePhoto: () => void;
};

export default function PhotoPickerField({ images, onPickFromLibrary, onTakePhoto }: PhotoPickerFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos</Text>
      <View style={styles.actions}>
        <PrimaryButton title="Gallery" onPress={onPickFromLibrary} variant="secondary" />
        <PrimaryButton title="Camera" onPress={onTakePhoto} variant="secondary" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
        {images.length === 0 ? <Text style={styles.empty}>No photos selected yet.</Text> : null}
        {images.map((image) => (
          <Image key={image.uri} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  imageRow: {
    gap: 8,
    paddingVertical: 4
  },
  empty: {
    color: theme.colors.textMuted
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceAlt
  }
});
