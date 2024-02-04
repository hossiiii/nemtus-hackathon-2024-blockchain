export type PaymentInfo = {
  proof: string;
  mosaicId: string;
  amount: number;
  secletLockTxHash: string;
  secletLockTxSeclet: string;
  serviceName: string;
  servieVersion: number;
};