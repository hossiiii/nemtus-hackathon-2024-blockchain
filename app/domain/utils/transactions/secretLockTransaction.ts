import {
  Deadline,
  Address,
  Mosaic,
  MosaicId,
  UInt64,
  SecretLockTransaction,
  LockHashAlgorithm,
} from 'symbol-sdk';
import { secletLockDuration } from '../../../consts/consts';

export const secretLockTransaction = (
  blockChain: any,
  amount: number,
  secret: string, //ここで指定するsecretは、ハッシュ化されたものを指定する
  address: Address,
): SecretLockTransaction => {
  const secletLockTx = SecretLockTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    new Mosaic(new MosaicId(blockChain.currencyMosaicId), UInt64.fromUint(amount * 1000000)),
    UInt64.fromUint(secletLockDuration),
    LockHashAlgorithm.Op_Sha3_256,
    secret,
    address,
    blockChain.networkType,
  ).setMaxFee(100) as SecretLockTransaction;

  return secletLockTx;
};
