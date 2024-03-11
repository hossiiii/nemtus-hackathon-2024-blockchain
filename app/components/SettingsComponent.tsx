'use client'
import { Box, Typography, List, ListItemButton, ListItemText } from '@mui/material';
import Container from '@mui/material/Container';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { momijiAccountMetaDataKey } from '../consts/consts';
import { PublicAccount } from 'symbol-sdk';
import useSetupBlockChain from '../hooks/useSetupBlockChain';

const SettingsComponent = () => {
  const { symbolBlockChain } = useSetupBlockChain();
  const [address, setAddress] = useState(null);
  useEffect(() => {
    if (!symbolBlockChain) return;
    const publicAccount = PublicAccount.createFromPublicKey(localStorage.getItem(momijiAccountMetaDataKey), symbolBlockChain.networkType);
    setAddress(publicAccount.address.plain());
  }, [symbolBlockChain]);

  return (
    <Container component="main" maxWidth="md">
      <Box
      >
        <Typography variant="h6" component="h1" gutterBottom sx={{mt:2,mb:2}}>
            BRIDGE PAYとは
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ブロックチェーンを活用した誰もが自由に使える個人間取引アプリです。本アプリを利用する際は以下事前の準備が必要になります。
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom sx={{mt:2}}>
            ・スマートフォンorタブレット
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ・Symbolテストネットアカウント
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ・aLice（モバイル用署名用アプリ）
        </Typography>

        <List component="nav" aria-label="Settings options" sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItemButton component="a" href="https://note.com/nononon_symbol/n/n87e8ef3f89e0">
            <ListItemText primary="aLiceの使い方" secondary="aLiceの使い方 by のののんさん" />
        </ListItemButton>
        <ListItemButton component="a" href="https://apps.apple.com/us/app/alice-sign/id6449146041">
            <ListItemText primary="aLice（iOS）" secondary="iOSダウンロードはこちらから" />
        </ListItemButton>
        <ListItemButton component="a" href="https://play.google.com/store/apps/details?id=com.pine.alice">
            <ListItemText primary="aLice（Android）" secondary="Androidダウンロードはこちらから" />
        </ListItemButton>
        <ListItemButton component="a">
            <ListItemText primary="アカウント情報" secondary={address} />
        </ListItemButton>
        </List>
      </Box>
    </Container>
  );
};

export default SettingsComponent;

