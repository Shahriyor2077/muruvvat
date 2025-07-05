import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotUpdate } from './bot.update';
import { Bot } from './models/bot.model';

@Module({
  imports: [SequelizeModule.forFeature([Bot])],
  controllers: [],
  providers: [BotUpdate, BotService],
})
export class BotModule { }
