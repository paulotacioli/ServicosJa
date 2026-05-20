import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('E-mail já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.prisma.usuario.create({
      data: {
        tipo: dto.tipo,
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        whatsapp: dto.whatsapp,
        cidade: dto.cidade,
        cep: dto.cep,
        estado: dto.estado,
        rua: dto.rua,
        numero: dto.numero,
        complemento: dto.complemento,
        descricao: dto.descricao,
        categorias: dto.categorias?.join(',') || null,
        bairros: dto.bairros?.join(',') || null,
      },
    });

    return this._withToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    return this._withToken(user);
  }

  private _withToken(user: any) {
    const payload = { sub: user.id, email: user.email, tipo: user.tipo };
    const token = this.jwt.sign(payload);
    const { senhaHash, ...safe } = user;
    return {
      token,
      user: {
        ...safe,
        categorias: safe.categorias ? safe.categorias.split(',') : [],
        bairros: safe.bairros ? safe.bairros.split(',') : [],
      },
    };
  }
}
