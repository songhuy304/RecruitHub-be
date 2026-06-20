import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { ClassConstructor } from 'class-transformer';

import { DocGenericResponse } from './doc.generic.decorator';
import { DocPaginatedResponse } from './doc.paginated.decorator';
import { DocResponse } from './doc.response.decorator';
import type {
  DocSerialization,
  IDocBaseOptions,
  IDocPaginatedOptions,
  IDocTypedOptions,
} from '../interfaces/doc.interface';

function resolveSerialization<T>(
  serialization: DocSerialization<T>,
  isArray?: boolean,
): { dto: ClassConstructor<T>; isArray: boolean } {
  if (Array.isArray(serialization)) {
    return { dto: serialization[0], isArray: true };
  }

  return { dto: serialization, isArray: isArray ?? false };
}

export function ApiEndpoint<T>(
  options: IDocPaginatedOptions<T>,
): MethodDecorator;
export function ApiEndpoint<T>(options: IDocTypedOptions<T>): MethodDecorator;
export function ApiEndpoint(options: IDocBaseOptions): MethodDecorator;
export function ApiEndpoint<T>(
  options: IDocBaseOptions & {
    serialization?: DocSerialization<T>;
    isArray?: boolean;
    paginated?: true;
  },
): MethodDecorator {
  const httpStatus = options.httpStatus ?? HttpStatus.OK;
  const resolvedSerialization = options.serialization
    ? resolveSerialization(options.serialization, options.isArray)
    : null;

  return applyDecorators(
    ApiOperation({ summary: options.summary }),
    options.paginated && resolvedSerialization
      ? DocPaginatedResponse({
          serialization: resolvedSerialization.dto,
          httpStatus,
          messageKey: options.messageKey,
        })
      : resolvedSerialization
        ? DocResponse({
            serialization: resolvedSerialization.dto,
            isArray: resolvedSerialization.isArray,
            httpStatus,
            messageKey: options.messageKey,
          })
        : DocGenericResponse({
            httpStatus,
            messageKey: options.messageKey,
          }),
  );
}
