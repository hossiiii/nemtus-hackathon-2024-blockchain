import { Address, KeyGenerator, MetadataType } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchAccountMetaData = async (
  blockChain: any,
  key: string,
  targetAddress: Address,
): Promise<string> => {
  const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();
  const res = (await firstValueFrom(
    blockChain.metaRepo.search({
      metadataType: MetadataType.Account,
      scopedMetadataKey: uint64keyToHex,
      targetAddress: targetAddress,
      sourceAddress: targetAddress,
    }),
  )) as any;
  if (!res.data || !res.data[0] || !res.data[0].metadataEntry) {
    throw new Error('MetadataEntry not found');
  }
  const value = res.data[0].metadataEntry.value;
  return value;
};
