'use client';
import { Typography } from '@mui/material';
import FlameComponent from '../components/Flame';
import { ProductList } from '../components/ProductList';

const ProductPage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h5'>登録商品リスト</Typography>
        <ProductList/>
      </FlameComponent>
    </>
  );
};

export default ProductPage;
