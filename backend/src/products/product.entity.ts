import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { ProductType } from '../product-types/product-type.entity';
import { ManyToOne, JoinColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { ProductPlatform } from '../product-platforms/product-platform.entity';
import { Favorite } from '../favorites/favorite.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => ProductType, (productType) => productType.products)
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @OneToMany(() => ProductPlatform, (pp) => pp.product)
  productPlatforms: ProductPlatform[];
 
  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];
}
