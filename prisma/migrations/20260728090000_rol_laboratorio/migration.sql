-- Rol nuevo: Laboratorio (id 13). Solo accede a resultados de laboratorio
-- (pendientes + guardados). La restricción de navegación es en el frontend.
INSERT INTO "Role" (id, nombre, descripcion) VALUES (13, 'Laboratorio', 'Solo resultados de laboratorio')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;
