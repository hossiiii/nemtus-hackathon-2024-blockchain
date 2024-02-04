import { ExchangeStatus } from "../exchangeInfo/exchangeInfo";

export type ExchangeHistoryInfo = {
  status: ExchangeStatus;
  exchangeTxHash: string;
  exchangeOverview:ExchangeOverview
  expiredAt: number;
};

export type ExchangeOverview = {
  oerderPaymentTxHash: string;
  productName: string;
  amount: number;
  price: number;
  secletLockTxHash: string;
  secletLockTxSeclet: string;
  createTimestamp: string;
};

export function isExchangeOverview(obj: any): obj is ExchangeOverview {
  return obj && 
          typeof obj === 'object' && 
          'oerderPaymentTxHash' in obj &&
          'productName' in obj &&
          'amount' in obj &&
          'price' in obj &&
          'secletLockTxHash' in obj &&
          'secletLockTxSeclet' in obj &&
          'createTimestamp' in obj;
}