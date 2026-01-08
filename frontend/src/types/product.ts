export interface ProductType {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Platform {
  id: number;
  name: string;
}

export interface ProductPlatform {
  id: number;
  price: number;
  url: string;
  platform: Platform;
}

export interface Product {
  id: number;
  name: string;
  productType?: ProductType;
  brand?: Brand;
  productPlatforms?: ProductPlatform[];
}

export interface Favorite {
  id: number;
  product: Product;
}


