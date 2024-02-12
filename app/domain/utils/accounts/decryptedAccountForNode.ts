import { Account } from 'symbol-sdk';
import { AccountQR } from '../../entities/accountQR/accountQR';

export const decryptedAccountForNode = (
  blockChain: any,
  strSignerQR: string,
  password: string,
): Account => {
  let arrQr;
  arrQr = require('symbol-qr-library').AccountQR;
  //JSONデータをQRコードに変換
  const jsonStrSignerQR = JSON.parse(strSignerQR);
  const signerQR = arrQr.fromJSON(jsonStrSignerQR, password);
  const targetAccount = Account.createFromPrivateKey(
    signerQR.accountPrivateKey,
    blockChain.networkType,
  );
  return targetAccount;
};
