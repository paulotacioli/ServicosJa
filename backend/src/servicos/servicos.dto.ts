import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';

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

export class EditarServicoDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  fotos?: string[];

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  bairro?: string;
}

export class AceitarServicoDto {
  @IsNumber()
  @Min(0)
  valorProposto: number;
}

export class AprovarPrestadorDto {
  @IsString()
  prestadorId: string;
}

export class RecusarPrestadorDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
