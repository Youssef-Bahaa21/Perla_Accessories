declare module 'hpp' {
  import { RequestHandler } from 'express';
  
  function hpp(options?: hppOptions): RequestHandler;
  
  interface hppOptions {
    whitelist?: string[];
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string[];
    checkQuery?: boolean;
  }
  
  export = hpp;
}
