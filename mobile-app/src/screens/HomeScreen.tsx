import React from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { t } from "../i18n";
import { RootStackParamList } from "../types/navigation";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { isReady, language, pairingSession, listingDrafts, setLanguage, setPairingSession } = useAppState();
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
      <View style={styles.languageSection}>
        <Text style={styles.languageLabel}>{t(language, "home.language")}</Text>
        <View style={styles.languageRow}>
          <Pressable
            onPress={() => setLanguage("en")}
            style={[styles.languageChip, language === "en" && styles.languageChipSelected]}
          >
            <Text style={[styles.languageChipText, language === "en" && styles.languageChipTextSelected]}>
              {t(language, "home.langEnglish")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLanguage("bg")}
            style={[styles.languageChip, language === "bg" && styles.languageChipSelected]}
          >
            <Text style={[styles.languageChipText, language === "bg" && styles.languageChipTextSelected]}>
              {t(language, "home.langBulgarian")}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>{t(language, "home.pairingStatus")}</Text>
        <Text style={styles.status}>
          {pairingSession
            ? t(language, "home.connectedTo", { deviceName: pairingSession.deviceName })
            : t(language, "home.notPaired")}
        </Text>
      </View>

      {!pairingSession ? (
        <PrimaryButton title={t(language, "home.scanDesktopQr")} onPress={() => navigation.navigate("QRScanner")} />
      ) : null}
      <PrimaryButton
        title={t(language, "home.createListing")}
        onPress={() => navigation.navigate("CreateListing", { mode: "new" })}
        variant="secondary"
      />
      {pairingSession ? (
        <PrimaryButton
          title={t(language, "home.disconnect")}
          onPress={async () => {
            await setPairingSession(null);
            Alert.alert(t(language, "home.disconnectedTitle"), t(language, "home.disconnectedMessage"));
          }}
          variant="danger"
        />
      ) : null}

      {hasSavedDrafts ? (
        <Text style={styles.heading}>{t(language, "home.savedListings", { count: listingDrafts.length })}</Text>
      ) : null}
      {listingDrafts.map((listing) => (
        <Pressable
          key={listing.id}
          onLongPress={() => navigation.navigate("CreateListing", { mode: "edit", listingId: listing.id })}
          onPress={() => navigation.navigate("ListingPreview", { listingId: listing.id })}
          style={[styles.card, styles.draftCard]}
        >
          <Text style={styles.heading}>{listing.title || t(language, "home.untitledListing")}</Text>
          <Text style={styles.status}>{listing.category || t(language, "home.noCategory")}</Text>
          <Text style={styles.linkText}>{t(language, "home.tapHint")}</Text>
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
  languageSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  languageLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  languageRow: {
    flexDirection: "row",
    gap: 10
  },
  languageChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.input
  },
  languageChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  languageChipText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  languageChipTextSelected: {
    color: theme.colors.primaryText
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
