import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { ProfesionalesModule } from './profesionales/profesionales.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AnalisisModule } from './analisis/analisis.module';
import { LaboratoriosModule } from './laboratorios/laboratorios.module';
import { PaquetesModule } from './paquetes/paquetes.module';
import { PersonalModule } from './personal/personal.module';
import { CentrosModule } from './centros/centros.module';
import { ProductosModule } from './productos/productos.module';
import { MaterialModule } from './material/material.module';
import { AtencionesModule } from './atenciones/atenciones.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PacientesModule,
    ProfesionalesModule,
    ServiciosModule,
    AnalisisModule,
    LaboratoriosModule,
    PaquetesModule,
    PersonalModule,
    CentrosModule,
    ProductosModule,
    MaterialModule,
    AtencionesModule,
    DashboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
