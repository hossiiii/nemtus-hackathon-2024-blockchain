'use client'
import { Box, Typography, List, ListItemButton, ListItemText } from '@mui/material';
import Container from '@mui/material/Container';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { momijiAccountMetaDataKey, symbolExplorer } from '../consts/consts';
import { PublicAccount } from 'symbol-sdk';
import useSetupBlockChain from '../hooks/useSetupBlockChain';

const SettingsComponent = () => {
  const { symbolBlockChain } = useSetupBlockChain();
  const [address, setAddress] = useState(null);
  useEffect(() => {
    if (!symbolBlockChain || !localStorage.getItem(momijiAccountMetaDataKey)) return;
    const publicAccount = PublicAccount.createFromPublicKey(localStorage.getItem(momijiAccountMetaDataKey), symbolBlockChain.networkType);
    setAddress(publicAccount.address.plain());
  }, [symbolBlockChain]);

  return (
    <Container component="main" maxWidth="md">
      <Box
      >
        <Typography variant="body1" component="h1" gutterBottom sx={{mt:1,mb:2}}>
            BRIDGE PAYとは
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ブロックチェーンを活用した誰もが自由に使える個人間取引アプリです。本アプリを利用する際は以下の事前の準備が必要になります。
        </Typography>
        <Typography variant="body1" component="h1" gutterBottom sx={{mt:2}}>
            1.スマートフォンorタブレット
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            　今後PCにも対応する予定です。
        </Typography>
        <Typography variant="body1" component="h1" gutterBottom sx={{mt:2}}>
            2.Symbolテストネットアカウント
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            　お持ちでない場合はこちらの作成してください。
        </Typography>
        <ListItemButton component="a" href="https://desktop-wallet1013.web.app/#/profiles/create" target="_blank" rel="noreferrer" >
            <ListItemText primary="Symbolウォレット" secondary="ブラウザ上で動作します" />
        </ListItemButton>
        <Typography variant="body1" component="h1" gutterBottom sx={{mt:2}}>
            3.aLice（モバイル用署名用アプリ）
        </Typography>

        <List component="nav" aria-label="Settings options" sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItemButton component="a" href="https://note.com/nononon_symbol/n/n87e8ef3f89e0" target="_blank" rel="noreferrer" >
            <ListItemText primary="aLiceの使い方" secondary="aLiceの使い方 by のののんさん" />
        </ListItemButton>
        <ListItemButton component="a" href="https://apps.apple.com/us/app/alice-sign/id6449146041" target="_blank" rel="noreferrer" >
            <ListItemText primary="aLice（iOS）" secondary="iOSダウンロードはこちらから" />
        </ListItemButton>
        <ListItemButton component="a" href="https://play.google.com/store/apps/details?id=com.pine.alice" target="_blank" rel="noreferrer" >
            <ListItemText primary="aLice（Android）" secondary="Androidダウンロードはこちらから" />
        </ListItemButton>
        <Typography variant="body1" component="h1" gutterBottom sx={{mt:2}}>
            アカウント情報
        </Typography>
        <ListItemButton component="a" href={`${symbolExplorer}/accounts/${address}`} target="_blank" rel="noreferrer" >
            <ListItemText primary="現在利用中のアカウント"
              secondary={address} 
              sx={{
                '.MuiListItemText-secondary': {
                  wordBreak: 'break-all',
                },
              }}
            />
        </ListItemButton>
        </List>
      </Box>
    </Container>
  );
};

export default SettingsComponent;

