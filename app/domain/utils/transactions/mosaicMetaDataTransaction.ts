import { firstValueFrom } from 'rxjs';
import { Deadline, Address, UInt64, KeyGenerator, MosaicId, MosaicMetadataTransaction } from 'symbol-sdk';

export const mosaicMetaDataTransaction = async (
  blockChain: any,
  key: string,
  value: string,
  mosaicId: MosaicId,
  address: Address,
): Promise<MosaicMetadataTransaction> => {
  const uint64key = KeyGenerator.generateUInt64Key(key);
  const mosaicMetaDataTransaction:MosaicMetadataTransaction = await firstValueFrom(
    blockChain.metaService.createMosaicMetadataTransaction(
      Deadline.create(blockChain.epochAdjustment),
      blockChain.networkType,
      address,
      mosaicId,
      uint64key,
      value,
      address,
      UInt64.fromUint(0),
    ),
  );
  return mosaicMetaDataTransaction;
};
