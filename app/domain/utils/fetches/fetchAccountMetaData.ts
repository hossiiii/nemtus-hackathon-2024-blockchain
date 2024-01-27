import { Address, KeyGenerator } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchAccountMetaData = async (
  blockChain: any,
  key: string,
  targetAddress: Address,
): Promise<string> => {
  const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();
  const res = (await firstValueFrom(
    blockChain.metaRepo.search({
      scopedMetadataKey: uint64keyToHex,
      targetAddress: targetAddress,
      sourceAddress: targetAddress,
    }),
  )) as any;
  const value = res.data[0].metadataEntry.value;
  return value;
};
