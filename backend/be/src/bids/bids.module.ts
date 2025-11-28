import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [ListingsModule],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}