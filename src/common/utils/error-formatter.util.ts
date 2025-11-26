import { HttpException } from '@nestjs/common';
import { getErrorMessage } from './get-error-message.util';
import { RpcError } from 'qeai-sdk';

export const formatError = (
  exception: any,
): RpcError => {
  if (exception instanceof HttpException) {
    console.debug('Exception Is Instanceof HTTPEXCEPTION');
    const response = exception.getResponse?.();
    const errorMessage = getErrorMessage(response);
    return {
      status: exception.getStatus(),
      message: errorMessage?.message || exception.message || 'Error inesperado',
      details:
        errorMessage?.details ||
        (response as any).message ||
        response ||
        'Error inesperado',
    };
  }

  console.error(
    'Cualquier otro tipo de error (por ejemplo, error del sistema)',
  );
  return {
    status: 500,
    message: exception?.message || 'Error interno del servidor',
    details: exception?.stack || ['Error interno del servidor'],
  };
};
