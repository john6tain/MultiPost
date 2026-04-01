export type PairingQrPayload = {
  type: "pair";
  sessionId: string;
  offer: {
    type: "offer";
    sdp: string;
  };
  expiresIn: number;
  expiresAt?: number;
};

export type PairingRelayQrPayload = {
  type: "pair-relay";
  sessionId: string;
  relayUrl: string;
  expiresAt?: number;
};

export type PairingQrChunkPayload = {
  type: "pair-chunk";
  sessionId: string;
  chunkIndex: number;
  totalChunks: number;
  chunk: string;
  expiresAt?: number;
  encoding?: "base64url";
};

export type PairingSession = {
  pairingToken: string;
  userId: string;
  deviceName: string;
  pairedAt: string;
  relayUrl?: string;
};

export type PairingAnswerPayload = {
  type: "pair-answer";
  sessionId: string;
  deviceName: string;
  answer: {
    type: "answer";
    sdp: string;
  };
  expiresAt?: number;
};
