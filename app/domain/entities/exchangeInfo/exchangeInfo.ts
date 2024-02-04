import { OrderInfo } from "../orderInfo/orderInfo";
import { PaymentInfo } from "../paymentInfo/paymentInfo";
import { ProductInfo } from "../productInfo/productInfo";

export type ExchangeStatus =  '注文済み' | '配送済み' | '受取済み' | '決済完了' | '有効期限切れ' | 'エラー';

export type ExchangeInfo = {
  oerderPaymentTxHash: string;
  status: ExchangeStatus;
  cosignaturePublicKeys: string[]; //この状態で購入状況を確認する
  orderInfo?: OrderInfo; //みれるのは販売者と購入者のみ
  paymentInfo?: PaymentInfo; //みれるのは管理者のと購入者のみ
  productInfo: ProductInfo; //全員がみれる mosaicIdから取得
  secletLockTxHash: string;
  secletLockTxSeclet: string;
  createTimestamp: string;
  expiredAt: number;
};