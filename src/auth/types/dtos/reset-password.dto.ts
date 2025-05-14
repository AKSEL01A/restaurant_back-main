import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {

  @IsString()
  resetToken: string; 


 @ApiProperty()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
      message: 'Password must contain at least one letter, one number, and one special character',
    })
  newPassword: string;


  @ApiProperty()
  @IsString()
  confirmPassword: string;
}
