'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Grid, CircularProgress, Backdrop, Button } from '@mui/material';
import { Address, MosaicId, PublicAccount } from 'symbol-sdk';
import { ProductInfo } from '../domain/entities/productInfo/productInfo';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductInfo } from '../domain/useCases/fetches/fetchProductInfo';
import { fetchProductStock } from '../domain/useCases/fetches/fetchProductStock';

export const ProductDetail = () => {

  const searchParams = useSearchParams()
  const router = useRouter();

  const { momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null); //productInfo
  const [productStockAmount, setProductStockAmount] = useState<number | null>(null)
  const [productStockTotal, setProductStockTotal] = useState<number | null>(null)
  const [momijiSellerPublicKey, setMomijiSellerPublicKey] = useState<string | null>(null)

  useEffect(() => {
    if (momijiBlockChain) {
      const momijiSellerPublicKey = localStorage.getItem('momijiSellerPublicKey')
      setMomijiSellerPublicKey(momijiSellerPublicKey)
      const func = async () => {
        const mosaicId = new MosaicId(searchParams.get('mosaicId'))
        const productInfo = await fetchProductInfo(mosaicId)
        setProductInfo(productInfo)
        const momijiSellerAddress = Address.createFromRawAddress(productInfo.ownerAddress)
        const productStock = await fetchProductStock(momijiSellerAddress, mosaicId)
        setProductStockAmount(productStock.amount)
        setProductStockTotal(productStock.total)
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
        <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item>
            {/* 画像セクションを想定 */}
          </Grid>
          <Grid item>
            <Typography gutterBottom variant="h4" component="div">
              {productInfo?.productName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              販売者: {productInfo?.sellerName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {productInfo?.description}
            </Typography>
            <Typography variant="body2" gutterBottom>
              価格: {productInfo?.price}xym
            </Typography>
            <Typography variant="body2" gutterBottom>
              在庫: {productStockAmount} / {productStockTotal}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {productInfo?.category.map((category, index) => (
                <Chip key={index} label={category} variant="outlined" />
              ))}
            </Box>
          </Grid>
        </Grid>
        {momijiSellerPublicKey && PublicAccount.createFromPublicKey(momijiSellerPublicKey,momijiBlockChain.networkType).address.plain() == productInfo.ownerAddress  ? //商品のownerAddressと自分のSellerアカウントが同一であれば戻るボタンを表示させる
        <>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={()=>{
              router.push('/product')
            }}
          >
            商品一覧に戻る
          </Button>
        </Box>
        </>
        :
        <>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/purchase?mosaicId=${searchParams.get('mosaicId')}`)}
          >
            商品購入へ進む
          </Button>
        </Box>        
        </>
        }
      </Box>

      )}
    </>
  );

};