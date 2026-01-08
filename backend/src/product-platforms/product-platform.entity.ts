import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn,} from 'typeorm';
  
import { Product } from '../products/product.entity';
import { Platform } from '../platforms/platform.entity';
@Entity({ name: 'product_platforms' })

export class ProductPlatform {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productPlatforms)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Platform, (platform) => platform.productPlatforms)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @Column()
  price: number;

  @Column()
  url: string;
}
