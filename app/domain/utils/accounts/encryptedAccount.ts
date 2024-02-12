import { Account } from 'symbol-sdk';

export const encryptedAccount = (
  blockChain: any,
  newAccount: Account,
  password: string,
): string => {
  let QRCodeGenerator;
  if (typeof window !== 'undefined') {
    // ブラウザ環境でのみインポート
    QRCodeGenerator = require('symbol-qr-library').QRCodeGenerator;
  }
  //パスフレーズでロックされたアカウント生成
  const signerQR = QRCodeGenerator.createExportAccount(
    newAccount.privateKey,
    blockChain.networkType,
    blockChain.generationHash,
    password,
  );
  const jsonSignerQR = signerQR.toJSON();
  const strSignerQR = JSON.stringify(jsonSignerQR);

  return strSignerQR;
};
