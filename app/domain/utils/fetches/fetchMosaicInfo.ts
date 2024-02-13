import { MosaicId, MosaicInfo } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchMosaicInfo = async (
  blockChain: any,
  mosaicId: MosaicId,
): Promise<MosaicInfo | null> => {
  const mosaicInfo: MosaicInfo = await firstValueFrom(
    blockChain.mosaicRepo.getMosaic(mosaicId),
  );
  return mosaicInfo;
};
