export type ExchangeOverview = {
  orderTxHash: string;
  productName: string;
  amount: number;
  price: number;
  depositAddress: string;
  createTimestamp: string;
};

export function isExchangeOverview(obj: any): obj is ExchangeOverview {
  return obj && 
          typeof obj === 'object' && 
          'orderTxHash' in obj &&
          'productName' in obj &&
          'amount' in obj &&
          'price' in obj &&
          'depositAddress' in obj &&
          'createTimestamp' in obj;
}