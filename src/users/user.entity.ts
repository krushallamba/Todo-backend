import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  name: string; 
  
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({nullable: false})
  password: string;

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}