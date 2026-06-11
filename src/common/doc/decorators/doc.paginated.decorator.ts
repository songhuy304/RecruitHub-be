import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginatedResponseDto, PaginationMetadataDto } from '@/common/response';
import {
  DOC_RESPONSE_MESSAGE_META_KEY,
  DOC_RESPONSE_SERIALIZATION_META_KEY,
} from '../constants/doc.constant';
import { type IResponseDocOptions } from '../interfaces/doc.interface';

export function DocPaginatedResponse<T>(
  options: IResponseDocOptions<T>,
): MethodDecorator {
  const { serialization, messageKey, httpStatus } = options;

  const schema: Record<string, unknown> = {
    allOf: [
      { $ref: getSchemaPath(PaginatedResponseDto) },
      {
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: messageKey,
          },
          data: {
            type: 'array',
            items: serialization ? { $ref: getSchemaPath(serialization) } : {},
          },
          meta: {
            $ref: getSchemaPath(PaginationMetadataDto),
          },
        },
      },
    ],
  };

  const decorators = [
    ApiExtraModels(PaginatedResponseDto, PaginationMetadataDto),
    ApiResponse({
      status: httpStatus,
      description: messageKey,
      schema,
    }),
    SetMetadata(DOC_RESPONSE_SERIALIZATION_META_KEY, serialization),
    SetMetadata(DOC_RESPONSE_MESSAGE_META_KEY, messageKey),
  ];

  if (serialization) {
    decorators.push(ApiExtraModels(serialization));
  }

  return applyDecorators(...decorators);
}
