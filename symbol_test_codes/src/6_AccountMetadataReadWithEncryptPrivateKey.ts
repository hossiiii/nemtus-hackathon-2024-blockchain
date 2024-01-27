//パスフレーズで暗号化したMomojiのPrivateKeyをメタデータから読み込みMomojiアカウントの秘密鍵を復元する

import { firstValueFrom } from 'rxjs';
import { RepositoryFactoryHttp, KeyGenerator, Address } from 'symbol-sdk';

import { MomijiService, SymbolService } from './BlockchainService';

const qr = require('symbol-qr-library');

const property = require('./Property.ts');
const symbolService = new SymbolService(property);
const momijiService = new MomijiService(property);

// Symbol上のメタデータには暗号化された秘密鍵を設定する
const aliceAddress = symbolService.getAliceAddress();
const node = symbolService.getNode();
const repo = new RepositoryFactoryHttp(node);
const metaRepo = repo.createMetadataRepository();

const main = async () => {
  const alice = Address.createFromRawAddress(aliceAddress);
  const key = KeyGenerator.generateUInt64Key('momoji_account').toHex();
  const res = await firstValueFrom(
    metaRepo.search({
      scopedMetadataKey: key,
      targetAddress: alice,
      sourceAddress: alice,
    }),
  );
  const strSignerQR = res.data[0].metadataEntry.value;
  //文字列データをJSONデータに変換
  const jsonStrSignerQR = JSON.parse(strSignerQR);
  //JSONデータをQRコードに変換
  const signerQR = qr.AccountQR.fromJSON(jsonStrSignerQR, 'abc12345');
  console.log(signerQR.accountPrivateKey);
};

main().then();
