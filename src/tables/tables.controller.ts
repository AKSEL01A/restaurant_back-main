import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './types/dtos/create-table.dto';
import { UpdateTableDto } from './types/update-table.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';





@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tableService: TablesService) { }

  @Roles('admin')
  @Get('count')
  async getTableCount(): Promise<{ totalTables: number }> {
    const totalTables = await this.tableService.countTables();
    return { totalTables };
  }
  @Roles('manager', 'admin')
  @Post()
  createTable(@Body() createTableDto: CreateTableDto) {
    return this.tableService.createTable(createTableDto);
  }
  @Roles('manager', 'Customer', 'admin')
  @Get()
  async getTable() {
    return this.tableService.getTable();
  }
  @Roles('manager', 'Customer', 'admin')
  @Get(':id')
  async getTableById(@Param('id', ParseUUIDPipe) id: string) {
    return this.tableService.getTableById(id);
  }

  @Roles('manager', 'admin')
  @Patch(':id')
  async updateTable(@Param('id') id: string, @Body() UpdateTableDto: UpdateTableDto) {
    return this.tableService.updateTable(id, UpdateTableDto);
  }
  @Roles('manager', 'admin')
  @Delete(':id')
  async deleteTable(@Param('id') id: string) {
    return this.tableService.delete(id);
  }

  @Roles('manager', 'admin')
  @Patch(':id/status')
  async updateTableStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.tableService.updateStatus(id, status);
  }

}


