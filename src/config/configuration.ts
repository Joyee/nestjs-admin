import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { getConfig } from '../utils';

const { MYSQL_CONFIG, REDIS_CONFIG, LOGGER_CONFIG, JWT_CONFIG, WS_CONFIG } =
  getConfig();

export const getConfiguration = () =>
  ({
    jwt: {
      secret: JWT_CONFIG.secret || '123456',
    },
    database: {
      type: 'mysql',
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      database: MYSQL_CONFIG.database,
      username: MYSQL_CONFIG.username,
      password: MYSQL_CONFIG.password,
      entities: [__dirname + '/../**/entities/*.entity.{ts,js}'],
      autoLoadEntities: true,
      synchronize: true,
      logging: ['error'],
      timezone: '+08:00', // 东八区
    } as MysqlConnectionOptions,
    redis: {
      host: REDIS_CONFIG.host, // default value
      port: REDIS_CONFIG.port, // default value
      password: REDIS_CONFIG.auth,
      db: REDIS_CONFIG.db,
    },
    // logger config
    logger: {
      timestamp: false,
      dir: LOGGER_CONFIG.dir,
      maxFileSize: LOGGER_CONFIG.maxFileSize,
      maxFiles: LOGGER_CONFIG.maxFiles,
      errorLogName: LOGGER_CONFIG.errorLogName,
      appLogName: LOGGER_CONFIG.appLogName,
    },
    socket: {
      port: WS_CONFIG.port,
      path: WS_CONFIG.path,
    },
  } as const);

export type ConfigurationType = ReturnType<typeof getConfiguration>;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type ConfigurationKeyPaths = Record<NestedKeyOf<ConfigurationType>, any>;
