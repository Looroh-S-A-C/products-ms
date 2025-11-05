import { mapStatusToCode } from './map-status-to-code.util';

export const validateListeningError = (exception: any, timestamp: string) => {
  let status = 500;
  const success = false;
  const errorCasesMessages = [
    'No connection to NATS',
    'ECONNREFUSED',
    'Empty response. There are no subscribers',
  ];
  status = 503;
  const { context = '', message = '' } = exception.response;
  if (errorCasesMessages.some((msg) => message.includes(msg))) {
    return {
      statusCode: status,
      statusText: mapStatusToCode(status),
      success,
      error: {
        message:
          'El microservicio requerido no está disponible o no hay conexión.',
        details: errorCasesMessages,
        context,
        timestamp,
      },
    };
  }

  if (
    exception?.name === 'TimeoutError' ||
    exception?.message?.includes('TimeoutError') ||
    exception?.toString?.().includes('Timeout')
  ) {
    return {
      statusCode: status,
      statusText: mapStatusToCode(status),
      success,
      error: {
        message: 'El microservicio no respondió a tiempo.',
        details: exception.message || exception?.stack,
        context,
        timestamp,
      },
    };
  }

  return null;
};
