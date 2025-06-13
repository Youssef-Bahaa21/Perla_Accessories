import crypto from 'crypto';

export class PasswordValidationService {
    // Common passwords to block (basic list - expand as needed)
    private static readonly COMMON_PASSWORDS = new Set([
        'password123', 'admin123', 'password1234', '123456789', 'qwerty123',
        'letmein123', 'welcome123', 'monkey123', 'dragon123', 'master123',
        'superman123', 'shadow123', 'football123', 'baseball123', 'batman123',
        'trustno1', 'iloveyou123', 'starwars123', 'chocolate123', 'princess123'
    ]);

    // Weak patterns to check against
    private static readonly WEAK_PATTERNS = [
        /(.)\1{3,}/, // 4+ repeated characters
        /123456|654321|abcdef|fedcba/, // sequential patterns
        /qwerty|asdfgh|zxcvbn/, // keyboard patterns
        /password|admin|login|root/i, // common words
    ];

    /**
     * Calculate password entropy (bits)
     */
    public static calculateEntropy(password: string): number {
        const charset = this.getCharsetSize(password);
        return Math.log2(Math.pow(charset, password.length));
    }

    /**
     * Get character set size based on password composition
     */
    private static getCharsetSize(password: string): number {
        let size = 0;

        if (/[a-z]/.test(password)) size += 26; // lowercase
        if (/[A-Z]/.test(password)) size += 26; // uppercase
        if (/[0-9]/.test(password)) size += 10; // digits
        if (/[^a-zA-Z0-9]/.test(password)) size += 32; // special chars (estimated)

        return size;
    }

    /**
     * Check if password is in common passwords list
     */
    public static isCommonPassword(password: string): boolean {
        const normalized = password.toLowerCase();
        return this.COMMON_PASSWORDS.has(normalized);
    }

    /**
     * Check for weak patterns in password
     */
    public static hasWeakPatterns(password: string): boolean {
        return this.WEAK_PATTERNS.some(pattern => pattern.test(password));
    }

    /**
     * Check if password contains user information
     */
    public static containsUserInfo(password: string, email: string): boolean {
        const emailLocal = email.split('@')[0].toLowerCase();
        const passwordLower = password.toLowerCase();

        // Check if password contains email local part (minimum 3 chars)
        if (emailLocal.length >= 3 && passwordLower.includes(emailLocal)) {
            return true;
        }

        return false;
    }

    /**
     * Comprehensive password strength validation
     */
    public static validatePasswordStrength(password: string, email?: string): {
        isValid: boolean;
        score: number;
        feedback: string[];
        entropy: number;
    } {
        const feedback: string[] = [];
        let score = 0;

        // Calculate entropy
        const entropy = this.calculateEntropy(password);

        // Basic requirements (already checked by DTO, but double-check)
        if (password.length < 12) {
            feedback.push('Password must be at least 12 characters long');
        } else {
            score += 20;
        }

        if (!/[a-z]/.test(password)) {
            feedback.push('Password must contain lowercase letters');
        } else {
            score += 15;
        }

        if (!/[A-Z]/.test(password)) {
            feedback.push('Password must contain uppercase letters');
        } else {
            score += 15;
        }

        if (!/[0-9]/.test(password)) {
            feedback.push('Password must contain numbers');
        } else {
            score += 15;
        }

        if (!/[^a-zA-Z0-9]/.test(password)) {
            feedback.push('Password must contain special characters');
        } else {
            score += 15;
        }

        // Entropy check (minimum 50 bits for strong password)
        if (entropy < 50) {
            feedback.push('Password complexity is too low');
        } else {
            score += 10;
        }

        // Common password check
        if (this.isCommonPassword(password)) {
            feedback.push('Password is too common and easily guessable');
            score -= 30;
        } else {
            score += 10;
        }

        // Weak pattern check
        if (this.hasWeakPatterns(password)) {
            feedback.push('Password contains predictable patterns');
            score -= 20;
        }

        // User info check
        if (email && this.containsUserInfo(password, email)) {
            feedback.push('Password should not contain parts of your email');
            score -= 15;
        }

        // Length bonus
        if (password.length >= 16) score += 5;
        if (password.length >= 20) score += 5;

        // Ensure score is between 0-100
        score = Math.max(0, Math.min(100, score));

        return {
            isValid: feedback.length === 0 && score >= 70,
            score,
            feedback,
            entropy
        };
    }

    /**
     * Generate a secure random password
     */
    public static generateSecurePassword(length: number = 16): string {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '@$!%*?&';

        const allChars = lowercase + uppercase + numbers + special;

        let password = '';

        // Ensure at least one character from each set
        password += lowercase[crypto.randomInt(lowercase.length)];
        password += uppercase[crypto.randomInt(uppercase.length)];
        password += numbers[crypto.randomInt(numbers.length)];
        password += special[crypto.randomInt(special.length)];

        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += allChars[crypto.randomInt(allChars.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
    }
} 