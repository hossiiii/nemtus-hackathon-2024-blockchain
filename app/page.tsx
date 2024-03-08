'use client';
import { Typography } from '@mui/material';
import FlameComponent from './components/Flame';
import Home from './components/Home';

const RegistrationPage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h6'>サービス商品一覧</Typography>
        <Home></Home>
      </FlameComponent>
    </>
  );
};

export default RegistrationPage;
