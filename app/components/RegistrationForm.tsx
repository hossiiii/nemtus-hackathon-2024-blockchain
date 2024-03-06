'use client';

import React, { useRef, useState } from 'react';
import { useForm, Controller, SubmitHandler, set } from 'react-hook-form';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Typography, Backdrop, CircularProgress, Autocomplete } from '@mui/material';
import { categories, initialManju, momijiAccountMetaDataKey, serviceName, serviceVersion, symbolSellerAccountMetaDataKey } from '../consts/consts';
import { Account, Address, AggregateTransaction, CosignatureTransaction, Deadline, PublicAccount } from 'symbol-sdk';
import { fetchAccountMetaData } from '../domain/utils/fetches/fetchAccountMetaData';
import { ProductInfo } from '../domain/entities/productInfo/productInfo';
import InputDialog from './InputDialog';
import { decryptedAccount } from '../domain/utils/accounts/decryptedAccount';
import { registrationTransaction } from '../domain/useCases/transactions/registrationTransaction';
import { firstValueFrom } from 'rxjs';
import AlertsSnackbar from './AlertsSnackbar';
import { signupTransactions } from '../domain/useCases/transactions/signupTransactions';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { encryptedAccount } from '../domain/utils/accounts/encryptedAccount';
import { fetchUnconfirmedTransactionStatus } from '../domain/utils/fetches/fetchUnconfirmedTransactionStatus';
import Loading from './Loading';
import type { PutBlobResult } from '@vercel/blob';

type Inputs = {
  symbolPrivateKey: string;
  productName: string;
  sellerName: string;
  description: string;
  category: string[];
  imageUrl: string;
  price: number;
  amount: number;
};

