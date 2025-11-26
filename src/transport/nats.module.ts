import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from 'qeai-sdk';
import { envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natServers,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
