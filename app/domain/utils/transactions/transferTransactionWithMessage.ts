import {
  TransferTransaction,
  Deadline,
  PlainMessage,
  Address,
} from 'symbol-sdk';

export const transferTransactionWithMessage = (
  blockChain: any,
  message: string,
  address: Address,
): TransferTransaction => {
  const transferTx = TransferTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    address,
    [],
    PlainMessage.create(message),
    blockChain.networkType,
  ).setMaxFee(100) as TransferTransaction;
  return transferTx;
};
