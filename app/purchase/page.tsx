'use client';
import { Typography } from '@mui/material';
import FlameComponent from '../components/Flame';
import { PurchaseForm } from '../components/PurchaseForm';

const PurchasePage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h5'>注文情報の入力</Typography>
        <PurchaseForm/>
      </FlameComponent>
    </>
  );
};

export default PurchasePage;
