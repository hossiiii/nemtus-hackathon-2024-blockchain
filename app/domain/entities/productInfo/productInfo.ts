export type ProductInfo = {
  productName: string;
  sellerName: string;
  description: string;
  category: string[];
  imageUrl: string;
  depositAddress: string; //販売者Symbolのアドレス
  ownerAddress: string; //販売者Momijiのアドレス
  price: number;
  mosaicId:string;
  serviceName: string;
  servieVersion: number;
};
