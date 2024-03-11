import { Address, BalanceChangeReceipt, PublicAccount, TransactionStatement } from "symbol-sdk";
import { fetchReceiptInfo } from "../utils/fetches/fetchReceiptInfo";
import { setupBlockChain } from "../utils/setupBlockChain";
import { ExchangeStatus } from "../entities/exchangeInfo/exchangeStatus";

export const determineExchangeStatus = async (
  expiredAt: number, cosignaturePublicKeys: string[], sellerPublicAccount: PublicAccount, depositAddress: string, proofTxHeight: string | null, totalPrice: number
): Promise<ExchangeStatus> => {
  let status : ExchangeStatus;
  if (expiredAt < Date.now() && cosignaturePublicKeys.length < 2) {
    status = '有効期限切れ';
  }
  else if (cosignaturePublicKeys.length === 0){ //連署者なし
    status = '注文済み';
  }
  else if (cosignaturePublicKeys.includes(sellerPublicAccount.publicKey) && cosignaturePublicKeys.length === 1){ //sellerの連署
    status = '発送済み';
  }
  else if (cosignaturePublicKeys.length === 2){ //userとsellerの連署
    if(proofTxHeight){ //proofTxHeightがある場合
      //レシートの検証
      const symbolBlockChain = await setupBlockChain('symbol');
      const symbolSellerAddress = Address.createFromRawAddress(depositAddress);
      const receiptInfoList = await fetchReceiptInfo(symbolBlockChain,symbolSellerAddress, Number(proofTxHeight));
      const receiptInfo: TransactionStatement = receiptInfoList[0];
      const balanceChangeReceipt = receiptInfo.receipts[0] as BalanceChangeReceipt;

      //宛先及び金額のチェック
      if(balanceChangeReceipt.targetAddress.equals(symbolSellerAddress) //宛先が正しい
        && balanceChangeReceipt.amount.compact() === totalPrice*1000000 // 数量が正しい
        && balanceChangeReceipt.mosaicId.toHex() === symbolBlockChain.currencyMosaicId) // モザイクIDが正しい
      {
        status = '決済完了'; //正しいレシートがある
      }else{
        status = 'エラー'; //レシートの内容が正しくない
      }
    }else{
      status = '受取済み';
    }
  }else {
    status = 'エラー'; //それ以外の状態(先にユーザーが連署するなど)
  }
  return status;
};