import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { t } from "../i18n";
import { pairExtension } from "../services/api";
import { parsePairingQr } from "../services/qrService";
import { RootStackParamList } from "../types/navigation";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "QRScanner">;

type ScanEvent = {
  data: string;
};

export default function QRScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const { language, setPairingSession } = useAppState();
  const deviceName = Platform.OS === "ios" ? "iPhone" : "Android phone";

  async function handleBarcodeScanned(result: ScanEvent) {
    if (hasScanned || isSubmitting) {
      return;
    }

    setHasScanned(true);
    setIsSubmitting(true);

    try {
      const payload = parsePairingQr(result.data);
      const session = await pairExtension(payload.token, deviceName);
      await setPairingSession(session);
      Alert.alert(t(language, "qr.desktopConnectedTitle"), t(language, "qr.desktopConnectedMessage", { deviceName: session.deviceName }), [
        { text: t(language, "qr.ok"), onPress: () => navigation.navigate("Home") }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(language, "qr.couldNotPair");
      Alert.alert(t(language, "qr.pairingFailed"), message, [
        { text: t(language, "qr.scanAgain"), onPress: () => setHasScanned(false) }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!permission) {
    return <View style={styles.centered}><Text>{t(language, "qr.checkingPermission")}</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionMessage}>{t(language, "qr.permissionMessage")}</Text>
        <PrimaryButton title={t(language, "qr.allowCamera")} onPress={() => requestPermission()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcodeScanned}
        style={styles.camera}
      />
      <Text style={styles.message}>{t(language, "qr.pointCamera")}</Text>
      {hasScanned ? <PrimaryButton title={t(language, "qr.scanAnother")} onPress={() => setHasScanned(false)} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    gap: 16
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16
  },
  camera: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden"
  },
  message: {
    color: theme.colors.text,
    textAlign: "center",
    fontSize: 15
  },
  permissionMessage: {
    color: theme.colors.text,
    textAlign: "center",
    fontSize: 15
  }
});
