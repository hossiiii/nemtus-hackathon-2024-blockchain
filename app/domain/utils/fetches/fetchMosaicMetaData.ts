import { KeyGenerator, MetadataType, MosaicId } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchMosaicMetaData = async (
  blockChain: any,
  key: string,
  mosaicId: MosaicId,
): Promise<string | null> => {
  const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();
  const res = (await firstValueFrom(
    blockChain.metaRepo.search({
      metadataType: MetadataType.Mosaic,
      scopedMetadataKey: uint64keyToHex,
      targetId: mosaicId,
    }),
  )) as any;
  if (!res.data || !res.data[0] || !res.data[0].metadataEntry) {
    return null;
  }
  const value = res.data[0].metadataEntry.value;
  return value;
};
