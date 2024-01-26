// 用途：注文を行うビジネスロジック
import { 
  Account,
  TransactionStatus,
} from 'symbol-sdk';
import { setupBlockChain } from '../utils/setupBlockChain';
import { transferTransactionWithEncryptMessage } from '../utils/transactions/transferTransactionWithEncryptMessage';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../utils/fetchTransactionStatus';
import { fetchPublicAccount } from '../utils/fetchPublicAccount';

export const order = async (srcPrivateKey: string, momijiTargetRowAddress: string, message: string): Promise<TransactionStatus> => { //TODO本来は秘密鍵ではなくパスワードを受け取る、命名規則も
  const blockChain = await setupBlockChain("momiji");
  const srcAccount = Account.createFromPrivateKey(srcPrivateKey, blockChain.networkType);
  const targetPublicAccount = await fetchPublicAccount(blockChain,srcPrivateKey);

  // 販売者に対して注文情報を暗号化して送信するTxを作成
  const orderTransaction = transferTransactionWithEncryptMessage(blockChain, message, srcAccount, targetPublicAccount);
  // 本来はこれに加えて、管理者に対して暗号化したプルーフと、注文情報のハッシュを送信するTxをアグリゲートトランザクションにしてアナウンスする必要がある
  const signedTransaction = srcAccount.sign(orderTransaction, blockChain.generationHash);
  const hash = signedTransaction.hash;
  await firstValueFrom(blockChain.txRepo.announce(signedTransaction));

  const result = await fetchTransactionStatus(blockChain, hash, srcAccount.address.plain());

  return result
}