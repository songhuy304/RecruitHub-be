import axios from 'axios';
import { HttpException } from '@nestjs/common';

export function toPublisherError(error: unknown): string {
  if (error instanceof HttpException) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          error?: { message?: string; code?: string };
          message?: string;
        }
      | undefined;

    return (
      data?.error?.message ||
      data?.error?.code ||
      data?.message ||
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Publish failed';
}
