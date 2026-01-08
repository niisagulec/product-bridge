import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { ProductPlatform } from '../product-platforms/product-platform.entity';


@Entity({ name: 'platforms' })
export class Platform {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => ProductPlatform, (pp) => pp.platform)
  productPlatforms: ProductPlatform[];
}
