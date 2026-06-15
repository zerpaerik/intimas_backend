import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Zona horaria fija: Perú (UTC-5). Garantiza que "el día en curso" del dashboard,
// reportes y cierre de caja cuadre con la hora local del cliente, no con UTC del server.
process.env.TZ = process.env.TZ || 'America/Lima';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const allowed = (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, '')) // sin barra final
    .filter(Boolean);
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) => {
      if (!origin) return cb(null, true); // curl / health checks (sin Origin)
      if (allowed.includes('*')) return cb(null, true);
      const clean = origin.replace(/\/+$/, '');
      if (allowed.includes(clean)) return cb(null, true);
      try {
        // Conveniencia: permitir cualquier subdominio de Railway
        if (/\.up\.railway\.app$/.test(new URL(origin).hostname)) return cb(null, true);
      } catch {
        /* origin inválido */
      }
      return cb(null, false);
    },
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Intimas API escuchando en http://localhost:${port}/api`);
}
bootstrap();
