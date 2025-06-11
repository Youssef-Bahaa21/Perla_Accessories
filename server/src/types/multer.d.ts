declare module 'multer' {
    import { Request } from 'express';

    namespace Multer {
        interface File {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            destination?: string;
            filename?: string;
            path?: string;
            buffer?: Buffer;
        }

        interface Info {
            public_id: string;
            version: number;
            signature: string;
            width: number;
            height: number;
            format: string;
            resource_type: string;
            created_at: string;
            tags: string[];
            bytes: number;
            type: string;
            etag: string;
            placeholder: boolean;
            url: string;
            secure_url: string;
            folder: string;
            original_filename: string;
        }
    }

    interface FileFilterCallback {
        (error: Error | null, acceptFile: boolean): void;
    }

    interface StorageEngine {
        _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void): void;
        _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error) => void): void;
    }

    interface Options {
        dest?: string;
        storage?: StorageEngine;
        limits?: {
            fieldNameSize?: number;
            fieldSize?: number;
            fields?: number;
            fileSize?: number;
            files?: number;
            parts?: number;
            headerPairs?: number;
        };
        fileFilter?(req: Request, file: Express.Multer.File, callback: FileFilterCallback): void;
    }

    function multer(options?: Options): {
        single(fieldname: string): any;
        array(fieldname: string, maxCount?: number): any;
        fields(fields: Array<{ name: string, maxCount?: number }>): any;
        none(): any;
    };

    export = multer;
}

declare namespace Express {
    namespace Multer {
        interface File {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            destination?: string;
            filename?: string;
            path?: string;
            buffer?: Buffer;
        }
    }

    interface Request {
        file?: Multer.File;
        files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
} 