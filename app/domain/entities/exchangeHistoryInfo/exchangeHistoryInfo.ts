import { ExchangeStatus } from "../exchangeInfo/exchangeStatus";
import { ExchangeOverview } from "./exchangeOverview";

export type ExchangeHistoryInfo = {
  status: ExchangeStatus;
  exchangeTxHash: string;
  exchangeOverview:ExchangeOverview
  expiredAt: number;
};