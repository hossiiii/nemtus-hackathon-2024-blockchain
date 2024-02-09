import { Address, PublicAccount } from "symbol-sdk";
import { ExchangeStatus } from "../entities/exchangeInfo/exchangeInfo";
import { fetchReceiptInfo } from "../utils/fetches/fetchReceiptInfo";
import { setupBlockChain } from "../utils/setupBlockChain";

export const determineExchangeStatus = async (
  expiredAt: number, cosignaturePublicKeys: string[], sellerPublicAccount: PublicAccount, secletLockTxTargetAddress: string, momijiAggregateBondedTxHash: number
): Promise<ExchangeStatus> => {
  let status : ExchangeStatus;
  if (expiredAt < Date.now()) {
    status = '有効期限切れ';
  }
  else if (cosignaturePublicKeys.length === 0){ //連署者なし
    status = '注文済み';
  }
  else if (cosignaturePublicKeys.includes(sellerPublicAccount.publicKey) && cosignaturePublicKeys.length === 1){ //sellerの連署
    status = '配送済み';
  }
  else if (cosignaturePublicKeys.length === 2){ //userとsellerの連署
    //　ここでレシートの検証を行い、受取済みかどうかを判断する
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolSellerAddress = Address.createFromRawAddress(secletLockTxTargetAddress);
    const receiptInfo = await fetchReceiptInfo(symbolBlockChain,symbolSellerAddress, momijiAggregateBondedTxHash);
    if(receiptInfo.length > 0){
      status = '決済完了';
    }else {
      status = '受取済み';
    }
  }else {
    status = 'エラー'; //それ以外の状態(先にユーザーが連署するなど)
  }
  return status;
};