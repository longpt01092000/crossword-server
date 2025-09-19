import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export function ExposeString(description: string, example: string) {
  return applyDecorators(
    ApiProperty({ description, example, type: String }),
    Expose(),
  );
}

export function ExposeBoolean(description: string, example = true) {
  return applyDecorators(
    ApiProperty({ description, example, type: Boolean }),
    Expose(),
  );
}

export function ExposeNumber(description: string, example: number) {
  return applyDecorators(
    ApiProperty({ description, example, type: Number }),
    Expose(),
  );
}

export function ExposeDate(description: string, example?: string) {
  return applyDecorators(
    ApiProperty({
      description,
      example: example ?? new Date().toISOString(),
      type: String,
      format: 'date-time',
    }),
    Expose(),
  );
}

export function ExposeId(description: string, example: string) {
  return applyDecorators(
    ApiProperty({ description, example, type: String }),
    Expose(),
  );
}

export function ExposeObjectArray<T>(
  classType: new () => T,
  description: string,
  example: T[],
) {
  return applyDecorators(
    ApiProperty({
      description,
      type: classType,
      isArray: true,
      example,
    }),
    Expose(),
    Type(() => classType),
  );
}

export function ExposeStringArray(description: string, example: string[]) {
  return applyDecorators(
    ApiProperty({ description, example, type: String, isArray: true }),
    Expose(),
  );
}

export function ExposeEnum(
  enumType: object,
  description: string,
  example: unknown,
  optional = false,
) {
  return applyDecorators(
    ApiProperty({ description, enum: enumType, example, required: !optional }),
    Expose(),
  );
}
