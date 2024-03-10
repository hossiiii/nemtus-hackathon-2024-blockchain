'use client';
import Image from 'next/image';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CircularProgress } from '@mui/material';

function Loading(props:{ value: number }): JSX.Element {
  return (
    <Box
    sx={{
      position: 'relative', // 親Boxに相対位置を設定
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center', // 中央揃え
      height: '100vh', // 必要に応じて高さを調整
      width: '100vw', // 必要に応じて幅を調整
    }}
  >
    <Box
      sx={{
        position: 'absolute', // 絶対位置を設定
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
    <Image
      src='/loading.gif'
      width={300}
      height={300}
      style={{
        width: 'auto',
      }}
      alt='logo'
    />
    </Box>
    <Box
      sx={{
        position: 'absolute', // 絶対位置を設定
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ProgressCircular value={props.value} />
    </Box>
  </Box>    
  );
}

function ProgressCircular(props:{ value: number }): JSX.Element {
  // variant プロパティを直接設定し、props からは除外
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={props.value} sx={{ color: "#F45028" }}/>
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
export default Loading;
