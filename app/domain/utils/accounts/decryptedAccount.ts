import { Account } from 'symbol-sdk';

export const decryptedAccount = (
  blockChain: any,
  strSignerQR: string,
  password: string,
): Account => {
  let AccountQR;
  if (typeof window !== 'undefined') {
    // ブラウザ環境でのみインポート
    AccountQR = require('symbol-qr-library').AccountQR;
  } else {
    throw new Error("この機能はブラウザ環境でのみ利用可能です。");
  }

  try {
    // 文字列データをJSONデータに変換し、QRコードからアカウント情報を復号
    const jsonStrSignerQR = JSON.parse(strSignerQR);
    const signerQR = AccountQR.fromJSON(jsonStrSignerQR, password);

    // 復号されたアカウント情報からAccountオブジェクトを生成
    return Account.createFromPrivateKey(
      signerQR.accountPrivateKey,
      blockChain.networkType,
    );
  } catch (error) {
    // パスワードが間違っている場合やその他のエラーをキャッチ
    throw new Error("アカウントの復号に失敗しました。パスワードが正しいか確認してください。");
  }
};
