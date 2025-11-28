import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { CategoriesModule } from './categories/categories.module';
import { FavouritesModule } from './favourites/favourites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ListingsModule } from './listings/listings.module';
import { ChatsModule } from './chats/chats.module';
import { BidsModule } from './bids/bids.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CategoriesModule, FavouritesModule, ReviewsModule, UsersModule, AuthModule, OrdersModule, PaymentsModule, ListingsModule, ChatsModule, BidsModule, PrismaModule],
  controllers: [AppController, ProductController, OrdersController],
  providers: [AppService, OrdersService],
})
export class AppModule {}
