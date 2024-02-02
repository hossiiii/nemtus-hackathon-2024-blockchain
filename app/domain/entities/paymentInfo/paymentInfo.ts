export type PaymentInfo = {
  proof: string;
  mosaicId: string;
  amount: number;
  secletLockTxHash: string;
  serviceName: string;
  servieVersion: number;
};