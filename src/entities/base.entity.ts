import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity()
export abstract class BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}
