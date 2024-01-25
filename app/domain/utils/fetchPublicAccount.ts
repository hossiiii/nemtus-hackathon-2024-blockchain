import { AccountInfo, Address, PublicAccount } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

export const fetchPublicAccount = async (blockChain: any, targetAddress: string): Promise<PublicAccount> => {
  const targetAddressAccount = Address.createFromRawAddress(targetAddress)
  const accountInfo:AccountInfo = await firstValueFrom(blockChain.accountRepo.getAccountInfo(targetAddressAccount));
  const publicKey = accountInfo.publicKey;
  if(publicKey === "0000000000000000000000000000000000000000000000000000000000000000"){
    throw new Error("targetAddressの公開鍵が0000..であるためPublicAccountをfetchできません");
  }
  const targetPublicAccount = PublicAccount.createFromPublicKey(publicKey, blockChain.networkType);
  return targetPublicAccount
}