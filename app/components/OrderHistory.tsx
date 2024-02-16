//TODO 表形式で表示させる
'use client';

import React, { useEffect, useState } from 'react';
import {
  Backdrop,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { PublicAccount } from 'symbol-sdk';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter } from 'next/navigation';
import { fetchExchangeHistoryInfo } from '../domain/useCases/fetches/fetchExchangeHistoryInfo';
import { ExchangeHistoryInfo, ExchangeHistoryInfoFlat } from '../domain/entities/exchangeHistoryInfo/exchangeHistoryInfo';
import { symbolSellerAccountMetaDataKey, symbolUserAccountMetaDataKey } from '../consts/consts';
import OrderTable from './OrderTable';
import { Utils } from '../domain/utils/utils';

export const OrderHistory = () => {
  const router = useRouter();

  const { momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [sellerExchangeHistoryInfo, setSellerExchangeHistoryInfo] = useState<ExchangeHistoryInfo[] | null>(null)
  const [userExchangeHistoryInfo, setUserExchangeHistoryInfo] = useState<ExchangeHistoryInfo[] | null>(null)

  const [sellerExchangeHistoryInfoFlat, setSellerExchangeHistoryInfoFlat] = useState<ExchangeHistoryInfoFlat[] | null>(null)
  const [userExchangeHistoryInfoFlat, setUserExchangeHistoryInfoFlat] = useState<ExchangeHistoryInfoFlat[] | null>(null)

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
          setSellerExchangeHistoryInfoFlat(
            sellerExchangeHistoryInfo.map((info) => {
              return {
                status: info.status,
                exchangeTxHash: info.exchangeTxHash,
                orderTxHash: info.exchangeOverview.orderTxHash,
                productName: info.exchangeOverview.productName,
                amount: info.exchangeOverview.amount,
                price: info.exchangeOverview.price,
                depositAddress: info.exchangeOverview.depositAddress,
                createTimestamp: info.exchangeOverview.createTimestamp,
                expiredAt: Utils.formatDateToYmdHms(new Date(info.expiredAt))
              }
            })
          )
        }
        if (momijiUserPublicKey) {
          const momijiUserPublicAccount = PublicAccount.createFromPublicKey(momijiUserPublicKey,momijiBlockChain.networkType);
          const userExchangeHistoryInfo = await fetchExchangeHistoryInfo(momijiBlockChain, momijiUserPublicAccount.address);
          setUserExchangeHistoryInfo(userExchangeHistoryInfo)
          setUserExchangeHistoryInfoFlat(
            userExchangeHistoryInfo.map((info) => {
              return {
                status: info.status,
                exchangeTxHash: info.exchangeTxHash,
                orderTxHash: info.exchangeOverview.orderTxHash,
                productName: info.exchangeOverview.productName,
                amount: info.exchangeOverview.amount,
                price: info.exchangeOverview.price,
                depositAddress: info.exchangeOverview.depositAddress,
                createTimestamp: info.exchangeOverview.createTimestamp,
                expiredAt: Utils.formatDateToYmdHms(new Date(info.expiredAt))
              }
            })
          )
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
              <Typography variant="body1" sx={{ mb: 2 }}>販売者の取引履歴</Typography>
              <OrderTable
                exchangeHistoryInfoFlat={sellerExchangeHistoryInfoFlat}
                headerColorCode='#3874CB'
                userType='seller'
              />
            </>
            :
            <></>          
          }
          {
            userExchangeHistoryInfo ? 
            <>
              <Typography variant="body1" sx={{ mb: 2, mt: 4 }}>ユーザーの取引履歴</Typography>
              <OrderTable
                exchangeHistoryInfoFlat={userExchangeHistoryInfoFlat}
                headerColorCode='#E25C39'
                userType='user'
              />     
            </>
            :
            <></>          
          }
        </Box>

      )}
    </>
  );

};