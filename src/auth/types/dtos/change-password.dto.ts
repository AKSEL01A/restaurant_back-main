import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  currentPassword(id: any, currentPassword: any, newPassword: string) {
    throw new Error('Method not implemented.');
  }
@ApiProperty()  
  @IsNotEmpty()
  oldPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
    @Matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
        message: 'Password must contain at least one letter, one number, and one special character',
      })
  newPassword: string;
   @ApiProperty()
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/, {
      message: 'Password must contain at least one letter, one number, and one special character',
    })
    confirmPassword: string;
}
