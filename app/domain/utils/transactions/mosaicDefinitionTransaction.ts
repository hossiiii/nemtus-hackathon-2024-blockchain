import {
  Deadline,
  Address,
  UInt64,
  MosaicNonce,
  MosaicDefinitionTransaction,
  MosaicId,
  MosaicFlags,
} from 'symbol-sdk';

export const mosaicDefinitionTransaction = (
  blockChain: any,
  targeAddress: Address,
): MosaicDefinitionTransaction => {
  const nonce = MosaicNonce.createRandom();
  const supplyMutable = true;
  const transferable = true;
  const restrictable = false;
  const revokable = true;
  const divibility = 0;
  const duration = UInt64.fromUint(0);

  const mosaicDefinitionTransaction: MosaicDefinitionTransaction =
    MosaicDefinitionTransaction.create(
      Deadline.create(blockChain.epochAdjustment),
      nonce,
      MosaicId.createFromNonce(nonce, targeAddress),
      MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
      divibility,
      duration,
      blockChain.networkType,
    );

  return mosaicDefinitionTransaction;
};
