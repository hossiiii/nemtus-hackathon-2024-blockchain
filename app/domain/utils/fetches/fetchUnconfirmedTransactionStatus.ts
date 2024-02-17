import { TransactionStatus, Address } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchUnconfirmedTransactionStatus = async (
  blockChain: any,
  hash: string,
  address: Address,
): Promise<TransactionStatus> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async function () {
      try {
        const transactionStatus: TransactionStatus = await firstValueFrom(
          blockChain.tsRepo.getTransactionStatus(hash),
        );
        console.log(transactionStatus);
        console.log(`${blockChain.explorerUrl}/transactions/${hash}`);
        if (transactionStatus.code === 'Success') {
          if (transactionStatus.group === 'confirmed' || transactionStatus.group === 'unconfirmed') {
            resolve(transactionStatus);
          } else {
            await blockChain.listener.open();
            blockChain.listener.confirmed(address, hash).subscribe(async () => {
              const transactionStatus: TransactionStatus = await firstValueFrom(
                blockChain.tsRepo.getTransactionStatus(hash),
              );
              blockChain.listener.close();
              resolve(transactionStatus);
            });
            blockChain.listener.unconfirmed(address, hash).subscribe(async () => {
              const transactionStatus: TransactionStatus = await firstValueFrom(
                blockChain.tsRepo.getTransactionStatus(hash),
              );
              blockChain.listener.close();
              resolve(transactionStatus);
            });
            blockChain.listener.aggregateBondedAdded(address, hash).subscribe(async () => {
              const transactionStatus: TransactionStatus = await firstValueFrom(
                blockChain.tsRepo.getTransactionStatus(hash),
              );
              blockChain.listener.close();
              resolve(transactionStatus);
            });
          }
        } else {
          reject(transactionStatus);
        }
      } catch (error) {
        console.error(`Error fetching transaction status: ${error}`);
        reject(error);
      }
    }, 1000); //タイマーを1秒に設定
  });
};
