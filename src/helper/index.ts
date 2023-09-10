import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  readonly data: T;

  @ApiProperty()
  readonly code: number;

  @ApiProperty()
  readonly message: string;

  constructor(code: number, data?: any, message = 'success') {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success(data?: any) {
    return new ResponseDto(200, data);
  }
}
