import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() u: AuthUser) {
    return this.users.getMe(u.id);
  }

  @Patch('me/verificacao')
  updateVerificacao(@CurrentUser() u: AuthUser, @Body() body: { status: string }) {
    return this.users.updateStatusVerificacao(u.id, body.status);
  }

  @Get('prestadores/:id')
  prestador(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.users.getPrestadorProfile(id, u.id);
  }
}
