import { 
  Account,
  PublicAccount,
  TransferTransaction,
  Deadline,
  EncryptedMessage,
  Transaction,

} from 'symbol-sdk';

export const transferTransactionWithEncryptMessage = (blockChain: any, message: string, srcAccount: Account, targetPublicAccount: PublicAccount): Transaction => {
  const transferTx = TransferTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    targetPublicAccount.address,
    [],
    EncryptedMessage.create(message, targetPublicAccount, srcAccount.privateKey),
    blockChain.networkType
  ).setMaxFee(100); 
  return transferTx
}