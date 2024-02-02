import {
  TransferTransaction,
  Deadline,
  Address,
  EmptyMessage,
  Mosaic,
  UInt64,
  MosaicId,
} from 'symbol-sdk';

export const transferTransactionWithMosaic = (
  blockChain: any,
  amount: number,
  mosaicId:MosaicId,
  address: Address,
): TransferTransaction => {
  const transferTx = TransferTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    address,
    [new Mosaic(mosaicId, UInt64.fromUint(amount))],
    EmptyMessage,
    blockChain.networkType,
  ).setMaxFee(100) as TransferTransaction;
  return transferTx;
};
