'use client';
import React from 'react';
import { Box, AppBar, Toolbar, Container } from '@mui/material';
import Image from 'next/image';
function Header(): JSX.Element {

  return (
    <AppBar style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <Container>
            <Box display='flex' alignItems='center' justifyContent='center' width='100%'>
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
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
