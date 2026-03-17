import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Field from "../components/Field";
import PhotoPickerField from "../components/PhotoPickerField";
import PrimaryButton from "../components/PrimaryButton";
import SelectField from "../components/SelectField";
import {
  MOBILE_BG_AD_TYPE_OPTIONS,
  MOBILE_BG_BOLT_SPACING_OPTIONS,
  MOBILE_BG_BOLTS_COUNT_OPTIONS,
  MOBILE_BG_CONDITION_OPTIONS,
  MOBILE_BG_CURRENCY_OPTIONS,
  MOBILE_BG_HEIGHT_OPTIONS,
  MOBILE_BG_LOAD_INDEX_OPTIONS,
  MOBILE_BG_OFFSET_OPTIONS,
  MOBILE_BG_REGION_OPTIONS,
  MOBILE_BG_RIM_DIAMETER_OPTIONS,
  MOBILE_BG_RIM_MATERIAL_OPTIONS,
  MOBILE_BG_RIM_TYPE_OPTIONS,
  MOBILE_BG_RIM_WIDTH_OPTIONS,
  MOBILE_BG_SEASON_OPTIONS,
  MOBILE_BG_SPEED_INDEX_OPTIONS,
  MOBILE_BG_TIRE_BRAND_OPTIONS,
  MOBILE_BG_TREAD_PATTERN_OPTIONS,
  MOBILE_BG_VAT_STATUS_OPTIONS,
  MOBILE_BG_WIDTH_OPTIONS
} from "../data/mobileBgOptions";
import { useAppState } from "../hooks/useAppState";
import { RootStackParamList } from "../types/navigation";
import { ListingDraft, MobileBgTiresRimsData, PostingTargetId } from "../types/listing";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CreateListing">;

const POSTING_TARGETS: Array<{ id: PostingTargetId; label: string }> = [
  { id: "olx", label: "OLX" },
  { id: "mobile-bg", label: "mobile.bg" }
];

