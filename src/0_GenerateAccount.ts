import { Account, NetworkType } from 'symbol-sdk';

const main = () => {
  console.log("===========SymbolAccountの作成===========")
  const aliceSymbol = Account.generateNewAccount(NetworkType.TEST_NET);
  const bobSymbol = Account.generateNewAccount(NetworkType.TEST_NET);
  console.log(
    `1. 以下URLを別タブで開き、CLAIM!ボタンをクリック。アカウントに手数料分の通貨（XYM）を補充し
    緑色のNotificationとして”View transaction in explorer.”と表示されたらタブを閉じる
    `
  );
  console.log(
    `
     https://testnet.symbol.tools/?amount=200&recipient=${aliceSymbol.address.plain()}
     https://testnet.symbol.tools/?amount=200&recipient=${bobSymbol.address.plain()}
    `
  );
  console.log(
    `2. 以下リンクを別タブで開き200XYMが入金されていることを確認する(このページは開いたままにしておく)`
  );
  console.log('');
  console.log(
    `
     https://testnet.symbol.fyi/accounts/${aliceSymbol.address.plain()}
     https://testnet.symbol.fyi/accounts/${bobSymbol.address.plain()}
    `
  );
  console.log(
    `3. 以下のPrivate Keyを別ファイルの”Property.ts”に入力して保存する
    `
  );
  console.log(`aliceSymbolPrivateKey: ${aliceSymbol.privateKey}`);
  console.log(`aliceSymbolPublicKey: ${aliceSymbol.publicKey}`);
  console.log(`aliceSymbolAddress: ${aliceSymbol.address.plain()}
  `);
  console.log(`bobSymbolPrivateKey: ${bobSymbol.privateKey}`);
  console.log(`bobSymbolPublicKey: ${bobSymbol.publicKey}`);
  console.log(`bobSymbolAddress: ${bobSymbol.address.plain()}
  `);  

  console.log("===========MomijiAccountの作成===========")
  const aliceMomiji = Account.generateNewAccount(NetworkType.TEST_NET);
  const bobMomiji = Account.generateNewAccount(NetworkType.TEST_NET);
  console.log(
    `4. 以下URLを別タブで開き、CLAIM!ボタンをクリック。アカウントに手数料分の通貨（manju）を補充し
    緑色のNotificationとして”View transaction in explorer.”と表示されたらタブを閉じる
    `
  );
  console.log(
    `
     http://66.94.121.126:100/?amount=200&recipient=${aliceMomiji.address.plain()}
     http://66.94.121.126:100/?amount=200&recipient=${bobMomiji.address.plain()}
    `
  );
  console.log(
    `5. 以下リンクを別タブで開き200XYMが入金されていることを確認する(このページは開いたままにしておく)`
  );
  console.log('');
  console.log(
    `
     http://66.94.121.126:90/accounts/${aliceMomiji.address.plain()}
     http://66.94.121.126:90/accounts/${bobMomiji.address.plain()}
    `
  );
  console.log(
    `6. 以下のPrivate Keyを別ファイルの”Property.ts”に入力して保存する
    `
  );
  console.log(`aliceMomijiPrivateKey: ${aliceMomiji.privateKey}`);
  console.log(`aliceMomijiPublicKey: ${aliceMomiji.publicKey}`);
  console.log(`aliceMomijiAddress: ${aliceMomiji.address.plain()}
  `);
  console.log(`bobMomijiPrivateKey: ${bobMomiji.privateKey}`);
  console.log(`bobMomijiPublicKey: ${bobMomiji.publicKey}`);
  console.log(`bobMomijiAddress: ${bobMomiji.address.plain()}
  `);  
};

main();
