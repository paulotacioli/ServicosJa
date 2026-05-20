import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

  @Get('prestadores/:id')
  prestador(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.users.getPrestadorProfile(id, u.id);
  }
}
