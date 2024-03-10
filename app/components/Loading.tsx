'use client';
import Image from 'next/image';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CircularProgress } from '@mui/material';

function Loading(props: { value: number, text?: string, url?: string }): JSX.Element {
  const displayText = props.text ? props.text : '読み込み中...';
  const url = props.url ? props.url : '';
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Image
        src='/loading.gif'
        width={300}
        height={300}
        alt='loading'
        style={{ position: 'absolute' }}
      />
      <ProgressCircular value={props.value} />
      {url !== '' ? (
        <Typography sx={{ mt: 50, color: "white", position: 'relative', zIndex: 2 }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>
            {displayText}
          </a>
        </Typography>
      ) : (
        <Typography sx={{ mt: 50, color: "white", position: 'relative', zIndex: 2 }}>
          {displayText}
        </Typography>
      )}
    </Box>
  );
}

function ProgressCircular(props: { value: number }): JSX.Element {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={props.value} sx={{ color: "#F45028" }} />
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
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default Loading;