export const RegistrationForm = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      category: [] // カテゴリの初期値を空の配列に設定
    }
  });

  const { symbolBlockChain, momijiBlockChain } = useSetupBlockChain();

  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [progressValue, setProgressValue] = useState<number>(100); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定

  const [dialogTitle, setDialogTitle] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  const [openInputDialog, setOpenInputDialog] = useState<boolean>(false); //パスワード入力ダイアログの設定

  const [symbolSellerAccount, setSymbolSellerAccount] = useState<Account | null>(null); //symbolのアカウント
  const [symbolSellerPublicAccount, setSymbolSellerPublicAccount] = useState<PublicAccount | null>(null); //symbolのアカウント

  const [symbolAccountMetaData, setSymbolAccountMetaData] = useState<string | null>(null); //momijiの暗号化アカウント

  const [inputData, setInputData] = useState<Inputs>(null); //インプットデータ

  const [preview, setPreview] = useState(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setProgress(true); //ローディング開始
    setProgressValue(0); //進捗

    //画像のアップロード
    if (!inputFileRef.current?.files) {
      setSnackbarSeverity('error');
      setSnackbarMessage('画像が選択されていません');
      setOpenSnackbar(true);
      return;
    }

    const file = inputFileRef.current.files[0];
    const response = await fetch(
      `/api/upload?filename=${file.name}`,
      {
        method: 'POST',
        body: file,
      },
    );
    const newBlob = (await response.json()) as PutBlobResult;
    setBlob(newBlob);

    //商品情報の登録
    setInputData(data);
    console.log(data)

    //TODO；あとでaLiceに置き換え パブリックアカウントの作成
    const symbolSellerAccount = Account.createFromPrivateKey(data.symbolPrivateKey, symbolBlockChain.networkType)
    setSymbolSellerAccount(symbolSellerAccount);
    localStorage.setItem(momijiAccountMetaDataKey, symbolSellerAccount.publicKey); //Symbol側の公開鍵をローカルストレージに保存

    const symbolSellerPublicAccount = PublicAccount.createFromPublicKey(symbolSellerAccount.publicKey, symbolBlockChain.networkType);
    setSymbolSellerPublicAccount(symbolSellerPublicAccount);

    //アカウントのチェック
    const symbolAccountMetaData = await fetchAccountMetaData(
      symbolBlockChain,
      symbolSellerAccountMetaDataKey,
      symbolSellerPublicAccount.address,
    );

    setSymbolAccountMetaData(symbolAccountMetaData);

    if (symbolAccountMetaData === null) {
      //未登録アカウントの場合
      setDialogTitle('販売アカウント登録');
      setDialogMessage('販売アカウントが未登録です。サービス利用のためパスワードを登録してください');
      setOpenInputDialog(true);
    }else{
      //TODO 登録済みアカウントの場合
      setDialogTitle('パスワード入力');
      setDialogMessage('サービス利用のための販売アカウントのパスワードを入力してください');
      setOpenInputDialog(true);
    }
  };

  const handlePasswordInput = async (inputPassword: string | null) => {
    setOpenInputDialog(false); // ダイアログを閉じる
    setProgressValue(10); //進捗

    let momijiSellerAccount: Account

    if (inputPassword) {
      if(symbolAccountMetaData === null){
        // momijiのアカウントを作成
        momijiSellerAccount = Account.generateNewAccount(momijiBlockChain.networkType);
        const response = await fetch('/api/sendManju', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetRawAddress: momijiSellerAccount.address.plain(),
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
        setProgressValue(20); //進捗
        // momijiシステムアカウントより商品用momijiアカウントへメタデータ登録
        const res = await fetch('/api/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            privateKey: momijiSellerAccount.privateKey,
          }),
        })
        if (!res.ok) {
          setSnackbarSeverity('error');
          setSnackbarMessage('メタデータの生成に失敗しました');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }

        setProgressValue(30); //進捗

        const momijiStrSignerQR = encryptedAccount(momijiBlockChain, momijiSellerAccount, inputPassword)
        const symbolAaggregateTx = await signupTransactions(momijiBlockChain, symbolBlockChain, symbolSellerPublicAccount, momijiSellerAccount, momijiStrSignerQR, symbolSellerAccountMetaDataKey);

        //TODO: aLiceの署名に置き換え
        const signedAggregateTx = symbolSellerAccount.sign(
          symbolAaggregateTx,
          symbolBlockChain.generationHash,
        );

        const hash = signedAggregateTx.hash;
        await firstValueFrom(symbolBlockChain.txRepo.announce(signedAggregateTx));
        const result = await fetchUnconfirmedTransactionStatus(
          symbolBlockChain,
          hash,
          symbolSellerAccount.address
        );
        if(result.code === 'Success'){
          setSnackbarSeverity('success');
          setSnackbarMessage('アカウントを登録しました。引き続き商品登録を行うのでこのままお待ちください');
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
          momijiSellerAccount = decryptedAccount(momijiBlockChain, symbolAccountMetaData, inputPassword);
        } catch (error) {
          setSnackbarSeverity('error');
          setSnackbarMessage('パスワードが間違っています');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }
      }

      setProgressValue(70); //進捗

      localStorage.setItem(symbolSellerAccountMetaDataKey, momijiSellerAccount.publicKey); //Momiji側の公開鍵をローカルストレージに保存

      await registrationProduct(momijiSellerAccount, symbolSellerPublicAccount.address);

    }else{
      setSnackbarSeverity('error');
      setSnackbarMessage('パスワードが入力されていません');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }  
  };

  const registrationProduct = async (momijiSellerAccount:Account, symbolSellerAddress:Address) => {
    //商品情報の登録処理
    const productInfo:ProductInfo = {
      productName: inputData.productName,
      sellerName: inputData.sellerName,
      description: inputData.description,
      category: inputData.category,
      imageUrl: blob.url,
      price: inputData.price,
      mosaicId: null,
      ownerAddress: momijiSellerAccount.address.plain(),
      depositAddress: symbolSellerAddress.plain(),
      serviceName: serviceName,
      servieVersion: serviceVersion,
    }

    const momijiAggregateTx = await registrationTransaction(momijiBlockChain, momijiSellerAccount, productInfo,inputData.amount);
    //署名　& 送信
    const momijiSignedTx = momijiSellerAccount.sign(momijiAggregateTx, momijiBlockChain.generationHash);
    const momijiHash = momijiSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedTx));
  
    setProgressValue(90); //進捗

    const result = await fetchUnconfirmedTransactionStatus(
      momijiBlockChain,
      momijiHash,
      momijiSellerAccount.address
    );

    setProgressValue(100); //進捗


    if(result.code === 'Success'){
      setSnackbarSeverity('success');
      setSnackbarMessage('商品情報の登録に成功しました。しばらくすると登録商品にリストされます');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }else{
      setSnackbarSeverity('error');
      setSnackbarMessage('商品情報の登録に失敗しました');
      setOpenSnackbar(true);
      setProgress(false);
      return
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
          <Loading value={progressValue} />
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
          {/* 以下、商品情報入力フィールド */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="商品名"
              variant="outlined"
              fullWidth
              error={!!errors.productName}
              helperText={errors.productName?.message}
              {...register("productName", { required: "商品名を入力してください" })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="販売者名"
              variant="outlined"
              fullWidth
              error={!!errors.sellerName}
              helperText={errors.sellerName?.message}
              {...register("sellerName", { required: "販売者名を入力してください" })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="商品説明"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description", { required: "商品の説明を入力してください" })}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth error={!!errors.category}>
              <Controller
                name="category"
                control={control}
                rules={{ required: "カテゴリを選択してください" }}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={categories} // 利用可能なカテゴリの配列
                    getOptionLabel={(option) => option}
                    value={field.value || []} // field.value が undefined の場合は空の配列を使用
                    onChange={(event, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="カテゴリ"
                        error={!!errors.category}
                      />
                    )}
                  />
                )}
              />
              {errors.category && <Typography color="error" variant="caption">{errors.category.message}</Typography>}
            </FormControl>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 2,
              justifyContent: 'center',
              alignContent: 'center',
              mb: 2,
            }}
          >
            <input
              type="file"
              id="contained-button-file"
              ref={inputFileRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              required
            />
            {preview && <img src={preview} alt="preview" style={{ maxWidth: '500px', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />}
            <label htmlFor="contained-button-file">
              <Button variant="contained" component="span">
                画像を選択
              </Button>
            </label>
          </Box>


          <Box sx={{ mb: 2 }}>
            <TextField
              label="価格(xym)"
              variant="outlined"
              fullWidth
              type="text" // 数値入力フィールドに小数点を含む正規表現を使用する場合、type="text" が適切かもしれません
              error={!!errors.price}
              helperText={errors.price?.message}
              {...register("price", {
                required: "価格を入力してください",
                valueAsNumber: true,
                validate: {
                  positive: value => parseFloat(value.toString()) > 0 || "価格は正の数でなければなりません",
                  maxDecimalPlaces: value => /^\d+(\.\d{1,6})?$/.test(value.toString()) || "価格は小数点以下6桁までです",
                }
              })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="在庫数"
              variant="outlined"
              fullWidth
              type="number"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register("amount", {
                required: "在庫数を入力してください",
                valueAsNumber: true,
                validate: {
                  positive: value => parseFloat(value.toString()) > 0 || "価格は正の数でなければなりません",
                }
              })}
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
              登録する
            </Button>
          </Box>          
        </form>
      </Box>
      )}
    </>
  );
};
