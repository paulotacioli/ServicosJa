import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @MaxLength(60)
  titulo: string;

  @IsString()
  @MaxLength(500)
  descricao: string;

  @IsString()
  categoria: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  fotos: string[];

  @IsString()
  cidade: string;

  @IsString()
  bairro: string;
}

export class RecusarPrestadorDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
