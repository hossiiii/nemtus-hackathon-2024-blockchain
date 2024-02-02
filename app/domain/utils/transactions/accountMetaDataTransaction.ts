import { firstValueFrom } from 'rxjs';
import { Deadline, Address, UInt64, KeyGenerator, AccountMetadataTransaction } from 'symbol-sdk';

export const accountMetaDataTransaction = async (
  blockChain: any,
  key: string,
  value: string,
  address: Address,
): Promise<AccountMetadataTransaction> => {
  const uint64key = KeyGenerator.generateUInt64Key(key);
  const accountMetaDataTransaction:AccountMetadataTransaction = await firstValueFrom(
    blockChain.metaService.createAccountMetadataTransaction(
      Deadline.create(blockChain.epochAdjustment),
      blockChain.networkType,
      address,
      uint64key,
      value,
      address,
      UInt64.fromUint(0),
    ),
  );

  return accountMetaDataTransaction;
};
