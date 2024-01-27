'use client';
import { Box } from '@mui/material';
import { useTimer } from 'react-timer-hook';

export function CountDownTimer({ expiryTimestamp }: { expiryTimestamp: Date }) {
  const { seconds, minutes, hours, days, isRunning, start, pause, resume, restart } = useTimer({
    expiryTimestamp,
    onExpire: () => window.location.reload(),
  });

  return (
    <Box style={{ textAlign: 'center' }}>
      <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
    </Box>
  );
}
