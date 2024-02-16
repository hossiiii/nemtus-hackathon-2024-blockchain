import { TransactionStatus } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchUnconfirmedTransactionStatus = async (
  blockChain: any,
  hash: string,
): Promise<TransactionStatus> => {
  return new Promise(async (resolve, reject) => {
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
          reject(transactionStatus);
        }
      } else {
        reject(transactionStatus);
      }
    } catch (error) {
      console.error(`Error fetching transaction status: ${error}`);
      reject(error);
    }
  });
};
