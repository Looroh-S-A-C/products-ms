import { connect, NatsConnection } from "nats";
import { envs } from "src/config";

let natsConnection: NatsConnection | null = null;

export async function getNatsConnection(): Promise<NatsConnection> {
  if (!natsConnection) {
    natsConnection = await connect({
      servers: envs.natServers,
    });
  }
  return natsConnection;
}
