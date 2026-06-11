import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import {
  DOC_RESPONSE_MESSAGE_META_KEY,
  DOC_RESPONSE_SERIALIZATION_META_KEY,
} from '../constants/doc.constant';
import { type IResponseDocOptions } from '../interfaces/doc.interface';
import { ApiResponseDto } from '@/common/response';

export function DocResponse<T>(
  options: IResponseDocOptions<T>,
): MethodDecorator {
  const { httpStatus, serialization, messageKey } = options;

  const schema: Record<string, unknown> = {
    allOf: [
      { $ref: getSchemaPath(ApiResponseDto) },
      {
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: messageKey,
          },
          data: serialization
            ? { $ref: getSchemaPath(serialization) }
            : { type: 'object', example: {} },
        },
      },
    ],
  };

  const decorators = [
    ApiExtraModels(ApiResponseDto),
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
