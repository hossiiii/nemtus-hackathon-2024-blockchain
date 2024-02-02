export type ProductInfo = {
  productName: string;
  sellerName: string;
  description: string;
  category: string[];
  metalIds: string[];
  depositAddress: string; //販売者Symbolのアドレス
  orderAddress: string; //販売者Momijiのアドレス
  price: number;
  serviceName: string;
  servieVersion: number;
};
