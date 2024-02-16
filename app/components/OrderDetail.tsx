'use client';

import React, { useEffect, useState } from 'react';
import { Box, Backdrop, CircularProgress, Button, Paper, List, ListItem, ListItemText, Stepper, Step, StepLabel } from '@mui/material';
import { Account, PublicAccount } from 'symbol-sdk';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter, useSearchParams } from 'next/navigation';
import { momijiAccountMetaDataKey, symbolSellerAccountMetaDataKey, symbolUserAccountMetaDataKey } from '../consts/consts';
import { ExchangeInfo } from '../domain/entities/exchangeInfo/exchangeInfo';
import { fetchExchangeInfo } from '../domain/useCases/fetches/fetchExchangeInfo';
import InputDialog from './InputDialog';
import { decryptedAccount } from '../domain/utils/accounts/decryptedAccount';
import { fetchAccountMetaData } from '../domain/utils/fetches/fetchAccountMetaData';
import { UserType } from '../domain/entities/userType/userType';
import { Utils } from '../domain/utils/utils';
import AlertsDialog from './AlertsDialog';
import { set } from 'react-hook-form';
import { cosignatureTransaction } from '../domain/utils/transactions/cosignatureTransaction';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../domain/utils/fetches/fetchTransactionStatus';
import { ExchangeStatus } from '../domain/entities/exchangeInfo/exchangeStatus';

type ButtonText = '発送完了報告を行う' | '発送されるのを待っています' | '受け取り確認を待っています' | '受け取り完了報告を行う' | '決済が完了するのを待っています' | '決済が完了しています' | '取引有効期限が切れています' | "確認中";

