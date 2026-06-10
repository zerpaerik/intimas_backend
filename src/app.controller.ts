import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      name: 'Intimas API',
      status: 'ok',
      version: '0.1.0',
    };
  }
}
