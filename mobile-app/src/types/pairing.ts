export type PairingQrPayload = {
  type: "pair";
  token: string;
  expiresIn: number;
  expiresAt?: number;
};

export type PairingSession = {
  pairingToken: string;
  userId: string;
  deviceName: string;
  pairedAt: string;
};
