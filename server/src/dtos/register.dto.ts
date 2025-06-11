import { IsEmail, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email must be valid' })
    email!: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number',
    })
    password!: string;
}
