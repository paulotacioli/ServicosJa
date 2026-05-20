import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ServicosService } from './servicos.service';
import { CreateServicoDto, RecusarPrestadorDto } from './servicos.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ServicosController {
  constructor(private servicos: ServicosService) {}

  // --- Solicitante ---
  @Post('servicos')
  publicar(@Body() dto: CreateServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.publicar(u.id, dto);
  }

  @Get('servicos/meus')
  meus(@CurrentUser() u: AuthUser) {
    return this.servicos.getMeus(u.id);
  }

  @Get('servicos/:id')
  detalhe(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.getOne(id, u.id);
  }

  @Post('servicos/:id/aprovar')
  aprovar(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.aprovar(id, u.id);
  }

  @Post('servicos/:id/recusar')
  recusar(@Param('id') id: string, @Body() dto: RecusarPrestadorDto, @CurrentUser() u: AuthUser) {
    return this.servicos.recusar(id, u.id, dto.motivo);
  }

  @Post('servicos/:id/concluir')
  concluir(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.concluir(id, u.id);
  }

  @Post('servicos/:id/cancelar')
  cancelar(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.cancelar(id, u.id);
  }

  // --- Prestador ---
  @Get('feed')
  feed(@CurrentUser() u: AuthUser) {
    return this.servicos.getFeed(u.id);
  }

  @Post('feed/:id/aceitar')
  aceitar(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.aceitar(id, u.id);
  }

  @Post('feed/:id/recusar')
  recusarSwipe(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.recusarSwipe(id, u.id);
  }

  @Get('aceites/meus')
  aceites(@CurrentUser() u: AuthUser) {
    return this.servicos.getMeusAceites(u.id);
  }
}
