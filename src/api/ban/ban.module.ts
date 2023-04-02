import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { BanRepository } from './ban.repository';
import { BanQueryRepository } from './ban.query.repository';
import { Ban, BanSchema } from './schemas/ban.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ban.name, schema: BanSchema }]),
    CqrsModule,
  ],
  providers: [BanRepository, BanQueryRepository],
})
export class BanModule {}
