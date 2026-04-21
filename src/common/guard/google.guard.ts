import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// providers/google/google.guard.ts
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
