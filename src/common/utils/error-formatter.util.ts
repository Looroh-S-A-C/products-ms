import { HttpException } from '@nestjs/common';
import { getErrorMessage } from './get-error-message.util';
import { validateListeningError } from './validate-listening-error';
import { RpcError } from '../interfaces/rpc-error.interface';

export const formatError = (
  exception: any,
): RpcError => {
  if (exception instanceof HttpException) {
    console.debug('Exception Is Instanceof HTTPEXCEPTION');
    const response = exception.getResponse?.();
    // const listeningError = validateListeningError(exception, timestamp);
    // if (listeningError) return listeningError;
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
