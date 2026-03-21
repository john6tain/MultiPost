import React, { useEffect, useMemo, useState } from "react";
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
import {
  MOBILE_BG_CATEGORY_SCHEMAS,
  MOBILE_BG_PRIMARY_CATEGORY_OPTIONS,
  MobileBgCategorySchema,
  MobileBgFieldDefinition
} from "../data/mobileBgSchema";
import {
  BAZAR_BG_SCHEMA_OPTIONS,
  BAZAR_BG_SCHEMAS,
  BAZAR_BG_SUBCATEGORIES_BY_TOP_LEVEL,
  BAZAR_BG_THIRD_LEVEL_BY_SUBCATEGORY,
  BAZAR_BG_TOP_LEVEL_CATEGORY_OPTIONS,
  BazarBgFieldDefinition,
  BazarBgSchema,
  getBazarBgSubcategoryLabel,
  getBazarBgThirdLevelLabel,
  getBazarBgTopLevelLabel
} from "../data/bazarBgSchema";
import { useAppState } from "../hooks/useAppState";
import { emptyListingDraft } from "../services/listingService";
import { RootStackParamList } from "../types/navigation";
import {
  BazarBgSchemaKey,
  ListingDraft,
  MobileBgPrimaryCategoryKey,
  MobileBgTiresRimsData,
  PostingTargetId
} from "../types/listing";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CreateListing">;

const POSTING_TARGETS: Array<{ id: PostingTargetId; label: string }> = [
  { id: "olx", label: "OLX" },
  { id: "mobile-bg", label: "mobile.bg" },
  { id: "bazar-bg", label: "bazar.bg" }
];
const SHARED_LISTING_FIELD_NAMES = new Set(["title", "description", "price", "salary_or_price", "location"]);

