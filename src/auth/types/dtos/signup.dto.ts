import { IsEmail, IsNotEmpty, MinLength, Matches, IsEnum, IsString, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from './match.decorator';
// export enum UserRole {
//   ADMIN = 'admin',
//   CUSTOMER = 'customer',
// }

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password must contain at least one letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'Password confirmation cannot be empty' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;


  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  @IsString()
  phone?: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsEnum(UserRole, { message: `Role must be one of: ${Object.values(UserRole).join(', ')}` })
  // role: UserRole;
}
