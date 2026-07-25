-- (1) Habilitar/deshabilitar usuarios: nueva columna. Deshabilita a los usuarios
--     demo (deja operativo solo al Super Admin, rol 1). No borra nada: reversible.
ALTER TABLE "User" ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;
UPDATE "User" SET "activo" = false WHERE "roleId" <> 1;

-- (2) Vaciar catálogos demo para cargar los reales (a pedido del cliente). IRREVERSIBLE.
--     Se desvinculan primero las referencias nullables a Profesional.
UPDATE "Consulta" SET "especialistaId" = NULL WHERE "especialistaId" IS NOT NULL;
UPDATE "Resultado" SET "profesionalId" = NULL WHERE "profesionalId" IS NOT NULL;
DELETE FROM "Profesional";
DELETE FROM "Personal";
DELETE FROM "Paquete";
