import React from 'react';
import { Box, Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
function AlertsDialog(props: {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleAgreeClick: () => void;
  dialogTitle: string;
  dialogMessage: string;
}): JSX.Element {
  const { openDialog, setOpenDialog, handleAgreeClick, dialogTitle, dialogMessage } = props;

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <DialogTitle>{`${dialogTitle}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{`${dialogMessage}`}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='primary' variant='outlined' onClick={() => setOpenDialog(false)}>
            キャンセル
          </Button>
          <Button color='primary' variant='contained' autoFocus onClick={() => handleAgreeClick()}>
            OK
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
export default AlertsDialog;
