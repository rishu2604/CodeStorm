import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { BidsService } from './bids/bids.service';
import { BidsController } from './bids/bids.controller';
import { BidsModule } from './bids/bids.module';
import { ChatsService } from './chats/chats.service';
import { ChatsController } from './chats/chats.controller';
import { ChatsModule } from './chats/chats.module';
import { ListingsService } from './listings/listings.service';
import { ListingsModule } from './listings/listings.module';
import { PaymentsService } from './payments/payments.service';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { ProductModule } from './product/product.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PrismaModule, BidsModule, ChatsModule, ListingsModule, PaymentsModule, OrdersModule, UsersModule, ProductModule, CategoriesModule],
  controllers: [AppController, ProductController, BidsController, ChatsController, UsersController],
  providers: [AppService, PrismaService, BidsService, ChatsService, ListingsService, PaymentsService, UsersService],
})
export class AppModule {}
