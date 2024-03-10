import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

function InputDialog(props: {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleAgreeClick: (password: string | null) => void; // 親コンポーネントへパスワードを渡すためのコールバック関数
  setProgress: React.Dispatch<React.SetStateAction<boolean>>;
  dialogTitle: string;
  dialogMessage: string;
}): JSX.Element {
  const { openDialog, setOpenDialog, handleAgreeClick, setProgress, dialogTitle, dialogMessage } = props;
  const [inputValue, setInputValue] = useState<string | null>(null);

  // テキストフィールドの値が変更されたときに呼び出されるハンドラー
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // OKボタンがクリックされたときに呼び出されるハンドラー
  const handleOkClick = () => {
    handleAgreeClick(inputValue); // 親コンポーネントに入力値を渡す
    setOpenDialog(false); // ダイアログを閉じる
  };

  const handleCancelClick = () => {
    setProgress(false); // ローディング停止
    setOpenDialog(false); // ダイアログを閉じる
  };

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogMessage}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="password"
          label="入力"
          type="password"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="space-between" width="100%" p={1}>
          <Button color="primary" variant="outlined" onClick={handleCancelClick}>
            キャンセル
          </Button>
          <Button color="primary" variant="contained" onClick={handleOkClick}>
            OK
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default InputDialog;
