//TODO 表形式で表示させる
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Backdrop, CircularProgress, Chip } from '@mui/material';
import { PublicAccount } from 'symbol-sdk';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter } from 'next/navigation';
import { fetchExchangeHistoryInfo } from '../domain/useCases/fetches/fetchExchangeHistoryInfo';
import { ExchangeHistoryInfo } from '../domain/entities/exchangeHistoryInfo/exchangeHistoryInfo';
import { symbolSellerAccountMetaDataKey, symbolUserAccountMetaDataKey } from '../consts/consts';

export const OrderHistory = () => {
  const router = useRouter();

  const { momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [sellerExchangeHistoryInfo, setSellerExchangeHistoryInfo] = useState<ExchangeHistoryInfo[] | null>(null)
  const [userExchangeHistoryInfo, setUserExchangeHistoryInfo] = useState<ExchangeHistoryInfo[] | null>(null)

  useEffect(() => {
    if (momijiBlockChain) {
      const momijiSellerPublicKey = localStorage.getItem(symbolSellerAccountMetaDataKey)
      const momijiUserPublicKey = localStorage.getItem(symbolUserAccountMetaDataKey)
      if (!momijiSellerPublicKey && !momijiUserPublicKey) {
        setSnackbarSeverity('error');
        setSnackbarMessage('アカウントが登録されていないため表示できません');
        setOpenSnackbar(true);
        setProgress(false);
        return
      }
      const func = async () => {
        if (momijiSellerPublicKey) {
          const momijiSellerPublicAccount = PublicAccount.createFromPublicKey(momijiSellerPublicKey,momijiBlockChain.networkType);
          const sellerExchangeHistoryInfo = await fetchExchangeHistoryInfo(momijiBlockChain, momijiSellerPublicAccount.address);
          setSellerExchangeHistoryInfo(sellerExchangeHistoryInfo)
        }
        if (momijiUserPublicKey) {
          const momijiUserPublicAccount = PublicAccount.createFromPublicKey(momijiUserPublicKey,momijiBlockChain.networkType);
          const userExchangeHistoryInfo = await fetchExchangeHistoryInfo(momijiBlockChain, momijiUserPublicAccount.address);
          setUserExchangeHistoryInfo(userExchangeHistoryInfo)
        }
        setProgress(false)
      };
      func();
    }
  }
  , [momijiBlockChain]);
  
  return (
    <>
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={'bottom'}
        snackbarSeverity={snackbarSeverity}
        snackbarMessage={snackbarMessage}
      />   
      {progress ? (
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box component="section" sx={{ p: 2 }}>
          {
            sellerExchangeHistoryInfo ? 
            <>
              <Typography variant="h5" sx={{ mb: 2 }}>販売者の取引履歴</Typography>
              <Grid container spacing={4}>
                {sellerExchangeHistoryInfo?.map((info, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card onClick={() => router.push(`/order/detail?userType=seller&exchangeTxHash=${info.exchangeTxHash}`)} style={{ cursor: 'pointer' }}> {/* 販売者のフラグをつけて遷移 */}
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          取引ステータス: {info.status}
                        </Typography>
                        <Typography variant="h5" component="h2">
                          商品名: {info.exchangeOverview.productName}
                        </Typography>
                        <Typography color="textSecondary">
                          取引量: {info.exchangeOverview.amount}
                        </Typography>
                        <Typography component="p">
                          取引価格: {info.exchangeOverview.price*info.exchangeOverview.amount}xym
                        </Typography>
                        <Typography component="p">
                          作成日時: {info.exchangeOverview.createTimestamp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>            
            </>
            :
            <></>          
          }
          {
            userExchangeHistoryInfo ? 
            <>
              <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>ユーザーの取引履歴</Typography>
              <Grid container spacing={4}>
                {userExchangeHistoryInfo?.map((info, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card onClick={() => router.push(`/order/detail?userType=user&exchangeTxHash=${info.exchangeTxHash}`)} style={{ cursor: 'pointer' }}> {/* 購入者のフラグをつけて遷移 */}
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          取引ステータス: {info.status}
                        </Typography>
                        <Typography variant="h5" component="h2">
                          商品名: {info.exchangeOverview.productName}
                        </Typography>
                        <Typography color="textSecondary">
                          取引量: {info.exchangeOverview.amount}
                        </Typography>
                        <Typography component="p">
                          取引価格: {info.exchangeOverview.price*info.exchangeOverview.amount}xym
                        </Typography>
                        <Typography component="p">
                          作成日時: {info.exchangeOverview.createTimestamp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>            
            </>
            :
            <></>          
          }
        </Box>

      )}
    </>
  );

};