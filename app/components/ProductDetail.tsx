'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid, CircularProgress, Backdrop } from '@mui/material';
import { Account, Address, MosaicId, PublicAccount } from 'symbol-sdk';
import { ProductInfo } from '../domain/entities/productInfo/productInfo';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductInfo } from '../domain/useCases/fetches/fetchProductInfo';
import { fetchMosaicInfo } from '../domain/utils/fetches/fetchMosaicInfo';
import { fetchProductStock } from '../domain/useCases/fetches/fetchProductStock';

export const ProductDetail = () => {

  const searchParams = useSearchParams()
  const router = useRouter();

  const { momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null); //productList
  const [amount, setAmount] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (momijiBlockChain) {
      const func = async () => {
        const mosaicId = new MosaicId(searchParams.get('mosaicId'))
        const productInfo = await fetchProductInfo(mosaicId)
        setProductInfo(productInfo)
        const momijiSellerAddress = Address.createFromRawAddress(productInfo.ownerAddress)
        const productStock = await fetchProductStock(momijiSellerAddress, mosaicId)
        setAmount(productStock.amount)
        setTotal(productStock.total)
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
        <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h4" component="div">
                  {productInfo?.productName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  販売者: {productInfo?.sellerName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  説明: {productInfo?.description}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  価格: {productInfo?.price}xym
                </Typography>
                <Typography variant="body2" gutterBottom>
                  在庫: {amount} / {total}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {productInfo?.category.map((category, index) => (
                    <Chip key={index} label={category} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>  
      )}
    </>
  );

};