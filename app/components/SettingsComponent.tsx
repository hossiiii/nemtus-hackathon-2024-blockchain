'use client'
import { Box, Typography, Backdrop, CircularProgress, List, ListItemButton, ListItemText, Dialog, DialogTitle, DialogContentText, DialogActions, Button } from '@mui/material';
import Container from '@mui/material/Container';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import AlertsDialog from './AlertsDialog';


const SettingsComponent = () => {
  const router = useRouter()

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="h1" gutterBottom>
            BRIDGE PAYとは
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ブロックチェーンを活用した誰もが自由に使える個人間取引アプリです。
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            本アプリを利用する際は以下事前の準備が必要になります。
        </Typography>

        <Typography variant="caption" component="h1" gutterBottom sx={{mt:2}}>
            ・スマートフォンorタブレット（今後PC対応を行う予定です）
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ・Symbolテストネットアカウント（今後メインネット対応を行う予定です）
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
        </List>
      </Box>
    </Container>
  );
};

export default SettingsComponent;

