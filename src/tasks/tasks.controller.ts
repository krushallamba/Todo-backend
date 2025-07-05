import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Request() req) {
    return this.taskService.createTask(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.taskService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.taskService.updateTask(+id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.taskService.deleteTask(+id, req.user.userId);
  }
}
