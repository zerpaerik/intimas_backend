-- Sincroniza nombres y descripciones de los roles con el sistema anterior (íntimas Laravel).
-- Data-only: no modifica el esquema. Idempotente (UPSERT por id).
-- No toca usuarios: User.roleId sigue apuntando a los mismos ids.
INSERT INTO "Role" (id, nombre, descripcion) VALUES
  (1,  'Super Administrador',     'Administración total del sistema'),
  (2,  'Administrador',           'Administrador de empresa'),
  (7,  'Recepcionista',           'Recepcionista de Empresa'),
  (10, 'PROFESIONAL DE LA SALUD', 'MEDICO/OBSTETRA'),
  (11, 'VISITADOR',               'VISITAS'),
  (12, 'ROL C',                   'ROL C')
ON CONFLICT (id) DO UPDATE
  SET nombre = EXCLUDED.nombre,
      descripcion = EXCLUDED.descripcion;
