import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Limpando banco...');
  await prisma.notificacao.deleteMany();
  await prisma.acaoServico.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🌱 Criando usuários...');
  const senhaHash = await bcrypt.hash('demo', 10);

  const maria = await prisma.usuario.create({
    data: {
      tipo: 'solicitante',
      nome: 'Maria Costa',
      email: 'maria@demo.com',
      senhaHash,
      whatsapp: '+5511988880001',
      cidade: 'São Paulo',
    },
  });

  const joao = await prisma.usuario.create({
    data: {
      tipo: 'prestador',
      nome: 'João Pereira',
      email: 'joao@demo.com',
      senhaHash,
      whatsapp: '+5511988880002',
      cidade: 'São Paulo',
      descricao:
        'Eletricista e encanador autônomo com mais de 10 anos de experiência. Atendo emergências.',
      categorias: 'Encanamento e hidráulica,Elétrica,Reparos em eletrodomésticos',
      bairros: 'Pinheiros,Vila Madalena,Itaim Bibi,Jardins,Moema',
      servicosConcluidos: 28,
    },
  });

  const carlos = await prisma.usuario.create({
    data: {
      tipo: 'prestador',
      nome: 'Carlos Lima',
      email: 'carlos@demo.com',
      senhaHash,
      whatsapp: '+5511988880003',
      cidade: 'São Paulo',
      descricao: 'Pintor e marceneiro. Orçamento sem compromisso, pontualidade garantida.',
      categorias:
        'Pintura,Marcenaria e montagem de móveis,Pedreiro e reformas pequenas',
      bairros: 'Pinheiros,Vila Madalena,Perdizes,Lapa',
      servicosConcluidos: 41,
    },
  });

  console.log('🌱 Criando serviços de exemplo...');
  await prisma.servico.create({
    data: {
      solicitanteId: maria.id,
      titulo: 'Vazamento na pia da cozinha',
      descricao:
        'A torneira está pingando há dois dias e parece que tem água acumulando dentro do armário embaixo da pia. Preciso resolver com urgência antes que estrague a madeira.',
      categoria: 'Encanamento e hidráulica',
      fotos: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80',
      cidade: 'São Paulo',
      bairro: 'Pinheiros',
      estado: 'ABERTO',
    },
  });

  await prisma.servico.create({
    data: {
      solicitanteId: maria.id,
      titulo: 'Pintar parede da sala',
      descricao:
        'Sala de 18m² com pé direito normal. Quero trocar a cor de branco para um cinza claro. Preciso que o profissional já traga a tinta na cor escolhida.',
      categoria: 'Pintura',
      fotos: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80',
      cidade: 'São Paulo',
      bairro: 'Pinheiros',
      estado: 'ABERTO',
    },
  });

  console.log('✅ Seed concluído!');
  console.log('');
  console.log('Logins de demonstração:');
  console.log('  Solicitante:  maria@demo.com   / demo');
  console.log('  Prestador 1:  joao@demo.com    / demo');
  console.log('  Prestador 2:  carlos@demo.com  / demo');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
