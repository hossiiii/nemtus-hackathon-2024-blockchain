# nemtus-hackathon-2024-blockchain  
## コーディング規約  
### UseCaseの変数名の命名規則
#### アカウントの命名規則
・privateKeyのアカウント = xxxAccount
・publicKeyのアカウント = xxxPublicAccount
・addressクラス = xxxAddress
・privateKeyの文字列 = xxxPrivateKey
・publicKeyの文字列 = xxxPublicKey
・address = xxxRawAddress
#### ブロックチェーンタイプの命名規則
・symbol、momijiを先頭につける

## ディレクトリ構成イメージ  
utils => useCases => api or component  

### utils
transactionなどのパーツ部分

### useCases
utilsを組み合わせてビジネスロジックを作る  
署名やアナウンス、検知もここで行う

### api or component
アカウントや秘密鍵情報を読み込みuseCasesに渡す