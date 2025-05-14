
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength, } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email: string;


  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password must contain at least one letter, one number, and one special character',
  })
  password: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  role?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;


  @IsOptional()
  @IsDateString()
  dateDebutContrat?: string;
}
