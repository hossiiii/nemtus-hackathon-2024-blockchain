'use client';
import { Typography } from '@mui/material';
import FlameComponent from '../../components/Flame';
import { OrderDetail } from '../../components/OrderDetail';

const OrderDetailPage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h5'>注文詳細</Typography>
        <OrderDetail/>
      </FlameComponent>
    </>
  );
};

export default OrderDetailPage;
