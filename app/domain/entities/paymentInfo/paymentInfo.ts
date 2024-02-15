export type PaymentInfo = {
  secret: string;
  proof: string;
  mosaicId: string;
  amount: number;
  serviceName: string;
  servieVersion: number;
};