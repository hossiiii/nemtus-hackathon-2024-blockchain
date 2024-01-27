import { Account } from 'symbol-sdk';

export const encryptedAccount = (
  blockChain: any,
  newAccount: Account,
  password: string,
): string => {
  const qr = require('symbol-qr-library');
  //パスフレーズでロックされたアカウント生成
  const signerQR = qr.QRCodeGenerator.createExportAccount(
    newAccount.privateKey,
    blockChain.networkType,
    blockChain.generationHash,
    password,
  );
  const jsonSignerQR = signerQR.toJSON();
  const strSignerQR = JSON.stringify(jsonSignerQR);

  return strSignerQR;
};
