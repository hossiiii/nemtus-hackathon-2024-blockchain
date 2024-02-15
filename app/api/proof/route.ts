// POST ロック解除

import { NextResponse } from 'next/server';
import { Account, Address, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../domain/utils/fetches/fetchTransactionStatus';
import { fetchExchangeInfo } from '../../domain/useCases/fetches/fetchExchangeInfo';
import { secretProofTransaction } from '../../domain/utils/transactions/secretProofTransaction';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { exchangeTxHash }: { exchangeTxHash: string} = await req.json();

    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAdminPrivateKey = process.env.PRIVATE_KEY;
    const momijiAdminAccount = Account.createFromPrivateKey(
      momijiAdminPrivateKey,
      momijiBlockChain.networkType,
    );

    //取引情報の取得
    const exchangeInfo = await fetchExchangeInfo(momijiBlockChain, exchangeTxHash, momijiAdminAccount);

    const secret = exchangeInfo.paymentInfo.secret
    const proof = exchangeInfo.paymentInfo.proof
    const depositAddress = exchangeInfo.productInfo.depositAddress
    const symbolSellerAddress = Address.createFromRawAddress(depositAddress)

    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAdminPrivateKey = process.env.PRIVATE_KEY;
    const symbolAdminAccount = Account.createFromPrivateKey(
      symbolAdminPrivateKey,
      symbolBlockChain.networkType,
    );

    const proofTx = secretProofTransaction(
      symbolBlockChain,
      secret,
      proof,
      symbolSellerAddress,
    );

    const proofSignedTx = symbolAdminAccount.sign(proofTx, symbolBlockChain.generationHash);
    // Symbolネットワークへのアナウンス
    const proofSignedTxHash = proofSignedTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(proofSignedTx));

    const result: TransactionStatus = await fetchTransactionStatus(
      symbolBlockChain,
      proofSignedTxHash,
      symbolAdminAccount.address,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
