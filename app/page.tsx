'use client';
import React, { useEffect, useState } from 'react';
import FlameComponent from './components/Flame';
import useSetupBlockChain from './hooks/useSetupBlockChain';
import { ProductInfo } from './domain/entities/productInfo/productInfo';
import { fetchAllProductinfo } from './domain/useCases/fetches/fetchAllProductinfo';
import { Backdrop, Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import AlertsSnackbar from './components/AlertsSnackbar';
import Loading from './components/Loading';

const Home = () => {
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

      const func = async () => {
        const productInfoList = await fetchAllProductinfo();
        setProductList(productInfoList)
        setProgress(false)
      };
      func();
    }
  }
  , [momijiBlockChain]);

  return (
    <>
      <FlameComponent children={''}></FlameComponent>
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

export default Home;
