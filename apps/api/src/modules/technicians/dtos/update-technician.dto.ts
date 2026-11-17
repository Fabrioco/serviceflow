import { PartialType, PickType } from '@nestjs/swagger';
import { CreateTechnicianDto } from './create-technician.dto.js';

export class UpdateTechnicianDto extends PartialType(
  PickType(CreateTechnicianDto, ['name', 'email'] as const),
) {}
