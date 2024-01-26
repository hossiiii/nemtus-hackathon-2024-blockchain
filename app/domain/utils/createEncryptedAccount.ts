import { 
  Account
} from 'symbol-sdk';

export const createEncryptedAccount = (blockChain: any, password: string):any => {
  const newAccount = Account.generateNewAccount(blockChain.networkType);
  const qr = require("symbol-qr-library");
  //パスフレーズでロックされたアカウント生成
  const signerQR = qr.QRCodeGenerator.createExportAccount(
    newAccount.privateKey, blockChain.networkType, blockChain.generationHash, password
  );
  return signerQR
}