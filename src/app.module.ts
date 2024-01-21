import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { dataSourceOptions } from '../db/data-source';

// eslint-disable-next-line
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make config module available everywhere
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    // Rely on ormconfig.js file to handle multiple environments
    TypeOrmModule.forRoot(dataSourceOptions),
    // find the config service and have access to it during init of this module
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     return {
    //       type: 'sqlite',
    //       database: config.get<string>('DB_NAME'),
    //       entities: [User, Report],
    //       // very important and helpful for dev, but in production should use migrations
    //       // set to false before first deployment and never change back, to lock down schema
    //       synchronize: true,
    //     };
    //   },
    // }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Setting up a global pipe from within a module
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // security, strip out extraneous properties to request bodies
      }),
    },
  ],
})
export class AppModule {
  // Get access to the config module to pull env vars
  constructor(private configService: ConfigService) {}

  // Apply global middleware to app module for all routes
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')], // used to encrypt the info inside the cookie
        }),
      )
      .forRoutes('*');
  }
}
