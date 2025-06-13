import { IsEmail, Matches, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email must be valid' })
    email!: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(12, { message: 'Password must be at least 12 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, {
        message: 'Password must be at least 12 characters and include uppercase, lowercase, number, and special character (@$!%*?&)',
    })
    password!: string;
}
