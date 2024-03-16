'use client'
import { Box, Typography, List, ListItemButton, ListItemText, Paper, Button, Backdrop, ListItemIcon } from '@mui/material';
import Container from '@mui/material/Container';
import React, { useEffect, useState } from 'react';
import { momijiAccountMetaDataKey, symbolExplorer } from '../consts/consts';
import { Account, NetworkType, PublicAccount } from 'symbol-sdk';
import useSetupBlockChain from '../hooks/useSetupBlockChain';
import { YouTubeEmbed } from '@next/third-parties/google'
import { createAccount } from '../domain/utils/accounts/createAccount';
import Loading from './Loading';
import AlertsSnackbar from './AlertsSnackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // クリップボードアイコンのインポート

const SettingsComponent = () => {
  const { symbolBlockChain } = useSetupBlockChain();
  const [address, setAddress] = useState("まだアカウントが登録されていません");
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [progressValue, setProgressValue] = useState<number>(50); //ローディングの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定

  useEffect(() => {
    if (!symbolBlockChain || !localStorage.getItem(momijiAccountMetaDataKey)) return;
    const publicAccount = PublicAccount.createFromPublicKey(localStorage.getItem(momijiAccountMetaDataKey), symbolBlockChain.networkType);
    setAddress(publicAccount.address.plain());
  }, [symbolBlockChain]);

  const copyTextToClipboardPrivateKey = async (text:string) => {
    await navigator.clipboard.writeText(text)
    .then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  
  return (
    <Container component="main" maxWidth="md">
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={'bottom'}
        snackbarSeverity={snackbarSeverity}
        snackbarMessage={snackbarMessage}
      />
      {progress ? (
        <Backdrop open={progress}>
          <Loading value={progressValue} />
        </Backdrop>
      ) : (
      <Box
      >
        <Typography variant="body1" component="h1" gutterBottom>
            アプリイメージ動画
        </Typography>

        <YouTubeEmbed videoid="I_hgEevVoGg" params="controls=0" />

        <Typography variant="body1" component="h1" gutterBottom sx={{mt:2,mb:2}}>
            BRIDGE PAYとは
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            ブロックチェーンを活用した誰もが自由に使える個人間取引アプリです。利用するには以下２つ準備が必要です。
        </Typography>
        <Typography variant="body1" component="h1" gutterBottom sx={{mt:3}}>
            1.Symbolテストネットアカウント
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom>
            　お持ちでない場合はこちらをクリックしてテストネットアカウントを作成して下さい。
        </Typography>
        <Typography variant="caption" component="h1" gutterBottom sx={{mb:3}}>
          　※こちらのアカウントは商品購入用の100XYM入金済みの使い捨てのアカウントとなります。<br />
          　※生成された秘密鍵をaLiceにインポートしてご使用ください。<br />
          {privateKey ?
              <>
                  　※100XYMで足りない場合は、
                  <a
                      href={`https://testnet.symbol.tools/?recipient=${Account.createFromPrivateKey(privateKey, NetworkType.TEST_NET).address.plain()}`} 
                      target="_blank" 
                      rel="noreferrer"
                  >
                      こちら
                  </a>からXYMを入手して下さい。
              </>
              :
              <></>
          }
        </Typography>
        <Button
          disabled={privateKey?true:false}
          variant="contained"
          color="primary"
          onClick={async () => {
            setProgress(true);
            const privateKey = createAccount();
            setPrivateKey(privateKey);
            const response = await fetch('/api/sendXym', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                targetRawAddress: Account.createFromPrivateKey(privateKey, NetworkType.TEST_NET).address.plain(),
                amount: 100,
              }),
            })
            if (!response.ok) {
              setSnackbarSeverity('error');
              setSnackbarMessage('管理者から手数料分のXYMを送れませんでした');
              setOpenSnackbar(true);
              setProgress(false);
              return
            }
            setSnackbarSeverity('success');
            setSnackbarMessage('テストネットアカウントを作成しました。100XYMを送金しました');
            setOpenSnackbar(true);
            setProgress(false);
          }}
        >
          テストネットアカウント作成
        </Button>
        {privateKey?<>
          <ListItemButton
            onClick={() => {
              copyTextToClipboardPrivateKey(privateKey);
              setSnackbarSeverity('success');
              setSnackbarMessage('クリップボードに秘密鍵をコピーしました');
              setOpenSnackbar(true);
              setProgress(false);
            }}
          >
            <ListItemText primary="作成された秘密鍵"
              secondary={privateKey} 
              sx={{
                '.MuiListItemText-secondary': {
                  wordBreak: 'break-all',
                },
              }}
            />
          <ListItemIcon>
            <ContentCopyIcon />
          </ListItemIcon>
        </ListItemButton>
        </>:<>
        </>}

        <Typography variant="body1" component="h1" gutterBottom sx={{mt:3}}>
            2.aLice（モバイル用署名用アプリ）
        </Typography>
        <List component="nav" aria-label="Settings options" sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItemButton component="a" href="https://apps.apple.com/us/app/alice-sign/id6449146041" target="_blank" rel="noreferrer" >
            <ListItemText primary="aLice（iOS）" secondary="iOSダウンロードはこちらから" />
        </ListItemButton>
        <ListItemButton component="a" href="https://play.google.com/store/apps/details?id=com.pine.alice" target="_blank" rel="noreferrer" >
            <ListItemText primary="aLice（Android）" secondary="Androidダウンロードはこちらから" />
        </ListItemButton>
        <ListItemButton component="a" href="https://note.com/nononon_symbol/n/n87e8ef3f89e0" target="_blank" rel="noreferrer" >
            <ListItemText primary="aLiceの使い方" secondary="aLiceの使い方 by のののんさん" />
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
        <Paper
          sx={{
            p: 2,
            mt: 2,
            mb: 3,
            backgroundColor: 'success.main',
            color: 'white',
          }}
        >
          <Box>
            <Box>
              <Box>現在はテストネットのみでの提供となります。自由にダミー商品を登録したり、ダミー商品を購入して楽しんで下さい。</Box>
            </Box>
          </Box>
        </Paper>
      </Box>
      )}
    </Container>
  );
};

export default SettingsComponent;