export const OrderDetail = () => {

  const steps : ExchangeStatus[] = [
    '注文済み',
    '配送済み',
    '受取済み',
    '決済完了',
  ];

  const searchParams = useSearchParams()
  const router = useRouter();

  const { symbolBlockChain, momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定

  const [dialogTitle, setDialogTitle] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [openInputDialog, setOpenInputDialog] = useState<boolean>(false); //パスワード入力ダイアログの設定
  const [openDialog, setOpenDialog] = useState<boolean>(false); //AlertsDialogの設定(個別)

  const [buttonText, setButtonText] = useState<ButtonText>("確認中"); //確認ボタンのテキスト

  const [userType, setUserType] = useState<UserType>('user')
  const [exchangeTxHash, setExchangeTxHash] = useState<string | null>(null) //取引のハッシュ
  const [momijiAccount, setMomijiAccount] = useState<Account | null>(null); //symbolのアカウント
  const [exchangeInfo, setExchangeInfo] = useState<ExchangeInfo | null>(null)
  
  useEffect(() => {
    setUserType(searchParams.get('userType') as UserType)
    setExchangeTxHash(searchParams.get('exchangeTxHash'))
    
    if (momijiBlockChain) {
      const symbolPublicKey = localStorage.getItem(momijiAccountMetaDataKey)
      if (!symbolPublicKey) {
        setSnackbarSeverity('error');
        setSnackbarMessage('アカウントが登録されていないため表示できません');
        setOpenSnackbar(true);
        setProgress(false);
        return
      }else{
        //TODO ここで取引情報を確認し、購入者か販売者かを判断する
        setDialogTitle('注文情報を確認します');
        setDialogMessage((userType == "seller") ? '販売者用パスワードを入力して下さい' : '購入者用パスワードを入力してください');  
        setOpenInputDialog(true);
      }
    }
  }
  , [momijiBlockChain]);

  const handlePasswordInput = async (inputPassword: string | null) => {
    setOpenInputDialog(false); // ダイアログを閉じる
    setProgress(true);
    
    if (inputPassword) {
      try {
        //アカウントのチェック
        const symbolPublicAccount = PublicAccount.createFromPublicKey(localStorage.getItem(momijiAccountMetaDataKey), symbolBlockChain.networkType);
        const symbolAccountMetaData = await fetchAccountMetaData(
          symbolBlockChain,
          (userType == "seller") ? symbolSellerAccountMetaDataKey : symbolUserAccountMetaDataKey,
          symbolPublicAccount.address,
        );
        const momijiAccount = decryptedAccount(momijiBlockChain, symbolAccountMetaData, inputPassword);
        setMomijiAccount(momijiAccount);

        //取引情報の取得
        const exchangeInfo = await fetchExchangeInfo(momijiBlockChain, exchangeTxHash, momijiAccount);
        setExchangeInfo(exchangeInfo);

        //ボタンテキストの設定
        switch (exchangeInfo.status) {
          case '注文済み':
            if(userType == "seller"){
              setButtonText('発送完了報告を行う');
            }else{
              setButtonText('発送されるのを待っています');
            }
            break;
          case '配送済み':
            if(userType == "seller"){
              setButtonText('受け取り確認を待っています');
            }else{
              setButtonText('受け取り完了報告を行う');
            }
            break;
          case '受取済み':
            setButtonText('決済が完了するのを待っています');
            break;
          case '決済完了':
            setButtonText('決済が完了しています');
            break;
          case '有効期限切れ':
            setButtonText('取引有効期限が切れています');
            break;
          default:
            break;
        }
        setProgress(false);

      } catch (error) {
        setSnackbarSeverity('error');
        setSnackbarMessage('パスワードが間違っています');
        setOpenSnackbar(true);
        setProgress(false);
        router.push('/order');
        return
      }

    }else{
      setSnackbarSeverity('error');
      setSnackbarMessage('パスワードが入力されていません');
      setOpenSnackbar(true);
      setProgress(false);
      router.push('/order');
      return
    }
  };

  const handleClickCosign = async () => {
    setProgress(true);
    switch (buttonText) {
      case '発送完了報告を行う':
        // 注文済みの場合の処理(連署)
        const cosignatureTx = await cosignatureTransaction(
          momijiBlockChain,
          exchangeTxHash,
        );
        
        //署名　& 送信
        const signedCosTx = momijiAccount.signCosignatureTransaction(cosignatureTx);
        await firstValueFrom(momijiBlockChain.txRepo.announceAggregateBondedCosignature(signedCosTx));
      
        const result = await fetchTransactionStatus(
          momijiBlockChain,
          exchangeTxHash,
          momijiAccount.address,
        );
      
        if(result.code == 'Success'){
          setSnackbarSeverity('success');
          setSnackbarMessage('発送完了報告が完了しました');
          setOpenSnackbar(true);
        }

        setButtonText('受け取り確認を待っています');
        
        break;
      case '受け取り完了報告を行う':
        // 配送済みの場合の処理(連署)
        const cosignatureTx2 = await cosignatureTransaction(
          momijiBlockChain,
          exchangeTxHash,
        );

        //署名　& 送信
        const signedCosTx2 = momijiAccount.signCosignatureTransaction(cosignatureTx2);
        await firstValueFrom(momijiBlockChain.txRepo.announceAggregateBondedCosignature(signedCosTx2));

        const result2 = await fetchTransactionStatus(
          momijiBlockChain,
          exchangeTxHash,
          momijiAccount.address,
        );

        if(result2.code != 'Success'){
          setSnackbarSeverity('success');
          setSnackbarMessage('受け取り完了報告が失敗しました');
          setOpenSnackbar(true);
        }

        setButtonText('決済が完了するのを待っています');

        // 管理者アカウントへのロック解除トランザクションの送信
        const response = await fetch('/api/proof', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exchangeTxHash: exchangeTxHash
          }),
        })
        if (response.ok) {
          const data = await response.json();
          if (data.data.code == 'Success') {
            setSnackbarSeverity('success');
            setSnackbarMessage('受け取りと決済が完了しました');
            setOpenSnackbar(true);
            setButtonText('決済が完了しています');
          }else{
            setSnackbarSeverity('error');
            setSnackbarMessage('管理者にてロックの解除に失敗しました');
            setOpenSnackbar(true);
          }
        }else{
          setSnackbarSeverity('error');
          setSnackbarMessage('管理者にてロックの解除に失敗しました');
          setOpenSnackbar(true);
          setProgress(false);
          return
        }
        break;
      default:
        break;
    }
    setProgress(false);
  };

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
      <AlertsDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleAgreeClick={() => {
          handleClickCosign();
          setOpenDialog(false);
        }}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />
            
      {progress ? 
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      :(exchangeInfo)?
        <>
          <Box sx={{ p: 2 }}>
            <Stepper activeStep={steps.indexOf(exchangeInfo.status)} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {
              (exchangeInfo.status == '有効期限切れ')?
              <Paper
                sx={{
                  p: 2,
                  mt: 2,
                  backgroundColor: 'error.main',
                  color: 'white',
                }}
              >
                <Box>
                  <Box>
                    <Box sx={{ fontWeight: 'bold' }}>取引有効期限が切れています</Box>
                    <Box>この取引は有効期限が切れています</Box>
                  </Box>
                </Box>
              </Paper>
              :<></>
            }
            <List>
              {/* exchangeInfo */}
              <ListItem>
                <ListItemText primary="注文ID" secondary={
                  <span style={{ wordBreak: 'break-all' }}>{exchangeTxHash}</span>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="注文日時" secondary={exchangeInfo.createTimestamp} />
              </ListItem>
              <ListItem>
                <ListItemText primary="取引期限" secondary={Utils.formatDateToYmdHms(new Date(exchangeInfo.expiredAt))} />
              </ListItem>
              <ListItem>
                <ListItemText primary="取引状況" secondary={exchangeInfo.status} />
              </ListItem>
              {/* productInfo */}
              <ListItem>
                <ListItemText primary="商品名" secondary={exchangeInfo.productInfo.productName} />
              </ListItem>
              {/* orderInfo */}
              {exchangeInfo.orderInfo && ( // orderInfoが存在する場合のみ表示
                <>
                  <ListItem>
                    <ListItemText primary="注文数" secondary={exchangeInfo.orderInfo.amount} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="購入金額" secondary={`${exchangeInfo.orderInfo.amount * exchangeInfo.productInfo.price} xym`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="購入者" secondary={exchangeInfo.orderInfo.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="購入者電話番号" secondary={exchangeInfo.orderInfo.tel} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="購入者住所" secondary={exchangeInfo.orderInfo.address} />
                  </ListItem>
                </>
              )}
            </List>
            {/* 注文状況とuseTypeに応じて確認ボタンの表示やディセーブル */}
            <Box
              mt={2}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {(buttonText == "発送完了報告を行う") ? 
                <Button
                    variant="contained"
                    color="error"
                    onClick={()=>{
                      setDialogTitle('発送確認');
                      setDialogMessage('発送完了の記録を行いますか');  
                      setOpenDialog(true);
                    }}
                  >
                    {buttonText}
                </Button>
                :(buttonText == "受け取り完了報告を行う")?
                <Button
                    variant="contained"
                    color="error"
                    onClick={()=>{
                      setDialogTitle('受け取り確認');
                      setDialogMessage('商品受け取りの記録を行いますか');  
                      setOpenDialog(true);
                    }}
                  >
                    {buttonText}
                </Button>
                :
                <></>
              } 
            </Box>          
          </Box>        
        </>
        :
        <>
        </>
      }
        <Box
          mt={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              router.push('/order')
            }}
          >
            注文一覧に戻る
          </Button>   
        </Box>        
      </>
  );
};