import React, { useRef, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QRCode from "react-native-qrcode-svg";
import PrimaryButton from "../components/PrimaryButton";
import { useAppState } from "../hooks/useAppState";
import { t } from "../i18n";
import { createPairingAnswer, finalizePairingConnection, isWebRtcAvailable } from "../services/peerTransfer";
import { getRelaySession, updateRelaySession } from "../services/relay";
import { parsePairingQr } from "../services/qrService";
import { RootStackParamList } from "../types/navigation";
import { PairingQrChunkPayload, PairingSession } from "../types/pairing";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "QRScanner">;

type ScanEvent = {
  data: string;
};

const MAX_QR_PAYLOAD_LENGTH = 3500;

export default function QRScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [answerPayload, setAnswerPayload] = useState<string>("");
  const [pendingSession, setPendingSession] = useState<PairingSession | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [chunkProgress, setChunkProgress] = useState<string>("");
  const { language, setPairingSession } = useAppState();
  const deviceName = Platform.OS === "ios" ? "iPhone" : "Android phone";
  const canRenderAnswerQr = answerPayload.length > 0 && answerPayload.length <= MAX_QR_PAYLOAD_LENGTH;
  const chunkBufferRef = useRef<{
    sessionId: string;
    totalChunks: number;
    chunks: Array<string | null>;
    encoding?: "base64url";
  } | null>(null);

  function decodeBase64Url(value: string) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(paddingLength);
    return decodeURIComponent(escape(atob(padded)));
  }

  async function processPairPayload(rawPairPayload: string) {
    const payload = parsePairingQr(rawPairPayload);

    if (payload.type !== "pair") {
      throw new Error("Assembled QR payload is not a valid pairing payload.");
    }

    const { answerPayload, session } = await createPairingAnswer(payload, deviceName);
    setPendingSession(session);
    setAnswerPayload(answerPayload);
    setChunkProgress("");
    chunkBufferRef.current = null;
  }

  async function processRelayPayload(sessionId: string, relayUrl: string) {
    const relayPayload = await getRelaySession(relayUrl);
    const offer = relayPayload?.offer;
    const shouldUseRelayOnly = !isWebRtcAvailable()
      || !offer
      || offer.type !== "offer"
      || typeof offer.sdp !== "string"
      || !offer.sdp;

    if (shouldUseRelayOnly) {
      const session: PairingSession = {
        pairingToken: sessionId,
        userId: "local-relay",
        deviceName,
        pairedAt: new Date().toISOString(),
        relayUrl
      };

      await updateRelaySession(relayUrl, {
        ...relayPayload,
        paired: true,
        deviceName,
        pairedAt: Date.now()
      });

      await setPairingSession(session);
      Alert.alert(t(language, "qr.desktopConnectedTitle"), t(language, "qr.desktopConnectedMessage", { deviceName: session.deviceName }), [
        { text: t(language, "qr.ok"), onPress: () => navigation.navigate("Home") }
      ]);
      return;
    }

    const { answerPayload, session } = await createPairingAnswer({
      type: "pair",
      sessionId,
      offer,
      expiresIn: 180
    }, deviceName);

    await updateRelaySession(relayUrl, {
      ...relayPayload,
      answer: JSON.parse(answerPayload).answer,
      deviceName,
      answeredAt: Date.now(),
      paired: true
    });

    setPendingSession({
      ...session,
      relayUrl
    });
    setAnswerPayload("");
    setChunkProgress("Connecting to extension...");

    await finalizePairingConnection();
    await setPairingSession({
      ...session,
      relayUrl
    });

    Alert.alert(t(language, "qr.desktopConnectedTitle"), t(language, "qr.desktopConnectedMessage", { deviceName: session.deviceName }), [
      { text: t(language, "qr.ok"), onPress: () => navigation.navigate("Home") }
    ]);
  }

  async function processChunkPayload(payload: PairingQrChunkPayload) {
    const existing = chunkBufferRef.current;
    const shouldResetBuffer = !existing
      || existing.sessionId !== payload.sessionId
      || existing.totalChunks !== payload.totalChunks;

    if (shouldResetBuffer) {
      chunkBufferRef.current = {
        sessionId: payload.sessionId,
        totalChunks: payload.totalChunks,
        chunks: new Array(payload.totalChunks).fill(null),
        encoding: payload.encoding
      };
    }

    const buffer = chunkBufferRef.current;
    if (!buffer) {
      return;
    }

    if (payload.chunkIndex >= buffer.totalChunks) {
      throw new Error("QR chunk index is out of bounds.");
    }

    buffer.chunks[payload.chunkIndex] = payload.chunk;
    const receivedCount = buffer.chunks.filter(Boolean).length;
    const missingChunks = buffer.chunks
      .map((value, index) => (value ? null : index + 1))
      .filter((value): value is number => value != null);
    const missingLabel = missingChunks.length ? ` (missing ${missingChunks.join(",")})` : "";
    setChunkProgress(`Scanning pairing QR chunks: ${receivedCount}/${buffer.totalChunks}${missingLabel}`);

    if (receivedCount < buffer.totalChunks) {
      return;
    }

    const combinedPayload = buffer.chunks.join("");
    if (!combinedPayload) {
      throw new Error("Could not assemble QR chunks.");
    }

    const decodedPayload = buffer.encoding === "base64url"
      ? decodeBase64Url(combinedPayload)
      : combinedPayload;

    await processPairPayload(decodedPayload);
  }

  async function handleBarcodeScanned(result: ScanEvent) {
    if (isSubmitting || answerPayload) {
      return;
    }

    setHasScanned(true);
    setIsSubmitting(true);

    try {
      const payload = parsePairingQr(result.data);

      if (payload.type === "pair-chunk") {
        await processChunkPayload(payload);
      } else if (payload.type === "pair-relay") {
        await processRelayPayload(payload.sessionId, payload.relayUrl);
      } else {
        await processPairPayload(result.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t(language, "qr.couldNotPair");
      Alert.alert(t(language, "qr.pairingFailed"), message, [
        { text: t(language, "qr.scanAgain"), onPress: () => setHasScanned(false) }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalizeConnection() {
    if (!pendingSession) {
      return;
    }

    setIsFinalizing(true);

    try {
      await finalizePairingConnection();
      await setPairingSession(pendingSession);
      Alert.alert(t(language, "qr.desktopConnectedTitle"), t(language, "qr.desktopConnectedMessage", { deviceName: pendingSession.deviceName }), [
        { text: t(language, "qr.ok"), onPress: () => navigation.navigate("Home") }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(language, "qr.couldNotPair");
      Alert.alert(t(language, "qr.pairingFailed"), message);
    } finally {
      setIsFinalizing(false);
    }
  }

  function resetScanState() {
    setHasScanned(false);
    setAnswerPayload("");
    setPendingSession(null);
    setChunkProgress("");
    chunkBufferRef.current = null;
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
      {answerPayload ? (
        <View style={styles.answerCard}>
          <Text style={styles.answerTitle}>{canRenderAnswerQr ? "Step 2: scan this QR in extension popup" : "Step 2: use paste fallback in extension popup"}</Text>
          <Text style={styles.answerHint}>
            {canRenderAnswerQr
              ? "In extension click Scan Answer QR and point to this code. Paste fallback is still available."
              : "Answer payload is too large for a single QR on this device. Paste the payload below in extension and click Connect."}
          </Text>
          {canRenderAnswerQr ? (
            <View style={styles.answerQrWrap}>
              <QRCode value={answerPayload} size={220} />
            </View>
          ) : null}
          <ScrollView style={styles.answerBox} contentContainerStyle={styles.answerBoxContent}>
            <Text selectable style={styles.answerText}>{answerPayload}</Text>
          </ScrollView>
          <PrimaryButton title={isFinalizing ? "Waiting for extension..." : "I scanned/pasted answer and clicked Connect"} onPress={handleFinalizeConnection} disabled={isFinalizing} />
          <PrimaryButton title={t(language, "qr.scanAnother")} onPress={resetScanState} variant="secondary" />
        </View>
      ) : (
        <>
          <Text style={styles.message}>{t(language, "qr.pointCamera")}</Text>
          {chunkProgress ? <Text style={styles.chunkProgress}>{chunkProgress}</Text> : null}
          {hasScanned ? <PrimaryButton title={t(language, "qr.scanAnother")} onPress={resetScanState} variant="secondary" /> : null}
        </>
      )}
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
  chunkProgress: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontSize: 13
  },
  answerCard: {
    gap: 10
  },
  answerTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  answerHint: {
    color: theme.colors.textMuted,
    fontSize: 13
  },
  answerBox: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surface
  },
  answerQrWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  answerBoxContent: {
    padding: 10
  },
  answerText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  permissionMessage: {
    color: theme.colors.text,
    textAlign: "center",
    fontSize: 15
  }
});
