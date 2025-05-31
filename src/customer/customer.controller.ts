import { Controller, Get, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('customer')
@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get('check-availability')
    async checkAvailability(
        @Query('tableId') tableId: string,
        @Query('date') date: string,
        @Query('startTime') startTime: string,
    ) {
        return this.customerService.checkAvailability(tableId, date, startTime);
    }


}