export default function CreateListingScreen({ navigation }: Props) {
  const { listingDraft, saveListingDraft } = useAppState();
  const [draft, setDraft] = useState<ListingDraft>(listingDraft);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateMobileBgField(key: keyof MobileBgTiresRimsData, value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        mobileBg: {
          ...current.marketplaceData?.mobileBg,
          tiresRims: {
            ...current.marketplaceData?.mobileBg?.tiresRims,
            categoryKey: "tires-rims",
            [key]: value
          }
        }
      }
    }));
  }

  function togglePostingTarget(target: PostingTargetId) {
    setDraft((current) => {
      const hasTarget = current.postingTargets.includes(target);
      const postingTargets = hasTarget
        ? current.postingTargets.filter((item) => item !== target)
        : [...current.postingTargets, target];

      return {
        ...current,
        postingTargets
      };
    });
  }

  const tiresRims = draft.marketplaceData?.mobileBg?.tiresRims ?? {};
  const showMobileBgTiresRims = draft.postingTargets.includes("mobile-bg");

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

    if (!draft.postingTargets.length) {
      Alert.alert("Missing targets", "Select at least one posting target.");
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
      <Field label="Title" value={draft.title} onChangeText={(value) => updateField("title", value)} placeholder="Tire set with rims" />
      <Field label="Description" value={draft.description} onChangeText={(value) => updateField("description", value)} multiline placeholder="Describe the item..." />
      <Field label="Price" value={draft.price} onChangeText={(value) => updateField("price", value)} keyboardType="numeric" placeholder="330" />
      <Field label="Category" value={draft.category} onChangeText={(value) => updateField("category", value)} placeholder="Tires and rims" />
      <Field label="Location" value={draft.location} onChangeText={(value) => updateField("location", value)} placeholder="Sofia" />

      <View style={styles.targetsSection}>
        <Text style={styles.sectionTitle}>Posting Targets</Text>
        <Text style={styles.sectionHint}>Choose where this listing is allowed to be posted. Future sites can be added here.</Text>
        <View style={styles.targetRow}>
          {POSTING_TARGETS.map((target) => {
            const isSelected = draft.postingTargets.includes(target.id);

            return (
              <Pressable
                key={target.id}
                onPress={() => togglePostingTarget(target.id)}
                style={[styles.targetChip, isSelected && styles.targetChipSelected]}
              >
                <Text style={[styles.targetChipText, isSelected && styles.targetChipTextSelected]}>
                  {target.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {showMobileBgTiresRims ? (
        <View style={styles.marketplaceSection}>
          <Text style={styles.sectionTitle}>mobile.bg Tires / Rims</Text>
          <Text style={styles.sectionHint}>Shown when `mobile.bg` is selected as a posting target. These fields map to the first mobile.bg step.</Text>

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Sale</Text>
            <SelectField label="Ad Type (f5)" value={tiresRims.adType ?? ""} options={MOBILE_BG_AD_TYPE_OPTIONS} onChangeValue={(value) => updateMobileBgField("adType", value)} placeholder="Select ad type" />
            <SelectField label="VAT Status (f43)" value={tiresRims.vatStatus ?? ""} options={MOBILE_BG_VAT_STATUS_OPTIONS} onChangeValue={(value) => updateMobileBgField("vatStatus", value)} placeholder="Select VAT status" />
            <SelectField label="Currency (f7)" value={tiresRims.currency ?? ""} options={MOBILE_BG_CURRENCY_OPTIONS} onChangeValue={(value) => updateMobileBgField("currency", value)} placeholder="Select currency" />
            <SelectField label="Condition (f8)" value={tiresRims.condition ?? ""} options={MOBILE_BG_CONDITION_OPTIONS} onChangeValue={(value) => updateMobileBgField("condition", value)} placeholder="Select condition" />
            <Field label="Quantity (f24)" value={tiresRims.quantity ?? ""} onChangeText={(value) => updateMobileBgField("quantity", value)} keyboardType="numeric" placeholder="4" />
          </View>

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Tire Info</Text>
            <SelectField label="Tire Brand (f12)" value={tiresRims.tireBrand ?? ""} options={MOBILE_BG_TIRE_BRAND_OPTIONS} onChangeValue={(value) => updateMobileBgField("tireBrand", value)} placeholder="Select tire brand" />
            <SelectField label="Width mm (f13)" value={tiresRims.tireWidthMm ?? ""} options={MOBILE_BG_WIDTH_OPTIONS} onChangeValue={(value) => updateMobileBgField("tireWidthMm", value)} placeholder="Select width" />
            <SelectField label="Height (f14)" value={tiresRims.tireHeight ?? ""} options={MOBILE_BG_HEIGHT_OPTIONS} onChangeValue={(value) => updateMobileBgField("tireHeight", value)} placeholder="Select height" />
            <SelectField label="Rim Diameter inch (f15)" value={tiresRims.rimDiameterInch ?? ""} options={MOBILE_BG_RIM_DIAMETER_OPTIONS} onChangeValue={(value) => updateMobileBgField("rimDiameterInch", value)} placeholder="Select diameter" />
            <SelectField label="Season (f18)" value={tiresRims.season ?? ""} options={MOBILE_BG_SEASON_OPTIONS} onChangeValue={(value) => updateMobileBgField("season", value)} placeholder="Select season" />
            <SelectField label="Speed Index (f20)" value={tiresRims.speedIndex ?? ""} options={MOBILE_BG_SPEED_INDEX_OPTIONS} onChangeValue={(value) => updateMobileBgField("speedIndex", value)} placeholder="Select speed index" />
            <SelectField label="Load Index (f19)" value={tiresRims.loadIndex ?? ""} options={MOBILE_BG_LOAD_INDEX_OPTIONS} onChangeValue={(value) => updateMobileBgField("loadIndex", value)} placeholder="Select load index" />
            <SelectField label="Tread Pattern (f22)" value={tiresRims.treadPattern ?? ""} options={MOBILE_BG_TREAD_PATTERN_OPTIONS} onChangeValue={(value) => updateMobileBgField("treadPattern", value)} placeholder="Select tread pattern" />
          </View>

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Rim Info</Text>
            <Field label="Car Make (f9)" value={tiresRims.carMake ?? ""} onChangeText={(value) => updateMobileBgField("carMake", value)} placeholder="Audi" />
            <Field label="Car Model (f10)" value={tiresRims.carModel ?? ""} onChangeText={(value) => updateMobileBgField("carModel", value)} placeholder="A4" />
            <Field label="Rim Brand (f11)" value={tiresRims.rimBrand ?? ""} onChangeText={(value) => updateMobileBgField("rimBrand", value)} placeholder="Audi" />
            <SelectField label="Rim Width inch (f17)" value={tiresRims.rimWidthInch ?? ""} options={MOBILE_BG_RIM_WIDTH_OPTIONS} onChangeValue={(value) => updateMobileBgField("rimWidthInch", value)} placeholder="Select rim width" />
            <SelectField label="Rim Material (f26)" value={tiresRims.rimMaterial ?? ""} options={MOBILE_BG_RIM_MATERIAL_OPTIONS} onChangeValue={(value) => updateMobileBgField("rimMaterial", value)} placeholder="Select material" />
            <SelectField label="Offset ET mm (f30)" value={tiresRims.rimOffsetEtMm ?? ""} options={MOBILE_BG_OFFSET_OPTIONS} onChangeValue={(value) => updateMobileBgField("rimOffsetEtMm", value)} placeholder="Select ET range" />
            <SelectField label="Bolts Count (f27)" value={tiresRims.boltsCount ?? ""} options={MOBILE_BG_BOLTS_COUNT_OPTIONS} onChangeValue={(value) => updateMobileBgField("boltsCount", value)} placeholder="Select bolts count" />
            <SelectField label="Bolt Spacing (f28)" value={tiresRims.boltSpacing ?? ""} options={MOBILE_BG_BOLT_SPACING_OPTIONS} onChangeValue={(value) => updateMobileBgField("boltSpacing", value)} placeholder="Select bolt spacing" />
            <Field label="Center Hole (f31)" value={tiresRims.centerHole ?? ""} onChangeText={(value) => updateMobileBgField("centerHole", value)} placeholder="10.5" />
            <SelectField label="Rim Type (f29)" value={tiresRims.rimType ?? ""} options={MOBILE_BG_RIM_TYPE_OPTIONS} onChangeValue={(value) => updateMobileBgField("rimType", value)} placeholder="Select rim type" />
          </View>

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Location</Text>
            <SelectField label="Region (f33)" value={tiresRims.region ?? ""} options={MOBILE_BG_REGION_OPTIONS} onChangeValue={(value) => updateMobileBgField("region", value)} placeholder="Select region" />
            <Field label="City (f34)" value={tiresRims.city ?? ""} onChangeText={(value) => updateMobileBgField("city", value)} placeholder="gr. Sofia" />
          </View>
        </View>
      ) : null}

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
  },
  marketplaceSection: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  targetsSection: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  sectionHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  group: {
    gap: 10,
    paddingTop: 4
  },
  groupTitle: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  targetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  targetChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.input
  },
  targetChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  targetChipText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  targetChipTextSelected: {
    color: theme.colors.primaryText
  }
});
