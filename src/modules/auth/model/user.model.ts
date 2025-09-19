import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '1234567890abcdef', description: 'User ID' })
  sub: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({
    example: ['user'],
    description: 'Roles assigned to the user',
    isArray: true,
  })
  roles: string[];
}
