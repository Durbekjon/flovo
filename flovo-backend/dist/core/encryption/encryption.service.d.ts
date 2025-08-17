import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private readonly configService;
    private readonly algorithm;
    private readonly keyLength;
    constructor(configService: ConfigService);
    private getKey;
    encrypt(plaintext: string): string;
    decrypt(encryptedData: string): string;
}
