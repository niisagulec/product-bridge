import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Product } from '../products/product.entity';
import { OneToMany } from 'typeorm';

@Entity({ name: 'brands' })
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  logo_url: string;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}