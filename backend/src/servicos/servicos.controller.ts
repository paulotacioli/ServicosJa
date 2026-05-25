import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ServicosService } from './servicos.service';
import { AceitarServicoDto, AprovarPrestadorDto, CreateServicoDto, EditarServicoDto } from './servicos.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ServicosController {
  constructor(private servicos: ServicosService) {}

  // --- Solicitante ---
  @Post('servicos')
  publicar(@Body() dto: CreateServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.publicar(u.id, dto);
  }

  @Patch('servicos/:id')
  editar(@Param('id') id: string, @Body() dto: EditarServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.editar(id, u.id, dto);
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
  aprovar(@Param('id') id: string, @Body() dto: AprovarPrestadorDto, @CurrentUser() u: AuthUser) {
    return this.servicos.aprovar(id, u.id, dto);
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
  aceitar(@Param('id') id: string, @Body() dto: AceitarServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.aceitar(id, u.id, dto);
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
