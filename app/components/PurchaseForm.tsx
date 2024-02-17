//TODO 注文確認画面の作成や注文状況確認画面への遷移を実装する
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Box, Button, TextField, Backdrop, CircularProgress } from '@mui/material';
import { initialManju, momijiAccountMetaDataKey, serviceName, serviceVersion, symbolUserAccountMetaDataKey } from '../consts/consts';
import { Account, Address, Crypto, MosaicId, PublicAccount } from 'symbol-sdk';
import { fetchAccountMetaData } from '../domain/utils/fetches/fetchAccountMetaData';
import { ProductInfo } from '../domain/entities/productInfo/productInfo';
import InputDialog from './InputDialog';
import { decryptedAccount } from '../domain/utils/accounts/decryptedAccount';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../domain/utils/fetches/fetchTransactionStatus';
import AlertsSnackbar from './AlertsSnackbar';
import { signupTransactions } from '../domain/useCases/transactions/signupTransactions';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { encryptedAccount } from '../domain/utils/accounts/encryptedAccount';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductInfo } from '../domain/useCases/fetches/fetchProductInfo';
import { fetchProductStock } from '../domain/useCases/fetches/fetchProductStock';
import { sha3_256 } from 'js-sha3';
import { secretLockTransaction } from '../domain/utils/transactions/secretLockTransaction';
import { OrderInfo } from '../domain/entities/orderInfo/orderInfo';
import { orderTransaction } from '../domain/useCases/transactions/orderTransaction';
import { PaymentInfo } from '../domain/entities/paymentInfo/paymentInfo';
import { fetchUnconfirmedTransactionStatus } from '../domain/utils/fetches/fetchUnconfirmedTransactionStatus';

type Inputs = {
  symbolPrivateKey: string;
  name: string;
  tel: string;
  address: string;
  amount: number;
  notes: string;
};

