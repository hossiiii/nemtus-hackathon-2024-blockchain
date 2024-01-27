import { AccountInfo, Address, PublicAccount } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchPublicAccount = async (
  blockChain: any,
  targetAddress: Address,
): Promise<PublicAccount> => {
  const accountInfo: AccountInfo = await firstValueFrom(
    blockChain.accountRepo.getAccountInfo(targetAddress),
  );
  const targetPublicKey = accountInfo.publicKey;
  if (targetPublicKey === '0000000000000000000000000000000000000000000000000000000000000000') {
    throw new Error('targetAddressの公開鍵が0000..であるためPublicAccountをfetchできません');
  }
  const targetPublicAccount = PublicAccount.createFromPublicKey(
    targetPublicKey,
    blockChain.networkType,
  );
  return targetPublicAccount;
};
