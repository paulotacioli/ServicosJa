import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { NotificacoesService } from './notificacoes.service';

@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
export class NotificacoesController {
  constructor(private svc: NotificacoesService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.svc.list(u.id);
  }

  @Get('unread-count')
  unread(@CurrentUser() u: AuthUser) {
    return this.svc.unreadCount(u.id).then((n) => ({ count: n }));
  }

  @Post(':id/lida')
  marcarLida(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.svc.marcarLida(id, u.id);
  }

  @Post('todas-lidas')
  todasLidas(@CurrentUser() u: AuthUser) {
    return this.svc.marcarTodasLidas(u.id);
  }
}
