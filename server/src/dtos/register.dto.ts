import { IsEmail, Matches, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email must be valid' })
    email!: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    })
    password!: string;
}
