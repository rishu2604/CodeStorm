// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus, SaleType } from 'generated/prisma/enums';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: OrderStatus,
    @Query('saleType') saleType?: SaleType,
    @Query('buyerId') buyerId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('listingId') listingId?: string,
  ) {
    const where = {
      ...(status && { orderStatus: status }),
      ...(saleType && { saleType }),
      ...(buyerId && { buyerId }),
      ...(sellerId && { sellerId }),
      ...(listingId && { listingId }),
    };

    return this.ordersService.findAll({
      skip,
      take: take > 100 ? 100 : take, // Limit take to 100
      where,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: any,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }

  @Get('user/:userId')
  getUserOrders(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('role') role: 'buyer' | 'seller',
  ) {
    return this.ordersService.getUserOrders(userId, role);
  }

  @Get('user/:userId/stats')
  getOrderStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.ordersService.getOrderStats(userId);
  }
}