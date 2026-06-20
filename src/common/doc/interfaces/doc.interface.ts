import { type HttpStatus } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';

export type DocSerialization<T> = ClassConstructor<T> | [ClassConstructor<T>];

export interface IDocBaseOptions {
  summary: string;
  messageKey: string;
  httpStatus?: HttpStatus;
}

export interface IDocTypedOptions<T> extends IDocBaseOptions {
  serialization: DocSerialization<T>;
  isArray?: boolean;
}

export interface IDocPaginatedOptions<T> extends IDocBaseOptions {
  serialization: ClassConstructor<T>;
  paginated: true;
}

export interface IResponseDocOptions<T> {
  httpStatus: number;
  messageKey: string;
  serialization?: ClassConstructor<T>;
  isArray?: boolean;
}

export interface IGenericResponseOptions {
  httpStatus: number;
  messageKey: string;
}
