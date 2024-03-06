'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Backdrop, CircularProgress, Chip } from '@mui/material';
import { PublicAccount } from 'symbol-sdk';
import { ProductInfo } from '../domain/entities/productInfo/productInfo';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter } from 'next/navigation';
import { fetchSellerProductInfo } from '../domain/useCases/fetches/fetchSellerProductInfo';
import { symbolSellerAccountMetaDataKey } from '../consts/consts';
import Loading from './Loading';
import ProgressCircular from './ProgressBar';

export const ProductList = () => {
  const router = useRouter();

  const { momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [progressValue, setProgressValue] = useState<number>(100); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [productList, setProductList] = useState<ProductInfo[] | null>(null); //productList

  useEffect(() => {
    if (momijiBlockChain) {
      const momijiSellerPublicKey = localStorage.getItem(symbolSellerAccountMetaDataKey)
      if (!momijiSellerPublicKey) {
        setSnackbarSeverity('error');
        setSnackbarMessage('購入者アカウントが登録されていません。先に商品を登録し購入者アカウント登録を行なって下さい');
        setOpenSnackbar(true);
        setProgress(false);
        return
      }
      const momijiSellerPublicAccount = PublicAccount.createFromPublicKey(momijiSellerPublicKey,momijiBlockChain.networkType);
      const func = async () => {
        const productInfoList = await fetchSellerProductInfo(momijiSellerPublicAccount.address);
        setProductList(productInfoList)
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
          <Loading value={progressValue} />
        </Backdrop>
      ) : (
        <Box component="section" sx={{ p: 2 }}>
          <Grid container spacing={4}>
            {productList?.map((product, index) => (
              <Grid item key={index}>
                <Card onClick={() => router.push(`/product/detail?mosaicId=${product.mosaicId}`)} style={{ cursor: 'pointer' }}>
                <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={product.imageUrl} alt="description" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain', display: 'block' }} />
                    <Typography gutterBottom variant="h5" component="div" sx={{mt:1}}>
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      販売者: {product.sellerName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1, // 表示する行数
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      説明: {product.description}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      価格: {product.price}xym
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {product.category.map((category, index) => (
                        <Chip key={index} label={category} variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  );

};