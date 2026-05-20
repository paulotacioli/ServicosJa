import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicosModule } from './servicos/servicos.module';
import { AcoesModule } from './acoes/acoes.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicosModule,
    AcoesModule,
    NotificacoesModule,
  ],
})
export class AppModule {}
