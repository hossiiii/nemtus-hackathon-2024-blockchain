import { PublicAccount } from "symbol-sdk";
import { ExchangeStatus } from "../entities/exchangeInfo/exchangeInfo";

export const determineExchangeStatus = async (
  expiredAt: number, cosignaturePublicKeys: string[], sellerPublicAccount: PublicAccount
): Promise<ExchangeStatus> => {
  let status : ExchangeStatus;
  if (expiredAt < Date.now()) {
    status = '有効期限切れ';
  }
  else if (false) { //TODOここにレシート情報を確認して、受取済みかどうかを判定する処理を書く
    status = '決済完了';
  }
  else if (cosignaturePublicKeys.length === 0){ //連署者なし
    status = '注文済み';
  }
  else if (cosignaturePublicKeys.includes(sellerPublicAccount.publicKey) && cosignaturePublicKeys.length === 1){ //sellerの連署
    status = '配送済み';
  }
  else if (cosignaturePublicKeys.length === 2){ //userとsellerの連署
    status = '受取済み';
  }else {
    status = 'エラー'; //それ以外の状態(先にユーザーが連署するなど)
  }
  return status;
};