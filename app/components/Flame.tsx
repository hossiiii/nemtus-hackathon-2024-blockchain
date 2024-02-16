import { Box } from '@mui/material';
import Header from './Header';
import MyBottomNavigation from './MyBottomNavigation';

const FlameComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header/>
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 10,
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 1,
          backgroundColor: "background.paper",
        }}
      >
        <MyBottomNavigation />
      </Box>      
    </>
  );
};

export default FlameComponent;
