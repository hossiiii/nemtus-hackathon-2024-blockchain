// 用途：新規登録を行うビジネスロジック
import { 
  Account,
  AggregateTransaction,
  Deadline,
  PublicAccount,
  TransactionStatus,
} from 'symbol-sdk';
import { setupBlockChain } from '../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../utils/fetchTransactionStatus';
import { createEncryptedAccount } from '../utils/createEncryptedAccount';
import { createAccountMetaData } from '../utils/transactions/createAccountMetaData';

export const signup = async (password: string): Promise<TransactionStatus> => {
  const momijiBlockChain = await setupBlockChain("momiji");
  const symbolBlockChain = await setupBlockChain("symbol");

  // プライベートチェーンのアカウントを作成
  const momijiSignerQR = createEncryptedAccount(momijiBlockChain, password);
  const momijiJsonSignerQR = momijiSignerQR.toJSON();  
  const momijiStrSignerQR = JSON.stringify(momijiJsonSignerQR);
  
  // SymbolアカウントのアドレスをaLiceから取得(TODO　bobSymbolPublicKeyを使用、実際にはAPIで取得する)
  const symbolTargetPublicKey = "CE98705EBCAED8F6558897D0B3435A856A63B6CA8200593E3FBB33F61E86FC46"
  const symbolTargetPublicAccount = PublicAccount.createFromPublicKey(symbolTargetPublicKey, symbolBlockChain.networkType);

  // Symbolアカウントに対してパスフレーズで暗号化したアカウント情報をメタデータに記録するTxを作成
  const accountMetadataTx = await createAccountMetaData(symbolBlockChain, momijiStrSignerQR, symbolTargetPublicAccount.address);

  // アグリゲートTxを作成
  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(symbolBlockChain.epochAdjustment),
    [accountMetadataTx.toAggregate(symbolTargetPublicAccount)],
    symbolBlockChain.networkType,[]
  ).setMaxFeeForAggregate(100, 0)

  // aLiceで署名(TODO bobSymbolPrivateKeyを使用、実際にはAPIで署名データを得る)
  const symbolTargetPrivateKey = "DC8C324505DC69F18229F344C2473F69DB069F10294F7552B806BC7FAAC91377"
  const symbolTargetAccount = Account.createFromPrivateKey(symbolTargetPrivateKey, symbolBlockChain.networkType);
  const symbolSignedTx = symbolTargetAccount.sign(aggregateTx, symbolBlockChain.generationHash);

  // Symbolネットワークへのアナウンス
  const symbolHash = symbolSignedTx.hash;
  await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedTx));

  const result = await fetchTransactionStatus(symbolBlockChain, symbolHash, symbolTargetAccount.address.plain());

  return result
}