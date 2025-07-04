import { PartialType } from '@nestjs/mapped-types';
import { CreateTestItemDto } from './create-test-item.dto';

export class UpdateTestItemDto extends PartialType(CreateTestItemDto) {}
