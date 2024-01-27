export type AccountQR = {
  type: number;
  networkType: number;
  generationHash: string;
  encrypted: boolean;
  base64: undefined;
  accountPrivateKey: string;
  password: string;
};
