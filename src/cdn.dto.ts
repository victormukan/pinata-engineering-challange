import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class DownloadFileRequestDto {
  @ApiProperty({ default: 'f374fca1-3113-408b-be1c-320d4be6d037' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ default: 'movie.mp4' })
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ default: 37.46 })
  @IsNumber()
  lat: number;

  @ApiProperty({ default: -122.24 })
  @IsNumber()
  long: number;
}

export class DownloadFileResponseDto {
  @ApiProperty({ default: 'f374fca1-3113-408b-be1c-320d4be6d037' })
  id: string;

  @ApiProperty({ default: 'CA:movie.mp4' })
  route: string;

  @ApiProperty({ default: true })
  cached: boolean;
}
