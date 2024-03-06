'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Grid, CircularProgress, Backdrop, Button, List, ListItem, ListItemText } from '@mui/material';
import { Address, MosaicId, PublicAccount } from 'symbol-sdk';
import { ProductInfo } from '../domain/entities/productInfo/productInfo';
import AlertsSnackbar from './AlertsSnackbar';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductInfo } from '../domain/useCases/fetches/fetchProductInfo';
import { fetchProductStock } from '../domain/useCases/fetches/fetchProductStock';
import { symbolSellerAccountMetaDataKey } from '../consts/consts';
import Loading from './Loading';

export const ProductDetail = () => {

  const searchParams = useSearchParams()
  const router = useRouter();

  const { momijiBlockChain } = useSetupBlockChain();
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [progressValue, setProgressValue] = useState<number>(100); //ローディングの設定  
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null); //productInfo
  const [productStockAmount, setProductStockAmount] = useState<number | null>(null)
  const [productStockTotal, setProductStockTotal] = useState<number | null>(null)
  const [momijiSellerPublicKey, setMomijiSellerPublicKey] = useState<string | null>(null)

  useEffect(() => {
    if (momijiBlockChain) {
      const momijiSellerPublicKey = localStorage.getItem(symbolSellerAccountMetaDataKey)
      setMomijiSellerPublicKey(momijiSellerPublicKey)
      const func = async () => {
        const mosaicId = new MosaicId(searchParams.get('mosaicId'))
        const productInfo = await fetchProductInfo(mosaicId)
        console.log(productInfo)
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
          <Loading value={progressValue} />
        </Backdrop>
      ) : (
        <Box sx={{ p: 3 }}>
          <List>
            {/* exchangeInfo */}
            <img src={productInfo?.imageUrl} alt="description" style={{ maxWidth: '500px', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
            <ListItem>
              <ListItemText primary="商品名" secondary={productInfo?.productName} />
            </ListItem>
            <ListItem>
              <ListItemText primary="販売者" secondary={productInfo?.sellerName} />
            </ListItem>
            <ListItem>
              <ListItemText primary="商品説明" secondary={
                productInfo?.description.split('\n').map((line, index, array) => (
                  <React.Fragment key={index}>
                    {line} {/* 行のテキスト */}
                    {index !== array.length - 1 && <br />} {/* 最後の行以外には改行を挿入 */}
                  </React.Fragment>
                ))
              } />
            </ListItem>
            <ListItem>
              <ListItemText primary="価格" secondary={`${productInfo?.price}xym`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="在庫" secondary={`${productStockAmount} / ${productStockTotal}`} />
            </ListItem>
            <ListItem>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {productInfo?.category.map((category, index) => (
                  <Chip key={index} label={category} variant="outlined" />
                ))}
              </Box>
            </ListItem>
          </List>
        {momijiSellerPublicKey && PublicAccount.createFromPublicKey(momijiSellerPublicKey,momijiBlockChain.networkType).address.plain() == productInfo.ownerAddress  ? //商品のownerAddressと自分のSellerアカウントが同一であれば戻るボタンを表示させる
        <>
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