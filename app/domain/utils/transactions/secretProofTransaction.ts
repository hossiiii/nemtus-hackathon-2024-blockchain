import {
  Deadline,
  Address,
  LockHashAlgorithm,
  SecretProofTransaction,
} from 'symbol-sdk';

export const secretProofTransaction = (
  blockChain: any,
  secret: string, //ここで指定するsecretは、ハッシュ化されたものを指定する
  proof: string,
  address: Address,
): SecretProofTransaction => {
  const proofTx = SecretProofTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    LockHashAlgorithm.Op_Sha3_256,
    secret,
    address,
    proof,
    blockChain.networkType,
  ).setMaxFee(100) as SecretProofTransaction;
  return proofTx;
};
