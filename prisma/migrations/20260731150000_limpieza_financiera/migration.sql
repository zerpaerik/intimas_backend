-- Limpieza financiera a pedido del cliente (una sola vez). IRREVERSIBLE.
-- Se conservan: pacientes, historias/consultas clínicas (se desvinculan de su
-- atención pero quedan), usuarios, profesionales, personal y catálogos.
-- Borrar Atencion cascada a AtencionItem, Pago (con atención) y Resultado.
DELETE FROM "Pago";        -- cobros, abonos y otros ingresos
DELETE FROM "Gasto";
DELETE FROM "Cita";
DELETE FROM "Atencion";    -- cascada: ítems, resultados y pagos de la atención; Consulta.atencionId -> NULL
DELETE FROM "CajaSesion";  -- aperturas/cierres de caja
