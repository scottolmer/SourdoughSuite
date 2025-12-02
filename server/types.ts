import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      subdomain?: string;
      isStore?: boolean;
      isBlog?: boolean;
      isApp?: boolean;
    }
  }
}