import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskStatus } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  createTask(dto: CreateTaskDto, userId: number) {
    const task = this.taskRepo.create({ ...dto, user: { id: userId } });
    return this.taskRepo.save(task);
  }

  findAll(userId: number) {
    return this.taskRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateTask(id: number, dto: UpdateTaskDto, userId: number) {
    const task = await this.taskRepo.findOne({ where: { id, user: { id: userId } } });
    if (!task) return null;
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async deleteTask(id: number, userId: number) {
    const task = await this.taskRepo.findOne({ where: { id, user: { id: userId } } });
    if (!task) return null;
    return this.taskRepo.remove(task);
  }
}
