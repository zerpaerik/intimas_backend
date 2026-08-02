-- Borra pacientes de PRUEBA (DNI de la familia 123456: 123456, 12345678,
-- 123456789, 0123456, etc.) y sus datos clínicos colgantes. IRREVERSIBLE.
-- No toca pacientes reales. Corre una sola vez en el deploy.
DELETE FROM "Resultado" WHERE "pacienteId" IN (SELECT id FROM "Paciente" WHERE "numDoc" LIKE '123456%' OR "numDoc" LIKE '0123456%');
DELETE FROM "Consulta"  WHERE "pacienteId" IN (SELECT id FROM "Paciente" WHERE "numDoc" LIKE '123456%' OR "numDoc" LIKE '0123456%');
DELETE FROM "Gestacion" WHERE "pacienteId" IN (SELECT id FROM "Paciente" WHERE "numDoc" LIKE '123456%' OR "numDoc" LIKE '0123456%');
UPDATE "Mensaje" SET "pacienteId" = NULL WHERE "pacienteId" IN (SELECT id FROM "Paciente" WHERE "numDoc" LIKE '123456%' OR "numDoc" LIKE '0123456%');
DELETE FROM "Paciente" WHERE "numDoc" LIKE '123456%' OR "numDoc" LIKE '0123456%';