export default function CreateListingScreen({ navigation, route }: Props) {
  const { listingDrafts, saveListingDraft, deleteListingDraft } = useAppState();
  const isEditMode = route.params?.mode === "edit";
  const editingListingId = route.params?.listingId;
  const editingListing = isEditMode ? listingDrafts.find((item) => item.id === editingListingId) : undefined;
  const [draft, setDraft] = useState<ListingDraft>(editingListing ? toListingDraft(editingListing) : emptyListingDraft);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(editingListing ? toListingDraft(editingListing) : emptyListingDraft);
  }, [editingListing]);

  function updateField<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateMobileBgPrimaryCategory(value: string) {
    const primaryCategoryKey = value as MobileBgPrimaryCategoryKey;

    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        mobileBg: {
          ...current.marketplaceData?.mobileBg,
          primaryCategoryKey,
          fields: {},
          features: []
        }
      }
    }));
  }

  function updateMobileBgFormField(name: string, value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        mobileBg: {
          ...current.marketplaceData?.mobileBg,
          fields: {
            ...current.marketplaceData?.mobileBg?.fields,
            [name]: value
          }
        }
      }
    }));
  }

  function updateBazarBgSchema(value: string) {
    const schemaKey = value as BazarBgSchemaKey;

    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        bazarBg: {
          ...current.marketplaceData?.bazarBg,
          schemaKey,
          fields: {}
        }
      }
    }));
  }

  function updateBazarBgTopLevelCategory(value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        bazarBg: {
          ...current.marketplaceData?.bazarBg,
          topLevelCategoryId: value,
          topLevelCategory: getBazarBgTopLevelLabel(value),
          subcategoryId: "",
          subcategory: "",
          leafCategoryId: "",
          leafCategory: ""
        }
      }
    }));
  }

  function updateBazarBgSubcategory(value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        bazarBg: {
          ...current.marketplaceData?.bazarBg,
          subcategoryId: value,
          subcategory: getBazarBgSubcategoryLabel(current.marketplaceData?.bazarBg?.topLevelCategoryId ?? "", value),
          leafCategoryId: "",
          leafCategory: ""
        }
      }
    }));
  }

  function updateBazarBgLeafCategory(value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        bazarBg: {
          ...current.marketplaceData?.bazarBg,
          leafCategoryId: value,
          leafCategory: getBazarBgThirdLevelLabel(current.marketplaceData?.bazarBg?.subcategoryId ?? "", value)
        }
      }
    }));
  }

  function updateBazarBgField(name: string, value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        bazarBg: {
          ...current.marketplaceData?.bazarBg,
          fields: {
            ...current.marketplaceData?.bazarBg?.fields,
            [name]: value
          }
        }
      }
    }));
  }

  function toggleMobileBgFeature(name: string) {
    setDraft((current) => {
      const currentFeatures = current.marketplaceData?.mobileBg?.features ?? [];
      const features = currentFeatures.includes(name)
        ? currentFeatures.filter((item) => item !== name)
        : [...currentFeatures, name];

      return {
        ...current,
        marketplaceData: {
          ...current.marketplaceData,
          mobileBg: {
            ...current.marketplaceData?.mobileBg,
            features
          }
        }
      };
    });
  }

  function updateMobileBgTiresRimsField(key: keyof MobileBgTiresRimsData, value: string) {
    setDraft((current) => ({
      ...current,
      marketplaceData: {
        ...current.marketplaceData,
        mobileBg: {
          ...current.marketplaceData?.mobileBg,
          primaryCategoryKey: "tires-rims",
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

  const mobileBgData = draft.marketplaceData?.mobileBg;
  const tiresRims = mobileBgData?.tiresRims ?? {};
  const mobileBgFields = mobileBgData?.fields ?? {};
  const mobileBgFeatures = mobileBgData?.features ?? [];
  const showMobileBg = draft.postingTargets.includes("mobile-bg");
  const showBazarBg = draft.postingTargets.includes("bazar-bg");
  const selectedPrimaryCategory = mobileBgData?.primaryCategoryKey;
  const selectedSchema = useMemo<MobileBgCategorySchema | null>(() => {
    if (!selectedPrimaryCategory || selectedPrimaryCategory === "tires-rims") {
      return null;
    }

    return MOBILE_BG_CATEGORY_SCHEMAS[selectedPrimaryCategory] ?? null;
  }, [selectedPrimaryCategory]);
  const bazarBgData = draft.marketplaceData?.bazarBg;
  const bazarBgFields = bazarBgData?.fields ?? {};
  const bazarBgSelectedSchema = useMemo<BazarBgSchema | null>(() => {
    const schemaKey = bazarBgData?.schemaKey;

    if (!schemaKey) {
      return null;
    }

    return BAZAR_BG_SCHEMAS[schemaKey] ?? null;
  }, [bazarBgData?.schemaKey]);
  const bazarBgSubcategoryOptions = useMemo(() => {
    const topLevelCategoryId = bazarBgData?.topLevelCategoryId ?? "";
    return (BAZAR_BG_SUBCATEGORIES_BY_TOP_LEVEL[topLevelCategoryId] ?? []).map((item) => ({
      label: item.label,
      value: item.id
    }));
  }, [bazarBgData?.topLevelCategoryId]);
  const bazarBgLeafCategoryOptions = useMemo(() => {
    const subcategoryId = bazarBgData?.subcategoryId ?? "";
    return (BAZAR_BG_THIRD_LEVEL_BY_SUBCATEGORY[subcategoryId] ?? []).map((item) => ({
      label: item.label,
      value: item.id
    }));
  }, [bazarBgData?.subcategoryId]);
  const bazarBgSpecificFieldGroups = useMemo(() => {
    if (!bazarBgSelectedSchema) {
      return [];
    }

    return bazarBgSelectedSchema.fieldGroups
      .map((group) => ({
        ...group,
        fields: group.fields.filter((field) => !SHARED_LISTING_FIELD_NAMES.has(field.name))
      }))
      .filter((group) => group.fields.length > 0);
  }, [bazarBgSelectedSchema]);

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
      const savedId = await saveListingDraft(draft, editingListing?.id);
      navigation.replace("ListingPreview", { listingId: savedId });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteListing() {
    Alert.alert("Delete listing", "Delete the saved draft listing?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!editingListing?.id) {
              Alert.alert("Error", "No listing selected for delete.");
              return;
            }

            await deleteListingDraft(editingListing.id);
            setDraft(emptyListingDraft);
            navigation.navigate("Home");
          } catch {
            Alert.alert("Error", "Could not delete the saved listing.");
          }
        }
      }
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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
                <Text style={[styles.targetChipText, isSelected && styles.targetChipTextSelected]}>{target.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.marketplaceSection}>
        <Text style={styles.sectionTitle}>Listing Details</Text>
        <Text style={styles.sectionHint}>Shared listing fields used across marketplaces.</Text>
        <Field label="Title" value={draft.title} onChangeText={(value) => updateField("title", value)} placeholder="Vehicle listing" />
        <Field label="Description" value={draft.description} onChangeText={(value) => updateField("description", value)} multiline placeholder="Describe the item..." />
        <Field label="Price" value={draft.price} onChangeText={(value) => updateField("price", value)} keyboardType="numeric" placeholder="330" />
        <Field label="Category" value={draft.category} onChangeText={(value) => updateField("category", value)} placeholder="Cars" />
        <Field label="Location" value={draft.location} onChangeText={(value) => updateField("location", value)} placeholder="Sofia" />
      </View>

      {showMobileBg ? (
        <View style={styles.marketplaceSection}>
          <Text style={styles.sectionTitle}>mobile.bg</Text>
          <Text style={styles.sectionHint}>Select the primary category first. The form below uses the real `mobile.bg` field structure for the supported categories.</Text>

          <SelectField
            label="Основна категория"
            value={selectedPrimaryCategory ?? ""}
            options={MOBILE_BG_PRIMARY_CATEGORY_OPTIONS}
            onChangeValue={updateMobileBgPrimaryCategory}
            placeholder="Изберете категория"
          />

          {selectedSchema ? (
            <>
              {selectedSchema.fieldGroups.map((group) => (
                <View key={group.title} style={styles.group}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.fields.map((field) => renderMobileBgField(field, mobileBgFields[field.name] ?? "", updateMobileBgFormField))}
                </View>
              ))}

              {selectedSchema.featureGroups.map((group) => (
                <View key={group.title} style={styles.group}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <View style={styles.featureRow}>
                    {group.features.map((feature) => {
                      const isSelected = mobileBgFeatures.includes(feature.name);

                      return (
                        <Pressable
                          key={feature.name}
                          onPress={() => toggleMobileBgFeature(feature.name)}
                          style={[styles.featureChip, isSelected && styles.featureChipSelected]}
                        >
                          <Text style={[styles.featureChipText, isSelected && styles.featureChipTextSelected]}>
                            {feature.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          ) : null}

          {selectedPrimaryCategory === "tires-rims" ? (
            <>
              <View style={styles.group}>
                <Text style={styles.groupTitle}>Sale</Text>
                <SelectField label="Ad Type (f5)" value={tiresRims.adType ?? ""} options={MOBILE_BG_AD_TYPE_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("adType", value)} placeholder="Select ad type" />
                <SelectField label="VAT Status (f43)" value={tiresRims.vatStatus ?? ""} options={MOBILE_BG_VAT_STATUS_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("vatStatus", value)} placeholder="Select VAT status" />
                <SelectField label="Currency (f7)" value={tiresRims.currency ?? ""} options={MOBILE_BG_CURRENCY_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("currency", value)} placeholder="Select currency" />
                <SelectField label="Condition (f8)" value={tiresRims.condition ?? ""} options={MOBILE_BG_CONDITION_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("condition", value)} placeholder="Select condition" />
                <Field label="Quantity (f24)" value={tiresRims.quantity ?? ""} onChangeText={(value) => updateMobileBgTiresRimsField("quantity", value)} keyboardType="numeric" placeholder="4" />
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Tire Info</Text>
                <SelectField label="Tire Brand (f12)" value={tiresRims.tireBrand ?? ""} options={MOBILE_BG_TIRE_BRAND_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("tireBrand", value)} placeholder="Select tire brand" />
                <SelectField label="Width mm (f13)" value={tiresRims.tireWidthMm ?? ""} options={MOBILE_BG_WIDTH_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("tireWidthMm", value)} placeholder="Select width" />
                <SelectField label="Height (f14)" value={tiresRims.tireHeight ?? ""} options={MOBILE_BG_HEIGHT_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("tireHeight", value)} placeholder="Select height" />
                <SelectField label="Rim Diameter inch (f15)" value={tiresRims.rimDiameterInch ?? ""} options={MOBILE_BG_RIM_DIAMETER_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("rimDiameterInch", value)} placeholder="Select diameter" />
                <SelectField label="Season (f18)" value={tiresRims.season ?? ""} options={MOBILE_BG_SEASON_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("season", value)} placeholder="Select season" />
                <SelectField label="Speed Index (f20)" value={tiresRims.speedIndex ?? ""} options={MOBILE_BG_SPEED_INDEX_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("speedIndex", value)} placeholder="Select speed index" />
                <SelectField label="Load Index (f19)" value={tiresRims.loadIndex ?? ""} options={MOBILE_BG_LOAD_INDEX_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("loadIndex", value)} placeholder="Select load index" />
                <SelectField label="Tread Pattern (f22)" value={tiresRims.treadPattern ?? ""} options={MOBILE_BG_TREAD_PATTERN_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("treadPattern", value)} placeholder="Select tread pattern" />
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Rim Info</Text>
                <Field label="Car Make (f9)" value={tiresRims.carMake ?? ""} onChangeText={(value) => updateMobileBgTiresRimsField("carMake", value)} placeholder="Audi" />
                <Field label="Car Model (f10)" value={tiresRims.carModel ?? ""} onChangeText={(value) => updateMobileBgTiresRimsField("carModel", value)} placeholder="A4" />
                <Field label="Rim Brand (f11)" value={tiresRims.rimBrand ?? ""} onChangeText={(value) => updateMobileBgTiresRimsField("rimBrand", value)} placeholder="Audi" />
                <SelectField label="Rim Width inch (f17)" value={tiresRims.rimWidthInch ?? ""} options={MOBILE_BG_RIM_WIDTH_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("rimWidthInch", value)} placeholder="Select rim width" />
                <SelectField label="Rim Material (f26)" value={tiresRims.rimMaterial ?? ""} options={MOBILE_BG_RIM_MATERIAL_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("rimMaterial", value)} placeholder="Select material" />
                <SelectField label="Offset ET mm (f30)" value={tiresRims.rimOffsetEtMm ?? ""} options={MOBILE_BG_OFFSET_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("rimOffsetEtMm", value)} placeholder="Select ET range" />
                <SelectField label="Bolts Count (f27)" value={tiresRims.boltsCount ?? ""} options={MOBILE_BG_BOLTS_COUNT_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("boltsCount", value)} placeholder="Select bolts count" />
                <SelectField label="Bolt Spacing (f28)" value={tiresRims.boltSpacing ?? ""} options={MOBILE_BG_BOLT_SPACING_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("boltSpacing", value)} placeholder="Select bolt spacing" />
                <Field label="Center Hole (f31)" value={tiresRims.centerHole ?? ""} onChangeText={(value) => updateMobileBgTiresRimsField("centerHole", value)} placeholder="10.5" />
                <SelectField label="Rim Type (f29)" value={tiresRims.rimType ?? ""} options={MOBILE_BG_RIM_TYPE_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("rimType", value)} placeholder="Select rim type" />
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Location</Text>
                <SelectField label="Region (f33)" value={tiresRims.region ?? ""} options={MOBILE_BG_REGION_OPTIONS} onChangeValue={(value) => updateMobileBgTiresRimsField("region", value)} placeholder="Select region" />
                <Field label="City (f34)" value={tiresRims.city ?? ""} onChangeText={(value) => updateMobileBgTiresRimsField("city", value)} placeholder="gr. Sofia" />
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      {showBazarBg ? (
        <View style={styles.marketplaceSection}>
          <Text style={styles.sectionTitle}>bazar.bg</Text>
          <Text style={styles.sectionHint}>Shared fields (title, description, price, location) are filled from the main form above. Use this section only for bazar.bg-specific fields.</Text>

          <SelectField
            label="Top-level category"
            value={bazarBgData?.topLevelCategoryId ?? ""}
            options={BAZAR_BG_TOP_LEVEL_CATEGORY_OPTIONS}
            onChangeValue={updateBazarBgTopLevelCategory}
            placeholder="Select top-level category"
          />

          <SelectField
            label="Subcategory"
            value={bazarBgData?.subcategoryId ?? ""}
            options={bazarBgSubcategoryOptions}
            onChangeValue={updateBazarBgSubcategory}
            placeholder={bazarBgSubcategoryOptions.length ? "Select subcategory" : "No subcategories loaded"}
          />

          {bazarBgLeafCategoryOptions.length ? (
            <SelectField
              label="Leaf category"
              value={bazarBgData?.leafCategoryId ?? ""}
              options={bazarBgLeafCategoryOptions}
              onChangeValue={updateBazarBgLeafCategory}
              placeholder="Select leaf category"
            />
          ) : null}

          <SelectField
            label="Schema group"
            value={bazarBgData?.schemaKey ?? ""}
            options={BAZAR_BG_SCHEMA_OPTIONS}
            onChangeValue={updateBazarBgSchema}
            placeholder="Select schema group"
          />

          {bazarBgSelectedSchema ? (
            <>
              {bazarBgSpecificFieldGroups.map((group) => (
                <View key={group.title} style={styles.group}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.fields.map((field) => renderBazarBgField(field, bazarBgFields[field.name] ?? "", updateBazarBgField))}
                </View>
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      <PhotoPickerField images={draft.images} onPickFromLibrary={() => pickImages(false)} onTakePhoto={() => pickImages(true)} />

      {isEditMode ? (
        <View style={styles.actionsRow}>
          <View style={styles.actionHalf}>
            <PrimaryButton title="Delete Listing" onPress={handleDeleteListing} variant="danger" />
          </View>
          <View style={styles.actionHalf}>
            <PrimaryButton title={isSaving ? "Saving..." : "Save Listing"} onPress={handleSave} disabled={isSaving} />
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <PrimaryButton title={isSaving ? "Saving..." : "Save Listing"} onPress={handleSave} disabled={isSaving} />
        </View>
      )}
    </ScrollView>
  );
}

function renderBazarBgField(
  field: BazarBgFieldDefinition,
  value: string,
  onChange: (name: string, value: string) => void
) {
  if (field.type === "select" && field.options) {
    return (
      <SelectField
        key={field.name}
        label={`${field.label}${field.required ? " *" : ""}`}
        value={value}
        options={field.options}
        onChangeValue={(nextValue) => onChange(field.name, nextValue)}
        placeholder={field.placeholder ?? "Select"}
      />
    );
  }

  return (
    <Field
      key={field.name}
      label={`${field.label}${field.required ? " *" : ""}`}
      value={value}
      onChangeText={(nextValue) => onChange(field.name, nextValue)}
      keyboardType={field.type === "number" ? "numeric" : "default"}
      multiline={field.type === "textarea"}
      placeholder={field.placeholder}
    />
  );
}

function renderMobileBgField(
  field: MobileBgFieldDefinition,
  value: string,
  onChange: (name: string, value: string) => void
) {
  if (field.type === "select" && field.options) {
    return (
      <SelectField
        key={field.name}
        label={`${field.label} (${field.name})`}
        value={value}
        options={field.options}
        onChangeValue={(nextValue) => onChange(field.name, nextValue)}
        placeholder={field.placeholder ?? "Изберете"}
      />
    );
  }

  return (
    <Field
      key={field.name}
      label={`${field.label} (${field.name})`}
      value={value}
      onChangeText={(nextValue) => onChange(field.name, nextValue)}
      keyboardType={field.type === "number" ? "numeric" : "default"}
      placeholder={field.placeholder}
    />
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
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  actionHalf: {
    flex: 1
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
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  featureChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.input,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  featureChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  featureChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600"
  },
  featureChipTextSelected: {
    color: theme.colors.primaryText
  }
});

function toListingDraft(listing: { id: string; updatedAt: number } & ListingDraft): ListingDraft {
  const { id: _id, updatedAt: _updatedAt, ...draft } = listing;
  return draft;
}
