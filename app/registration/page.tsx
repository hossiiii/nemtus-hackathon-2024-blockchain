'use client';
import { Typography } from '@mui/material';
import FlameComponent from '../components/Flame';
import { RegistrationForm } from '../components/RegistrationForm';

const RegistrationPage = () => {
  return (
    <>
      <FlameComponent>
        <Typography variant='h6'>商品登録</Typography>
        <RegistrationForm/>
      </FlameComponent>
    </>
  );
};

export default RegistrationPage;
