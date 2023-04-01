import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { BanQueryRepository } from './bam.query.repository';
import { Ban, BanSchema } from './schemas/ban.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ban.name, schema: BanSchema }]),
    CqrsModule,
  ],
  providers: [BanQueryRepository],
})
export class BanModule {}
