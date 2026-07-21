-- Normaliza a MAYÚSCULAS los textos ya existentes en Archivos, para orden visual.
-- Solo columnas de texto libre (nombres, direcciones, referencia, ocupación, cargo, CMP);
-- NO toca enums/selects (tipo, formato, categoría, unidad, estatus, sexo, estado civil,
-- especialidad), ni correos, documentos ni fechas. Los formularios ya fuerzan mayúsculas
-- en estos mismos campos. Idempotente: UPPER() aplicado de nuevo da el mismo resultado.
UPDATE "Servicio"     SET nombre = UPPER(nombre);
UPDATE "Analisis"     SET nombre = UPPER(nombre);
UPDATE "Paquete"      SET nombre = UPPER(nombre);
UPDATE "TipoConsulta" SET nombre = UPPER(nombre);
UPDATE "Producto"     SET nombre = UPPER(nombre);
UPDATE "Material"     SET nombre = UPPER(nombre);
UPDATE "Centro"       SET nombre = UPPER(nombre), direccion = UPPER(direccion), referencia = UPPER(referencia);
UPDATE "Laboratorio"  SET nombre = UPPER(nombre), direccion = UPPER(direccion), referencia = UPPER(referencia);
UPDATE "Personal"     SET nombres = UPPER(nombres), apellidos = UPPER(apellidos), cargo = UPPER(cargo), direccion = UPPER(direccion);
UPDATE "Paciente"     SET nombres = UPPER(nombres), apellidos = UPPER(apellidos), ocupacion = UPPER(ocupacion), direccion = UPPER(direccion);
UPDATE "Profesional"  SET nombres = UPPER(nombres), apellidos = UPPER(apellidos), cmp = UPPER(cmp);
