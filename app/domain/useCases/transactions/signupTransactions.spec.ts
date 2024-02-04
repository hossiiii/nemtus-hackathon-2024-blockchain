import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, Address, AggregateTransaction, Crypto, MosaicId, PublicAccount, TransactionStatus } from 'symbol-sdk';
import { signupTransactions } from './signupTransactions';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { transferTransactionWithMosaic } from '../../utils/transactions/transferTransactionWithMosaic';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey } from '../../../consts/consts';
import { decryptedAccount } from '../../utils/accounts/decryptedAccount';
import { secretLockTransaction } from '../../utils/transactions/secretLockTransaction';
import { sha3_256 } from 'js-sha3';


describe('signupTransactions', () => {
  it('should return a new AggegateTransaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolNewAccount = Account.generateNewAccount(symbolBlockChain.networkType);
    const password = 'pass';
    const result = await signupTransactions(symbolNewAccount.publicAccount, password);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 600000); // 60 seconds

  it('should return a new AggegateTransaction with SecletLockTransactions', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolNewAccount = Account.generateNewAccount(symbolBlockChain.networkType);
    const symbolSendNewAccount = Account.generateNewAccount(symbolBlockChain.networkType);
    const password = 'pass';

    const random = Crypto.randomBytes(20);
    const hash = sha3_256.create();
    const secret = hash.update(random).hex();
    const proof = random.toString('hex');
      
    const secletTx = secretLockTransaction(symbolBlockChain, 1, secret, symbolSendNewAccount.address);
    const result = await signupTransactions(symbolNewAccount.publicAccount, password, secletTx);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 600000); // 60 seconds

  it('should throw an error if already registered', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolPublicAccount = PublicAccount.createFromPublicKey(
      'CE98705EBCAED8F6558897D0B3435A856A63B6CA8200593E3FBB33F61E86FC46',
      symbolBlockChain.networkType,
    );
    const password = 'pass';
    await expect(signupTransactions(symbolPublicAccount, password)).rejects.toThrow(
      'already registered momiji account',
    );
  }, 10000); // 10 seconds

  it('signupTransactions role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolNewAccount = Account.generateNewAccount(symbolBlockChain.networkType);
    const password = 'pass';

    //手数料入金処理(事前作業)
    const symbolTransferTx = transferTransactionWithMosaic(
      symbolBlockChain,
      1*1000000,
      new MosaicId(symbolBlockChain.currencyMosaicId),
      symbolNewAccount.address,
    );
    const symbolAdminAccount = Account.createFromPrivateKey(
      process.env.PRIVATE_KEY,
      symbolBlockChain.networkType,
    );
    const symbolSignedTransferTx = symbolAdminAccount.sign(
      symbolTransferTx,
      symbolBlockChain.generationHash,
    );
    const symbolSignedTransferTxHash = symbolSignedTransferTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedTransferTx));
    const symbolTransferTxResult = await fetchTransactionStatus(
      symbolBlockChain,
      symbolSignedTransferTxHash,
      symbolNewAccount.address,
    );
    expect(symbolTransferTxResult).toBeInstanceOf(TransactionStatus);
    expect(symbolTransferTxResult.code).toEqual('Success');
    expect(symbolTransferTxResult.group).toEqual('confirmed');

    //signupTransactions & 署名　& 送信
    const symbolAaggregateTx = await signupTransactions(symbolNewAccount.publicAccount, password);
    const signedAggregateTx = symbolNewAccount.sign(
      symbolAaggregateTx,
      symbolBlockChain.generationHash,
    );
    const hash = signedAggregateTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(signedAggregateTx));
    const result = await fetchTransactionStatus(
      symbolBlockChain,
      hash,
      symbolNewAccount.address,
    );
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');

    //暗号化されたアカウント情報を取得
    const res = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolNewAccount.address,
    );
    expect(res).toContain('ciphertext');

    //momijiのアカウント情報を復号化
    const momijiBlockChain = await setupBlockChain('momiji');
    const res2 = decryptedAccount(momijiBlockChain, res, password);
    expect(res2).toBeInstanceOf(Account);
  }, 120000); // 120 seconds

  it('signupTransactions role play with secletLockTx', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolNewAccount = Account.generateNewAccount(symbolBlockChain.networkType);
    const password = 'pass';

    //手数料入金処理(事前作業)
    const symbolTransferTx = transferTransactionWithMosaic(
      symbolBlockChain,
      10*1000000,
      new MosaicId(symbolBlockChain.currencyMosaicId),
      symbolNewAccount.address,
    );
    const adminAccount = Account.createFromPrivateKey(
      process.env.PRIVATE_KEY,
      symbolBlockChain.networkType,
    );
    const symbolSignedTransferTx = adminAccount.sign(
      symbolTransferTx,
      symbolBlockChain.generationHash,
    );
    const symbolSignedTransferTxHash = symbolSignedTransferTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedTransferTx));
    const symbolTransferTxResult = await fetchTransactionStatus(
      symbolBlockChain,
      symbolSignedTransferTxHash,
      symbolNewAccount.address,
    );
    expect(symbolTransferTxResult).toBeInstanceOf(TransactionStatus);
    expect(symbolTransferTxResult.code).toEqual('Success');
    expect(symbolTransferTxResult.group).toEqual('confirmed');

    //secletLockTx作成
    const random = Crypto.randomBytes(20);
    const secretHash = sha3_256.create();
    const secret = secretHash.update(random).hex();
    const proof = random.toString('hex');

    console.log(secret);
    console.log(proof);

    const symbolSellerAddress = Address.createFromRawAddress("TAOLQGT43Q4VYTFOWDUFHR3DY2ZAVO6NI24HBMQ")
    const secletTx = secretLockTransaction(symbolBlockChain, 1, secret, symbolSellerAddress);

    //signupTransactions & 署名　& 送信
    const symbolAaggregateTx = await signupTransactions(symbolNewAccount.publicAccount, password, secletTx);
    const signedAggregateTx = symbolNewAccount.sign(
      symbolAaggregateTx,
      symbolBlockChain.generationHash,
    );
    const hash = signedAggregateTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(signedAggregateTx));
    const result = await fetchTransactionStatus(
      symbolBlockChain,
      hash,
      symbolNewAccount.address,
    );
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');

    //暗号化されたアカウント情報を取得
    const res = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolNewAccount.address,
    );
    expect(res).toContain('ciphertext');

    //momijiのアカウント情報を復号化
    const momijiBlockChain = await setupBlockChain('momiji');
    const res2 = decryptedAccount(momijiBlockChain, res, password);
    expect(res2).toBeInstanceOf(Account);
  }, 120000); // 120 seconds

  test.skip('signupTransactions specific role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolNewAccount = Account.createFromPrivateKey("B05D3397F7A63B7437DDA11E8390E8EFDFCC90443B336DD5FD82C39266D606B4",symbolBlockChain.networkType)
    const password = 'pass';

    //手数料入金処理(事前作業)
    const symbolTransferTx = transferTransactionWithMosaic(
      symbolBlockChain,
      1*1000000,
      new MosaicId(symbolBlockChain.currencyMosaicId),
      symbolNewAccount.address,
    );
    const adminAccount = Account.createFromPrivateKey(
      process.env.PRIVATE_KEY,
      symbolBlockChain.networkType,
    );
    const symbolSignedTransferTx = adminAccount.sign(
      symbolTransferTx,
      symbolBlockChain.generationHash,
    );
    const symbolSignedTransferTxHash = symbolSignedTransferTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedTransferTx));
    const symbolTransferTxResult = await fetchTransactionStatus(
      symbolBlockChain,
      symbolSignedTransferTxHash,
      symbolNewAccount.address,
    );
    expect(symbolTransferTxResult).toBeInstanceOf(TransactionStatus);
    expect(symbolTransferTxResult.code).toEqual('Success');
    expect(symbolTransferTxResult.group).toEqual('confirmed');

    //signupTransactions & 署名　& 送信
    const symbolAaggregateTx = await signupTransactions(symbolNewAccount.publicAccount, password);
    const signedAggregateTx = symbolNewAccount.sign(
      symbolAaggregateTx,
      symbolBlockChain.generationHash,
    );
    const hash = signedAggregateTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(signedAggregateTx));
    const result = await fetchTransactionStatus(
      symbolBlockChain,
      hash,
      symbolNewAccount.address,
    );
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');

    //暗号化されたアカウント情報を取得
    const res = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolNewAccount.address,
    );
    expect(res).toContain('ciphertext');

    //momijiのアカウント情報を復号化
    const momijiBlockChain = await setupBlockChain('momiji');
    const res2 = decryptedAccount(momijiBlockChain, res, password);
    expect(res2).toBeInstanceOf(Account);
  }, 120000); // 120 seconds  
});
