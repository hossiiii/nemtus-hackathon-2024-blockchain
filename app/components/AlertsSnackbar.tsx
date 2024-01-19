import React from 'react';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';
import { Button, IconButton, Snackbar } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

//スナックバーのスタイル設定
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

function AlertsSnackbar(props: {
  openSnackbar: boolean;
  setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  vertical: 'top' | 'bottom';
  snackbarSeverity: AlertColor | undefined;
  snackbarMessage: string;
}): JSX.Element {
  const { openSnackbar, setOpenSnackbar, vertical, snackbarSeverity, snackbarMessage } = props;

  const handleCloseSnacbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const closeSnacbarAction = (
    <React.Fragment>
      <Button color='secondary' size='small' onClick={handleCloseSnacbar}>
        閉じる
      </Button>
      <IconButton size='small' aria-label='close' color='inherit' onClick={handleCloseSnacbar}>
        <ClearIcon fontSize='small' />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={5000}
      onClose={handleCloseSnacbar}
      action={closeSnacbarAction}
      anchorOrigin={{ vertical: vertical, horizontal: 'center' }}
    >
      <Alert onClose={handleCloseSnacbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
}
export default AlertsSnackbar;