export const PurchaseForm = () => {

  const searchParams = useSearchParams()
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({});

  const { symbolBlockChain, momijiBlockChain } = useSetupBlockChain();

  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定

  const [dialogTitle, setDialogTitle] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  const [openInputDialog, setOpenInputDialog] = useState<boolean>(false); //パスワード入力ダイアログの設定

  const [symbolUserAccount, setSymbolUserAccount] = useState<Account | null>(null); //symbolのアカウント
  const [symbolUserPublicAccount, setSymbolUserPublicAccount] = useState<PublicAccount | null>(null); //symbolのアカウント

  const [symbolAccountMetaData, setSymbolAccountMetaData] = useState<string | null>(null); //momijiの暗号化アカウント

  const [inputData, setInputData] = useState<Inputs>(null); //インプットデータ

  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null); //productInfo
  const [productStockAmount, setProductStockAmount] = useState<number | null>(null)

  useEffect(() => {
    if (momijiBlockChain) {
      const func = async () => {
        const mosaicId = new MosaicId(searchParams.get('mosaicId'))
        const productInfo = await fetchProductInfo(mosaicId)
        setProductInfo(productInfo)
        const momijiSellerAddress = Address.createFromRawAddress(productInfo.ownerAddress)
        const productStock = await fetchProductStock(momijiSellerAddress, mosaicId)
        setProductStockAmount(productStock.amount)
        setProgress(false)
      };
      func();
    }
  }, [momijiBlockChain]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setProgress(true); //ローディング開始
    //注文情報の登録
    setInputData(data);
    console.log(data)

    //TODO；あとでaLiceに置き換え パブリックアカウントの作成
    const symbolUserAccount = Account.createFromPrivateKey(data.symbolPrivateKey, symbolBlockChain.networkType)
    setSymbolUserAccount(symbolUserAccount);
    localStorage.setItem(momijiAccountMetaDataKey, symbolUserAccount.publicKey); //Symbol側の公開鍵をローカルストレージに保存

    const symbolUserPublicAccount = PublicAccount.createFromPublicKey(symbolUserAccount.publicKey, symbolBlockChain.networkType);
    setSymbolUserPublicAccount(symbolUserPublicAccount);

    //アカウントのチェック    
    const symbolAccountMetaData = await fetchAccountMetaData(
      symbolBlockChain,
      symbolUserAccountMetaDataKey,
      symbolUserPublicAccount.address,
    );

    setSymbolAccountMetaData(symbolAccountMetaData);
    
    if (symbolAccountMetaData === null) {
      //未登録アカウントの場合
      setDialogTitle('購入者アカウント登録');
      setDialogMessage('購入者アカウントが未登録です。サービス利用のためパスワードを登録してください');
      setOpenInputDialog(true);
    }else{
      //TODO 登録済みアカウントの場合
      setDialogTitle('パスワード入力');
      setDialogMessage('サービス利用のための購入者用パスワードを入力してください');
      setOpenInputDialog(true);
    }
  };

  const handlePasswordInput = async (inputPassword: string | null) => {
    setOpenInputDialog(false); // ダイアログを閉じる  
    
    let momijiUserAccount: Account

    if (inputPassword) {
      //シークレットロックトランザクションの作成
      const totalPrice = inputData.amount * productInfo.price;
      const random = Crypto.randomBytes(20);
      const secretHash = sha3_256.create();
      const secret = secretHash.update(random).hex();
      const proof = random.toString('hex');
      const symbolSellerAddress = Address.createFromRawAddress(productInfo.depositAddress)
      const secretTx = secretLockTransaction(symbolBlockChain, totalPrice, secret, symbolSellerAddress);
      
      if(symbolAccountMetaData === null){
        // momijiのアカウントを作成
        momijiUserAccount = Account.generateNewAccount(momijiBlockChain.networkType);
        const response = await fetch('/api/sendManju', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetRawAddress: momijiUserAccount.address.plain(),
            amount: initialManju,
          }),
        })
        if (!response.ok) {
          setSnackbarSeverity('error');
          setSnackbarMessage('管理者から手数料分のmanjuを送れませんでした');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }
        const momijiStrSignerQR = encryptedAccount(momijiBlockChain, momijiUserAccount, inputPassword)
        const symbolAaggregateTx = await signupTransactions(momijiBlockChain, symbolBlockChain, symbolUserPublicAccount, momijiUserAccount, momijiStrSignerQR, symbolUserAccountMetaDataKey, secretTx); //アカウント登録に合わせてシークレットロックトランザクションを追加

        //TODO: aLiceの署名に置き換え
        const signedAggregateTx = symbolUserAccount.sign(
          symbolAaggregateTx,
          symbolBlockChain.generationHash,
        );

        const hash = signedAggregateTx.hash;
        await firstValueFrom(symbolBlockChain.txRepo.announce(signedAggregateTx));
        const result = await fetchUnconfirmedTransactionStatus(
          symbolBlockChain,
          hash,
          symbolUserPublicAccount.address,
        );
        if(result.code === 'Success'){
          setSnackbarSeverity('success');
          setSnackbarMessage('アカウントを登録しました。引き続き注文登録を行うのでこのままお待ちください');
          setOpenSnackbar(true);
        }else{
          setSnackbarSeverity('error');
          setSnackbarMessage('アカウント登録に失敗しました');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }
      }else{
        try {
          momijiUserAccount = decryptedAccount(momijiBlockChain, symbolAccountMetaData, inputPassword);
        } catch (error) {
          setSnackbarSeverity('error');
          setSnackbarMessage('パスワードが間違っています');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }

        //TODO: aLiceの署名に置き換え
        const signedSecretTx = symbolUserAccount.sign(secretTx,symbolBlockChain.generationHash);
        const hash = signedSecretTx.hash;
        await firstValueFrom(symbolBlockChain.txRepo.announce(signedSecretTx));
        const result = await fetchUnconfirmedTransactionStatus(
          symbolBlockChain,
          hash,
          symbolUserPublicAccount.address,
        );
        if(result.code === 'Success'){
          setSnackbarSeverity('success');
          setSnackbarMessage('資金のロックが完了しました。引き続き注文処理を行いますのでこのままお待ちください');
          setOpenSnackbar(true);
        }else{
          setSnackbarSeverity('error');
          setSnackbarMessage('資金のロックに失敗しました。');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }        
      }

      localStorage.setItem(symbolUserAccountMetaDataKey, momijiUserAccount.publicKey); //Momiji側の公開鍵をローカルストレージに保存

      await order(momijiUserAccount, secret, proof);

    }else{
      setSnackbarSeverity('error');
      setSnackbarMessage('パスワードが入力されていません');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }  
  };

  const order = async (momijiUserAccount:Account, secret:string, proof:string) => {

    //注文情報の登録
    const orderInfo : OrderInfo = {
      name: inputData.name,
      tel: inputData.tel,
      address: inputData.address,
      mosaicId: productInfo.mosaicId,
      amount: inputData.amount,
      notes: inputData.notes,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    }
    //支払い情報の登録
    const paymentInfo:PaymentInfo = {
      secret: secret,
      proof: proof,
      mosaicId: productInfo.mosaicId,
      amount: inputData.amount,  
      serviceName: serviceName,
      servieVersion: serviceVersion,
    }

    //注文トランザクションの作成-署名-アナウンス
    const orderTx = await orderTransaction(momijiBlockChain, momijiUserAccount, productInfo, paymentInfo, orderInfo);
    const orderSignedTx = momijiUserAccount.sign(orderTx, momijiBlockChain.generationHash);
    const orderSignedTxHash = orderSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(orderSignedTx));
  
    const res = await fetchTransactionStatus( //ここはサーバー側でorderTxHashから情報をフェッチするのでUnconfirmedTransactionStatusではだめ
      momijiBlockChain,
      orderSignedTxHash,
      momijiUserAccount.address,
    );

    if(!(res.code === 'Success')){
      setSnackbarSeverity('error');
      setSnackbarMessage('注文に失敗しました');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }

    //交換トランザクションを管理者側で作成-署名-アナウンス
    const response = await fetch('/api/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderTxHash: orderSignedTxHash
      }),
    })
    if (!response.ok) {
      setSnackbarSeverity('error');
      setSnackbarMessage('管理者側の交換トランザクションに失敗しました');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }else{
      const responseJson = await response.json();
      console.log(responseJson)
      if(responseJson.data.code === 'Success'){
        setSnackbarSeverity('success');
        setSnackbarMessage('注文が完了しました');
        setOpenSnackbar(true);
        setProgress(false);
      }else{
        setSnackbarSeverity('error');
        setSnackbarMessage('管理者側の交換トランザクションでブロックチェーン上の不整合が発生しました');
        setOpenSnackbar(true);
        setProgress(false);
        return      
      }
    }
  }
  
  return (
    <>
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={'bottom'}
        snackbarSeverity={snackbarSeverity}
        snackbarMessage={snackbarMessage}
      />
      <InputDialog
        openDialog={openInputDialog}
        setOpenDialog={setOpenInputDialog}
        handleAgreeClick={handlePasswordInput} // パスワード入力処理関数を渡す
        setProgress={setProgress}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />      
      {progress ? (
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
      <Box component="section" sx={{ p: 2, width: '90%', maxWidth: '500px', mx: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="秘密鍵"
              variant="outlined"
              fullWidth
              error={!!errors.symbolPrivateKey}
              helperText={errors.symbolPrivateKey?.message}
              {...register("symbolPrivateKey", { required: "Symbolの秘密鍵を入力してください" })}
            />
          </Box>
          {/* 以下、注文情報入力フィールド */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="お名前"
              variant="outlined"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name", { required: "お名前を入力して下さい" })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="電話番号"
              variant="outlined"
              fullWidth
              error={!!errors.tel}
              helperText={errors.tel?.message}
              {...register("tel", {
                required: "電話番号を入力してください",
                validate: {
                  positive: value => {
                    if (value.match(/^0[-\d]{9,12}$/)) {
                      return true;
                    } else {
                      return "無効な電話番号形式です";
                    }
                  }
                }
              })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="送り先住所"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              error={!!errors.address}
              helperText={errors.address?.message}
              {...register("address", { required: "配送先を入力して下さい" })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label={`個数（残り）${productStockAmount}個`}
              variant="outlined"
              fullWidth
              type="number"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register("amount", {
                required: "個数を入力してください",
                valueAsNumber: true,
                validate: {
                  positiveOrStockExceeded: value => {
                    const numericValue = parseFloat(value.toString());
                    if (numericValue <= 0) {
                      return "数値は0より大きくなければなりません";
                    } else if (numericValue > productStockAmount) {
                      return "在庫数を超えています";
                    }
                    return true;
                  }
                }
              })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="備考"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              error={!!errors.notes}
              helperText={errors.notes?.message}
              {...register("notes")}
            />
          </Box>
          <Box
            mt={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button type="submit" variant="contained" color="primary">
              注文情報の確認
            </Button>
          </Box>
        </form>
      </Box>
      )}
    </>
  );
};
