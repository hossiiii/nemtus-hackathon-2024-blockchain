'use client';
import { Typography } from '@mui/material';
import FlameComponent from '../../components/Flame';
import { ProductDetail } from '../../components/ProductDetail';

const ProductDetailPage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h5'>商品詳細</Typography>
        <ProductDetail/>
      </FlameComponent>
    </>
  );
};

export default ProductDetailPage;
