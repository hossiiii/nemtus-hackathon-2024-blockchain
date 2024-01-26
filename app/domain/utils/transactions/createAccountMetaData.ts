import { firstValueFrom } from 'rxjs';
import { 
  Deadline,
  Address,
  KeyGenerator,
  UInt64,
} from 'symbol-sdk';

export const createAccountMetaData = async (blockChain: any, value: string, targeAddress: Address): Promise<any> => {
  const key = KeyGenerator.generateUInt64Key("momoji_account");
  const accountMetadataTx = await firstValueFrom(blockChain.metaService.createAccountMetadataTransaction(
    Deadline.create(blockChain.epochAdjustment),
    blockChain.networkType,
    targeAddress,
    key,value,
    targeAddress,
    UInt64.fromUint(0)
  ));

  return accountMetadataTx
}