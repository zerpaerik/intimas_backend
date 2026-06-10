-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sede" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT,
    "roleId" INTEGER NOT NULL,
    "sedeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDoc" TEXT,
    "numDoc" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "ocupacion" TEXT,
    "estadoCivil" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Centro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Centro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesional" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "cmp" TEXT,
    "nacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "especialidad" TEXT,
    "centroId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "cargo" TEXT,
    "tipo" TEXT,
    "sesion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT,
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentajePers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentajeProf" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentajeTecn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analisis" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tiempo" TEXT,
    "material" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analisis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'Disponible',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "unidad" TEXT,
    "minimoCentral" INTEGER NOT NULL DEFAULT 0,
    "minimoLocal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paquete" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consultas" INTEGER NOT NULL DEFAULT 0,
    "controles" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atencion" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pacienteId" INTEGER NOT NULL,
    "origenTipo" TEXT NOT NULL DEFAULT 'Personal',
    "origenValor" TEXT,
    "observaciones" TEXT,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "abono" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "usuarioId" INTEGER,
    "sedeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtencionItem" (
    "id" SERIAL NOT NULL,
    "atencionId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "abono" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pago" TEXT NOT NULL DEFAULT 'Efectivo',

    CONSTRAINT "AtencionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PaqueteAnalisis" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PaqueteAnalisis_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PaqueteServicios" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PaqueteServicios_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Atencion_fecha_idx" ON "Atencion"("fecha");

-- CreateIndex
CREATE INDEX "Atencion_pacienteId_idx" ON "Atencion"("pacienteId");

-- CreateIndex
CREATE INDEX "_PaqueteAnalisis_B_index" ON "_PaqueteAnalisis"("B");

-- CreateIndex
CREATE INDEX "_PaqueteServicios_B_index" ON "_PaqueteServicios"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atencion" ADD CONSTRAINT "Atencion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atencion" ADD CONSTRAINT "Atencion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atencion" ADD CONSTRAINT "Atencion_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtencionItem" ADD CONSTRAINT "AtencionItem_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "Atencion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaqueteAnalisis" ADD CONSTRAINT "_PaqueteAnalisis_A_fkey" FOREIGN KEY ("A") REFERENCES "Analisis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaqueteAnalisis" ADD CONSTRAINT "_PaqueteAnalisis_B_fkey" FOREIGN KEY ("B") REFERENCES "Paquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaqueteServicios" ADD CONSTRAINT "_PaqueteServicios_A_fkey" FOREIGN KEY ("A") REFERENCES "Paquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaqueteServicios" ADD CONSTRAINT "_PaqueteServicios_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
