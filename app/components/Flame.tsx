import { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import LeftDrawer from './LeftDrawer';

const FlameComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);

  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer setOpenLeftDrawer={setOpenLeftDrawer} openLeftDrawer={openLeftDrawer} />
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default FlameComponent;
