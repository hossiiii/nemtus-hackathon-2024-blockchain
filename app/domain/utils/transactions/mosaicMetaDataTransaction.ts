import { firstValueFrom } from 'rxjs';
import { Deadline, Address, UInt64, KeyGenerator, MosaicId } from 'symbol-sdk';

export const mosaicMetaDataTransaction = async (
  blockChain: any,
  key: string,
  value: string,
  mosaicId: MosaicId,
  targeAddress: Address,
): Promise<any> => {
  const uint64key = KeyGenerator.generateUInt64Key(key);
  const mosaicMetaDataTransaction = await firstValueFrom(
    blockChain.metaService.createMosaicMetadataTransaction(
      Deadline.create(blockChain.epochAdjustment),
      blockChain.networkType,
      targeAddress,
      mosaicId,
      uint64key,
      value,
      targeAddress,
      UInt64.fromUint(0),
    ),
  );
  return mosaicMetaDataTransaction;
};
