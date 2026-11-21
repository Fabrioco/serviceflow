import { IsDateString } from 'class-validator';

export class ScheduleWorkOrderDto {
  @IsDateString()
  scheduledAt!: string;
}
