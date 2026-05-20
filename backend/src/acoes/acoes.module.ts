import { Module } from '@nestjs/common';
import { AcoesService } from './acoes.service';

@Module({
  providers: [AcoesService],
  exports: [AcoesService],
})
export class AcoesModule {}
