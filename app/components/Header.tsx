'use client';
import React from 'react';
import { Box, AppBar, Toolbar, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
function Header(props: {
  setOpenLeftDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const {
    setOpenLeftDrawer, //LeftDrawerの設定
  } = props;

  return (
    <AppBar style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <Container>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <MenuIcon
              fontSize='large'
              style={{ color: 'black', marginLeft: '0' }} // MenuIconを左端に寄せる
              onClick={() => setOpenLeftDrawer(true)}
            />
            <Box display='flex' alignItems='center' justifyContent='center' width='100%'>
              {' '}
              {/* Imageを中央に配置 */}
              <Image
                src='/logo.png'
                width={500}
                height={100}
                style={{
                  width: 'auto',
                  height: '50px',
                }}
                alt='logo'
              />
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
