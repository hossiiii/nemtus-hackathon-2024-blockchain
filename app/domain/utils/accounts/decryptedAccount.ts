import { Account } from 'symbol-sdk';
import { AccountQR } from '../../entities/accountQR/accountQR';

export const decryptedAccount = (
  blockChain: any,
  strSignerQR: string,
  password: string,
): Account => {
  const qr = require('symbol-qr-library');
  //文字列データをJSONデータに変換
  const jsonStrSignerQR = JSON.parse(strSignerQR);
  //JSONデータをQRコードに変換
  const signerQR: AccountQR = qr.AccountQR.fromJSON(jsonStrSignerQR, password);
  const targetAccount = Account.createFromPrivateKey(
    signerQR.accountPrivateKey,
    blockChain.networkType,
  );
  return targetAccount;
};
