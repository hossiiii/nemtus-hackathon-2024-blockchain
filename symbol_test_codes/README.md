# nemtus-hackathon-2024-blockchain  
## ディレクトリ構成イメージ  
utils => useCases => api or component  

### utils
transactionなどのパーツ部分

### useCases
utilsを組み合わせてビジネスロジックを作る  
署名やアナウンス、検知もここで行う

### api or component
アカウントや秘密鍵情報を読み込みuseCasesに渡す