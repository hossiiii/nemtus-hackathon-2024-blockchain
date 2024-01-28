import { KeyGenerator, MetadataType, MosaicId } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchMosaicMetaData = async (
  blockChain: any,
  key: string,
  mosaicId: MosaicId,
): Promise<string> => {
  const uint64keyToHex = KeyGenerator.generateUInt64Key(key).toHex();
  const res = (await firstValueFrom(
    blockChain.metaRepo.search({
      metadataType: MetadataType.Mosaic,
      scopedMetadataKey: uint64keyToHex,
      targetId: mosaicId,
    }),
  )) as any;
  const value = res.data[0].metadataEntry.value;
  return value;
};
