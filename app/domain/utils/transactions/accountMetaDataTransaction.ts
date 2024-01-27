import { firstValueFrom } from 'rxjs';
import { Deadline, Address, UInt64, KeyGenerator } from 'symbol-sdk';

export const accountMetaDataTransaction = async (
  blockChain: any,
  key: string,
  value: string,
  targeAddress: Address,
): Promise<any> => {
  const uint64key = KeyGenerator.generateUInt64Key(key);
  const accountMetaDataTransaction = await firstValueFrom(
    blockChain.metaService.createAccountMetadataTransaction(
      Deadline.create(blockChain.epochAdjustment),
      blockChain.networkType,
      targeAddress,
      uint64key,
      value,
      targeAddress,
      UInt64.fromUint(0),
    ),
  );

  return accountMetaDataTransaction;
};
