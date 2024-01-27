import {
  Deadline,
  UInt64,
  MosaicSupplyChangeTransaction,
  UnresolvedMosaicId,
  MosaicSupplyChangeAction,
  MosaicId,
} from 'symbol-sdk';

export const mosaicSupplyChangeTransaction = (
  blockChain: any,
  amount: number,
  mosaicId: UnresolvedMosaicId | MosaicId,
): MosaicSupplyChangeTransaction => {
  const supply = UInt64.fromUint(Math.abs(amount));
  const mosaicSupplyChangeTransaction: MosaicSupplyChangeTransaction =
    MosaicSupplyChangeTransaction.create(
      Deadline.create(blockChain.epochAdjustment),
      mosaicId,
      amount > 0 ? MosaicSupplyChangeAction.Increase : MosaicSupplyChangeAction.Decrease,
      supply,
      blockChain.networkType,
    );
  return mosaicSupplyChangeTransaction;
};
