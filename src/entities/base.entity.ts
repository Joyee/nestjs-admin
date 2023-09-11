import { CreateDateColumn, Entity } from 'typeorm';

@Entity()
export abstract class BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
