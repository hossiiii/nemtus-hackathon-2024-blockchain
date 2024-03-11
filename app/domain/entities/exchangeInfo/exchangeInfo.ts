import { OrderInfo } from "../orderInfo/orderInfo";
import { PaymentInfo } from "../paymentInfo/paymentInfo";
import { ProductInfo } from "../productInfo/productInfo";
import { ExchangeStatus } from "./exchangeStatus";

export type ExchangeInfo = {
  orderTxHash: string;
  secretLockTxHash?: string;
  status: ExchangeStatus;
  cosignaturePublicKeys: string[]; //この状態で購入状況を確認する
  orderInfo?: OrderInfo; //みれるのは販売者と購入者のみ
  paymentInfo?: PaymentInfo; //みれるのは管理者のと購入者のみ
  productInfo: ProductInfo; //全員がみれる mosaicIdから取得
  createTimestamp: string;
  expiredAt: number;
};