import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ConnectBotDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+:[A-Za-z0-9_-]{35,}$/, {
    message:
      'Invalid bot token format. Expected format: numbers:alphanumeric_with_dashes_underscores',
  })
  token: string;
}

export class CreateBotDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+:[A-Za-z0-9_-]{35,}$/, {
    message:
      'Invalid bot token format. Expected format: numbers:alphanumeric_with_dashes_underscores',
  })
  token: string;
}
