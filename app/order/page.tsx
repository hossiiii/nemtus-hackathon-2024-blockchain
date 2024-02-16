'use client';
import { Typography } from '@mui/material';
import FlameComponent from '../components/Flame';
import { OrderHistory } from '../components/OrderHistory';

const OrderHistoryPage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h6'>注文履歴</Typography>
        <OrderHistory/>
      </FlameComponent>
    </>
  );
};

export default OrderHistoryPage;
