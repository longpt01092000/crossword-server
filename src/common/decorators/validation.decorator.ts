import { applyDecorators, Type as NestType } from '@nestjs/common';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
  ValidateNested,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export function ValidateRequiredString(description?: string, example?: string) {
  return applyDecorators(
    ApiProperty({
      example: example ?? 'example text',
      description: description ?? 'A required string field',
    }),
    IsString(),
    IsNotEmpty(),
  );
}

export function ValidateOptionalString(description?: string, example?: string) {
  return applyDecorators(
    ApiPropertyOptional({
      example: example ?? 'optional text',
      description: description ?? 'An optional string field',
    }),
    IsString(),
    IsOptional(),
  );
}

export function ValidateOptionalMongoId(
  description = 'Optional MongoId',
  example = '507f1f77bcf86cd799439011',
) {
  return applyDecorators(
    ApiPropertyOptional({ description, example }),
    IsOptional(),
    IsMongoId({ message: 'Must be a valid MongoDB ObjectId' }),
  );
}

export function ValidateRequiredMongoId(
  description = 'Required MongoId',
  example = '507f1f77bcf86cd799439011',
) {
  return applyDecorators(
    ApiProperty({ description, example }),
    IsMongoId({ message: 'Must be a valid MongoDB ObjectId' }),
  );
}

export function ValidateRequiredBoolean(description?: string, example = true) {
  return applyDecorators(
    ApiProperty({
      example,
      description: description ?? 'A required boolean field',
      default: example,
    }),
    IsBoolean(),
  );
}

export function ValidateOptionalBoolean(description?: string, example = true) {
  return applyDecorators(
    ApiPropertyOptional({
      example,
      description: description ?? 'An optional boolean field',
      default: example,
    }),
    IsBoolean(),
    IsOptional(),
  );
}

export function ValidateOptionalStringArray(
  description = 'Optional array of strings',
  example: string[] = ['example1', 'example2'],
) {
  return applyDecorators(
    ApiPropertyOptional({
      example,
      description,
      isArray: true,
      type: [String],
    }),
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
  );
}

export function ValidateRequiredStringArray(
  description = 'Required array of strings',
  example: string[] = ['example1', 'example2'],
) {
  return applyDecorators(
    ApiProperty({
      example,
      description,
      isArray: true,
      type: [String],
    }),
    IsArray(),
    IsString({ each: true }),
  );
}

export function ValidateOptionalMongoIdArray(
  description = 'Optional array of MongoDB ObjectIds',
  example: string[] = ['507f1f77bcf86cd799439011'],
) {
  return applyDecorators(
    ApiPropertyOptional({
      example,
      description,
      isArray: true,
      type: [String],
    }),
    IsArray(),
    IsMongoId({ each: true }),
    IsOptional(),
  );
}

export function ValidateRequiredMongoIdArray(
  description = 'Required array of MongoDB ObjectIds',
  example: string[] = ['507f1f77bcf86cd799439011'],
) {
  return applyDecorators(
    ApiProperty({
      example,
      description,
      isArray: true,
      type: [String],
    }),
    IsArray(),
    IsMongoId({ each: true }),
  );
}

export function ValidateOptionalObjectArray<T extends NestType<unknown>>(
  type: T,
  description = 'Optional array of objects',
  example?: unknown[],
) {
  return applyDecorators(
    ApiPropertyOptional({
      description,
      isArray: true,
      type,
      example,
    }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => type),
    IsOptional(),
  );
}

export function ValidateRequiredObjectArray<T extends NestType<unknown>>(
  type: T,
  description = 'Required array of objects',
  example?: unknown[],
) {
  return applyDecorators(
    ApiProperty({
      description,
      isArray: true,
      type,
      example,
    }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => type),
  );
}

export function ValidateRequiredNumber(
  description = 'Required number',
  example = 1,
) {
  return applyDecorators(
    ApiProperty({
      description,
      example,
      type: Number,
    }),
    IsNumber(),
  );
}

export function ValidateOptionalNumber(
  description = 'Optional number',
  example = 1,
) {
  return applyDecorators(
    ApiPropertyOptional({
      description,
      example,
      type: Number,
    }),
    IsNumber(),
    IsOptional(),
  );
}

export function ValidateRequiredEnum<T extends object>(
  enumType: T,
  description = 'Required enum field',
  example?: keyof T | T[keyof T],
) {
  return applyDecorators(
    ApiProperty({
      description,
      enum: enumType,
      example,
    }),
    IsEnum(enumType),
  );
}

export function ValidateOptionalEnum<T extends object>(
  enumType: T,
  description = 'Optional enum field',
  example?: keyof T | T[keyof T],
) {
  return applyDecorators(
    ApiPropertyOptional({
      description,
      enum: enumType,
      example,
    }),
    IsEnum(enumType),
    IsOptional(),
  );
}
