//TODO 注文確認画面の作成や注文状況確認画面への遷移を実装する
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, set } from 'react-hook-form';
import { Box, Button, TextField, Backdrop, CircularProgress, Dialog, DialogTitle, DialogActions, Typography, DialogContentText, DialogContent, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { initialManju, momijiAccountMetaDataKey, momijiExplorer, serviceName, serviceVersion, symbolExplorer, symbolUserAccountMetaDataKey } from '../consts/consts';
import { Account, Address, Convert, Crypto, MosaicId, PublicAccount, SignedTransaction, Transaction, TransactionMapping } from 'symbol-sdk';
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
import AlertsDialog from './AlertsDialog';
import { fetchAccountBalance } from '../domain/utils/fetches/fetchAccountBalance';
import Loading from './Loading';

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
  const [transactionsHistory, setTransactionsHistory] = useState<{message:string, url:string}[]>([])

  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [progressValue, setProgressValue] = useState<number>(100); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定

  const [dialogTitle, setDialogTitle] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  const [openInputPassDialog, setOpenInputPassDialog] = useState<boolean>(false); //パスワード入力ダイアログの設定
  const [openInputPayloadDialog, setOpenInputPayloadDialog] = useState<boolean>(false); //パスワード入力ダイアログの設定

  const [openDialog, setOpenDialog] = useState<boolean>(false); //パスワード入力ダイアログの設定
  const [openOrderDialog, setOpenOrderDialog] = useState<boolean>(false); //AlertsDialogの設定(個別)

  const [symbolUserAccount, setSymbolUserAccount] = useState<Account | null>(null); //symbolのアカウント
  const [symbolUserPublicAccount, setSymbolUserPublicAccount] = useState<PublicAccount | null>(null); //symbolのアカウント
  const [momijiUserAccount, setMomijiUserAccount] = useState<Account | null>(null); //momijiのアカウント

  const [symbolAccountMetaData, setSymbolAccountMetaData] = useState<string | null>(null); //momijiの暗号化アカウント

  const [inputData, setInputData] = useState<Inputs>(null); //インプットデータ

  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null); //productInfo
  const [productStockAmount, setProductStockAmount] = useState<number | null>(null)

  const [secret, setSecret] = useState<string | null>(null); //シークレット
  const [proof, setProof] = useState<string | null>(null); //プルーフ

  useEffect(() => {
    if (!localStorage.getItem(momijiAccountMetaDataKey)) {
      if(window.location.href.includes('pubkey')){
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const pubkey = params.get('pubkey');
        localStorage.setItem(momijiAccountMetaDataKey, pubkey);
        setSnackbarSeverity('success');
        setSnackbarMessage('公開鍵を登録しました。引き続き注文情報を入力して下さい');
        setOpenSnackbar(true);
      }else{
        setDialogTitle('公開鍵の確認');
        setDialogMessage('初回のみSymbolアカウントの公開鍵を登録する必要があります。公開鍵を登録しますか？');
        setOpenDialog(true);  
      }
    }else{
    }
  }
  , []);  

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
    setProgressValue(0); //進捗
    setInputData(data);
    console.log(data)
    setOpenOrderDialog(true);
  };

  const handleCheckAccount = async () => {
    //TODO；あとでaLiceに置き換え パブリックアカウントの作成
    // const symbolUserAccount = Account.createFromPrivateKey(inputData.symbolPrivateKey, symbolBlockChain.networkType)
    // setSymbolUserAccount(symbolUserAccount);
    // localStorage.setItem(momijiAccountMetaDataKey, symbolUserAccount.publicKey); //Symbol側の公開鍵をローカルストレージに保存
    const symbolUserPublicAccount = PublicAccount.createFromPublicKey(localStorage.getItem(momijiAccountMetaDataKey), symbolBlockChain.networkType);
    setSymbolUserPublicAccount(symbolUserPublicAccount);

    //アカウントのチェック    
    const symbolAccountMetaData = await fetchAccountMetaData(
      symbolBlockChain,
      symbolUserAccountMetaDataKey,
      symbolUserPublicAccount.address,
    );

    //アカウントの残高チェック
    const balance = await fetchAccountBalance(symbolBlockChain, symbolUserPublicAccount.address, new MosaicId(symbolBlockChain.currencyMosaicId));
    if(balance < productInfo.price * inputData.amount){
      setSnackbarSeverity('error');
      setSnackbarMessage('残高(xym)が不足しています。現在のアカウントの残高は' + balance + 'xymです');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }

    setSymbolAccountMetaData(symbolAccountMetaData);
    
    if (symbolAccountMetaData === null) {
      //未登録アカウントの場合
      setDialogTitle('購入者アカウント登録');
      setDialogMessage('購入者アカウントが未登録です。購入時のパスワードを登録してください');
      setOpenInputPassDialog(true);
    }else{
      //TODO 登録済みアカウントの場合
      setDialogTitle('パスワード入力');
      setDialogMessage('購入者用パスワードを入力してください');
      setOpenInputPassDialog(true);
    }
  };

  const handleInputPayload = async (signedPayload: string | null) => {
    const generationHash : string  = symbolBlockChain.generationHash
    const signedPayloadhash = Transaction.createTransactionHash(signedPayload, [... Convert.hexToUint8(generationHash)])
    const signed = TransactionMapping.createFromPayload(signedPayload);
    const signedAggregateTx = new SignedTransaction(signedPayload, signedPayloadhash, signed.signer?.publicKey!, signed.type, signed.networkType);

    const hash = signedAggregateTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(signedAggregateTx));
    const result = await fetchUnconfirmedTransactionStatus(
      symbolBlockChain,
      hash,
      symbolUserPublicAccount.address,
    );

    setTransactionsHistory(prevTransactions => [
      ...prevTransactions,
      {
        message: '資金のロック',
        url: `${symbolExplorer}/transactions/${hash}`
      }
    ]);     

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
    setProgressValue(40); //進捗
    await order(momijiUserAccount, secret, proof, hash);
  };

  const handleInputPassword = async (inputPassword: string | null) => {
    setOpenInputPassDialog(false); // ダイアログを閉じる  
    setProgressValue(10); //進捗
    
    let momijiUserAccount: Account

    if (inputPassword) {
      //シークレットロックトランザクションの作成
      const totalPrice = inputData.amount * productInfo.price;
      const random = Crypto.randomBytes(20);
      const secretHash = sha3_256.create();
      const secret = secretHash.update(random).hex();
      setSecret(secret);
      const proof = random.toString('hex');
      setProof(proof);
      const symbolSellerAddress = Address.createFromRawAddress(productInfo.depositAddress)
      const secretTx = secretLockTransaction(symbolBlockChain, totalPrice, secret, symbolSellerAddress);
      
      if(symbolAccountMetaData === null){
        // momijiのアカウントを作成
        momijiUserAccount = Account.generateNewAccount(momijiBlockChain.networkType);
        localStorage.setItem(symbolUserAccountMetaDataKey, momijiUserAccount.publicKey); //Momiji側の公開鍵をローカルストレージに保存
        setMomijiUserAccount(momijiUserAccount);

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

        const responseJson = await response.json();

        setTransactionsHistory(prevTransactions => [
          ...prevTransactions,
          {
            message: '手数料分の基軸通貨を送付',
            url: `${momijiExplorer}/transactions/${responseJson.data.hash}`
          }
        ]);  
        
        setProgressValue(30); //進捗
        const momijiStrSignerQR = encryptedAccount(momijiBlockChain, momijiUserAccount, inputPassword)
        const symbolAaggregateTx = await signupTransactions(momijiBlockChain, symbolBlockChain, symbolUserPublicAccount, momijiUserAccount, momijiStrSignerQR, symbolUserAccountMetaDataKey, secretTx); //アカウント登録に合わせてシークレットロックトランザクションを追加
        const payload = symbolAaggregateTx.serialize();
        
        const aliceEndPoint = `alice://sign?type=request_sign_transaction&data=${payload}`
        window.location.href = aliceEndPoint;

        //TODO: aLiceの署名に置き換え
        setDialogTitle('署名');
        setDialogMessage('Symbolアカウントで決済を行います。aLiceにて署名したペイロードを入力して下さい');
        setOpenInputPayloadDialog(true);

      }else{
        try {
          momijiUserAccount = decryptedAccount(momijiBlockChain, symbolAccountMetaData, inputPassword);
          localStorage.setItem(symbolUserAccountMetaDataKey, momijiUserAccount.publicKey); //Momiji側の公開鍵をローカルストレージに保存
          setMomijiUserAccount(momijiUserAccount);
        } catch (error) {
          setSnackbarSeverity('error');
          setSnackbarMessage('パスワードが間違っています');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }

        const payload = secretTx.serialize();
        const aliceEndPoint = `alice://sign?type=request_sign_transaction&data=${payload}`
        window.location.href = aliceEndPoint;

        //TODO: aLiceの署名に置き換え
        setDialogTitle('署名');
        setDialogMessage('Symbolアカウントで決済を行います。aLiceにて署名したペイロードを入力して下さい');
        setOpenInputPayloadDialog(true);    
      }

    }else{
      setSnackbarSeverity('error');
      setSnackbarMessage('パスワードが入力されていません');
      setOpenSnackbar(true);
      setProgress(false);
      return
    }  
  };

  const order = async (momijiUserAccount:Account, secret:string, proof:string, hash:string) => {

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
    const orderTx = await orderTransaction(momijiBlockChain, momijiUserAccount, productInfo, paymentInfo, orderInfo, hash);
    const orderSignedTx = momijiUserAccount.sign(orderTx, momijiBlockChain.generationHash);
    const orderSignedTxHash = orderSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(orderSignedTx));

    setTransactionsHistory(prevTransactions => [
      ...prevTransactions,
      {
        message: '注文トランザクションの発行',
        url: `${momijiExplorer}/transactions/${orderSignedTxHash}`
      }
    ]);  
    
    setProgressValue(50); //進捗

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
    setProgressValue(70); //進捗

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

        setTransactionsHistory(prevTransactions => [
          ...prevTransactions,
          {
            message: '取引トランザクションの発行',
            url: `${momijiExplorer}/transactions/${responseJson.data.hash}`
          }
        ]);
    
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
      <AlertsDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleAgreeClick={() => {
          const callback = `${process.env.NEXT_PUBLIC_WEB_SITE}/purchase?mosaicId=${searchParams.get('mosaicId')}`;
          console.log(callback)

          const aliceEndPoint = `alice://sign?method=post&type=request_pubkey&callback=${Convert.utf8ToHex(callback)}`
          window.location.href = aliceEndPoint;
          setOpenDialog(false);
        }}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />      
      <InputDialog
        openDialog={openInputPassDialog}
        setOpenDialog={setOpenInputPassDialog}
        handleAgreeClick={handleInputPassword} // パスワード入力処理関数を渡す
        setProgress={setProgress}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />
      <InputDialog
        openDialog={openInputPayloadDialog}
        setOpenDialog={setOpenInputPayloadDialog}
        handleAgreeClick={handleInputPayload} // 署名済みペイロード入力処理関数を渡す
        setProgress={setProgress}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />      
      <Dialog
        open={openOrderDialog}
        onClose={()=>{
          setOpenOrderDialog(false) 
          setProgress(false)
        }}
        scroll={"paper"}
      >
        <DialogTitle id="scroll-dialog-title">注文情報確認</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            tabIndex={-1}
          >
            <Typography gutterBottom>
              商品名: {productInfo?.productName}
            </Typography>
            <Typography gutterBottom>
              販売者: {productInfo?.sellerName}
            </Typography>
            <Typography gutterBottom>
              価格: {productInfo?.price} xym
            </Typography>
            <Typography gutterBottom>
              個数: {inputData?.amount}個
            </Typography>
            <Typography gutterBottom>
              お名前: {inputData?.name} 
            </Typography>
            <Typography gutterBottom>
              電話番号: {inputData?.tel}
            </Typography>
            <Typography gutterBottom>
              送り先住所: {inputData?.address}
            </Typography>
            <Typography gutterBottom>
              備考: {inputData?.notes}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                m: 2,
                gap: 1
              }}            
            >
            <Typography gutterBottom>
              合計金額
            </Typography>
            <Typography gutterBottom variant="h5">
              {productInfo?.price * inputData?.amount} 
            </Typography>
            <Typography gutterBottom>
              xym
            </Typography>
            </Box>
            <Typography gutterBottom variant="caption">
              *送金に別途手数料がかかります
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            onClick={()=>{
              setOpenOrderDialog(false)
              handleCheckAccount()
            }}
          >
            注文を確定する
          </Button>
          <Button
            onClick={()=>{
              setOpenOrderDialog(false) 
              setProgress(false)
            }}
          >
            キャンセルする
          </Button>
        </DialogActions>
      </Dialog>
      {progress ? (
        <Backdrop open={progress}>
          <Loading value={progressValue} />
        </Backdrop>
      ) : (
      <Box component="section" sx={{ p: 2, width: '90%', maxWidth: '500px', mx: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              label={`個数（残り）${productStockAmount ?? ""}個`}
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

          {transactionsHistory.length > 0 ? (
            <Box>
              <Typography variant="caption" component="div" sx={{ mt: 2 }}>
                ブロックチェーンExplorer
              </Typography>
              <List sx={{ bgcolor: 'grey.100' }}>
                {transactionsHistory.map((transaction, index) => (
                  <ListItem key={index} component="a" href={transaction.url} target="_blank" rel="noreferrer" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <ListItemIcon>
                      {transaction.url.includes("symbol")?
                      <img src="symbol_logo.png" alt="Link Icon" style={{ width: 24, height: 24 }} />
                      :
                      <img src="momiji_logo.png" alt="Link Icon" style={{ width: 24, height: 24 }} />
                      }
                    </ListItemIcon>
                    <ListItemText primary={(transaction.url.includes("symbol"))?"SYMBOLブロックチェーン":"プライベートブロックチェーン"} secondary={transaction.message} />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
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
          )}
        </form>
      </Box>
      )}
    </>
  );
};
