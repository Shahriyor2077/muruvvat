import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { TelegrafModule } from "nestjs-telegraf";
import { BotModule } from "./bot/bot.module";
import * as dotenv from "dotenv";
dotenv.config()

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TelegrafModule.forRootAsync({
      botName: process.env.BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN!,
        middlewares: [],
        include: [],
      }),
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.PG_HOST!,
      username: process.env.PG_USER!,
      port: +process.env.PG_PORT!,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      models: [],
      autoLoadModels: true,
      sync: { alter: true },
      logging: false,
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
