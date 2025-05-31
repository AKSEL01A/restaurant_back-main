import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SystemConfigService } from './config.service';
import { CreateSystemConfigDto } from './types/dtos/create-system-config.dto';
import { UpdateSystemConfigDto } from './types/dtos/update-system-config.dto';


@ApiTags('system-config')
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {
    console.log(' SystemConfigController loaded');

  }



  
  @Get()
  @ApiOperation({ summary: 'Récupérer la configuration du système' })
  getConfig() {
    return this.systemConfigService.getConfig();
    
  }

  @Post()
  @ApiOperation({ summary: 'Créer une configuration système' })
  create(@Body() createDto: CreateSystemConfigDto) {
    return this.systemConfigService.createConfig(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une configuration système' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSystemConfigDto) {
    return this.systemConfigService.updateConfig(id, updateDto);
  }
}
