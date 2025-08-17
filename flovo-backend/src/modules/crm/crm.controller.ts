import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { CRMService } from '../../core/crm/crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CRMController {
  constructor(private readonly crmService: CRMService) {}

  @Get('customers')
  async getAllCustomers(@CurrentUser() user: any) {
    return await this.crmService.getAllCustomers(user.userId);
  }

  @Get('customers/:customerId')
  async getCustomerProfile(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
  ) {
    return await this.crmService.getCustomerProfile(customerId, user.userId);
  }

  @Get('insights')
  async getCRMInsights(@CurrentUser() user: any) {
    return await this.crmService.getCRMInsights(user.userId);
  }

  @Put('customers/:customerId')
  async updateCustomerProfile(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
    @Body() updates: any,
  ) {
    return await this.crmService.updateCustomerProfile(customerId, user.userId, updates);
  }

  @Post('customers/:customerId/actions')
  async addCustomerAction(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
    @Body() action: any,
  ) {
    return await this.crmService.addCustomerAction(customerId, user.userId, action);
  }

  @Put('customers/:customerId/actions/:actionId/complete')
  async completeCustomerAction(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
    @Param('actionId') actionId: string,
    @Body() outcome: { outcome: string },
  ) {
    return await this.crmService.completeCustomerAction(customerId, user.userId, actionId, outcome.outcome);
  }
}
