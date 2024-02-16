import { ExchangeStatus } from "../exchangeInfo/exchangeStatus";
import { ExchangeOverview } from "./exchangeOverview";

export type ExchangeHistoryInfo = {
  status: ExchangeStatus;
  exchangeTxHash: string;
  exchangeOverview:ExchangeOverview
  expiredAt: number;
};

export type ExchangeHistoryInfoFlat = {
  status: ExchangeStatus;
  expiredAt: string;
  productName: string;
  amount: number;
  price: number;
  createTimestamp: string;  
  exchangeTxHash: string;
};

export const ExchangeHistoryInfoFlatName: Record<string, string> = {
  status: "注文状況",
  expiredAt: "取引期限",
  productName: "商品名",
  amount: "数量",
  price: "金額 (xym)",
  createTimestamp: "注文日時",  
}