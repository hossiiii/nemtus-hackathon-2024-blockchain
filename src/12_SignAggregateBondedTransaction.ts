//11_Escrowでロックしたトランザクションをcosigner1で連署を行い解除する

import { firstValueFrom } from 'rxjs';
import {
  CosignatureTransaction,
  RepositoryFactoryHttp,
  TransactionGroup,
  Account,
  AggregateTransaction,
} from 'symbol-sdk';

const property = require('./Property.ts');
const cosignerKey = property.cosigner1Key;
const targetTxHash = property.targetTxHash2;
const node = 'https://sym-test-03.opening-line.jp:3001';
const repo = new RepositoryFactoryHttp(node);
const txRepo = repo.createTransactionRepository();

const main = async () => {
  const networkType = await firstValueFrom(repo.getNetworkType());
  const cosigner = Account.createFromPrivateKey(cosignerKey, networkType);

  const targetTransaction = (await firstValueFrom(
    txRepo.getTransaction(targetTxHash, TransactionGroup.Partial)
  )) as AggregateTransaction;
  const cosignatureTx = CosignatureTransaction.create(targetTransaction);
  const signedCosignatureTx =
    cosigner.signCosignatureTransaction(cosignatureTx);
  const result = await firstValueFrom(
    txRepo.announceAggregateBondedCosignature(signedCosignatureTx)
  );
  console.log(result);
};

main().then();
