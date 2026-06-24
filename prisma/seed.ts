import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpieza (respetando FKs)
  await prisma.diagnostico.deleteMany();
  await prisma.tratamiento.deleteMany();
  await prisma.historiaClinica.deleteMany();
  await prisma.controlPrenatal.deleteMany();
  await prisma.historiaPediatrica.deleteMany();
  await prisma.consulta.deleteMany();
  await prisma.gestacion.deleteMany();
  await prisma.tipoConsulta.deleteMany();
  await prisma.cie10.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.atencionItem.deleteMany();
  await prisma.atencion.deleteMany();
  await prisma.user.deleteMany();
  await prisma.paquete.deleteMany();
  await prisma.profesional.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.analisis.deleteMany();
  await prisma.centro.deleteMany();
  await prisma.laboratorio.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.material.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.sede.deleteMany();
  await prisma.role.deleteMany();

  // Roles (ids del sistema original)
  await prisma.role.createMany({
    data: [
      { id: 1, nombre: 'Administrador', descripcion: 'Acceso total' },
      { id: 2, nombre: 'Admin. Financiero', descripcion: 'Caja, cobros y comisiones' },
      { id: 7, nombre: 'Personal Clínico', descripcion: 'Atenciones, consultas e historias' },
      { id: 10, nombre: 'Técnico de Laboratorio', descripcion: 'Resultados y análisis' },
      { id: 11, nombre: 'Visitador Médico', descripcion: 'Comisiones y visitas' },
      { id: 12, nombre: 'Gerente Sede C', descripcion: 'Reportes y finanzas de la sede' },
    ],
  });

  // Sedes
  // IDs explícitos y estables (coinciden con SEDES del frontend)
  const principal = await prisma.sede.create({ data: { id: 1, nombre: 'Sede Principal' } });
  const intimas2 = await prisma.sede.create({ data: { id: 2, nombre: 'Intimas 2' } });

  // Usuarios demo (contraseña: intimas123)
  const pass = await bcrypt.hash('intimas123', 10);
  await prisma.user.createMany({
    data: [
      { nombre: 'Erik Zerpa', email: 'admin@intimas.pe', password: pass, roleId: 1, sedeId: principal.id, title: 'Administrador General' },
      { nombre: 'Lucía Ramírez', email: 'finanzas@intimas.pe', password: pass, roleId: 2, sedeId: principal.id, title: 'Jefa de Finanzas' },
      { nombre: 'Dra. Carmen Salas', email: 'clinica@intimas.pe', password: pass, roleId: 7, sedeId: principal.id, title: 'Médico Tratante' },
      { nombre: 'José Quispe', email: 'laboratorio@intimas.pe', password: pass, roleId: 10, sedeId: principal.id, title: 'Tecnólogo de Laboratorio' },
      { nombre: 'Marco Ruiz', email: 'visitador@intimas.pe', password: pass, roleId: 11, sedeId: principal.id, title: 'Visitador Médico' },
      { nombre: 'Patricia León', email: 'gerencia@intimas.pe', password: pass, roleId: 12, sedeId: intimas2.id, title: 'Gerente Sede C' },
    ],
  });

  // Centros
  const centroData = [
    { nombre: 'Sede Principal', direccion: 'Av. Los Próceres 1200', referencia: 'Frente al parque central' },
    { nombre: 'Intimas 2', direccion: 'Jr. Comercio 540', referencia: 'A media cuadra del mercado' },
    { nombre: 'Centro Médico Norte', direccion: 'Av. Universitaria 2330', referencia: 'Cruce con Av. Perú' },
    { nombre: 'Policlínico San Juan', direccion: 'Calle Lima 88', referencia: 'Costado de la municipalidad' },
    { nombre: 'Consultorio Santa Rosa', direccion: 'Av. Salaverry 410', referencia: 'Edificio Santa Rosa, piso 2' },
  ];
  const centroId: Record<string, number> = {};
  for (const c of centroData) centroId[c.nombre] = (await prisma.centro.create({ data: c })).id;

  await prisma.laboratorio.createMany({
    data: [
      { nombre: 'Laboratorio Central Intimas', direccion: 'Av. Los Próceres 1200, sótano', referencia: 'Dentro de la Sede Principal' },
      { nombre: 'Lab. Referencia BioAnálisis', direccion: 'Av. Brasil 980', referencia: 'Convenio externo' },
      { nombre: 'Patología Molecular S.A.C.', direccion: 'Calle Las Begonias 320', referencia: 'Solo pruebas especializadas' },
      { nombre: 'Lab. Intimas 2', direccion: 'Jr. Comercio 540, piso 1', referencia: 'Toma de muestras' },
    ],
  });

  // Servicios
  const servData = [
    { nombre: 'Ecografía obstétrica', tipo: 'Ecografía', precio: 80, porcentajePers: 10, porcentajeProf: 40, porcentajeTecn: 0 },
    { nombre: 'Ecografía transvaginal', tipo: 'Ecografía', precio: 90, porcentajePers: 10, porcentajeProf: 45, porcentajeTecn: 0 },
    { nombre: 'Ecografía mamaria', tipo: 'Ecografía', precio: 100, porcentajePers: 10, porcentajeProf: 45, porcentajeTecn: 0 },
    { nombre: 'Radiografía de tórax', tipo: 'Rayos X', precio: 70, porcentajePers: 15, porcentajeProf: 0, porcentajeTecn: 30 },
    { nombre: 'Consulta psicológica', tipo: 'Salud Mental', precio: 120, porcentajePers: 10, porcentajeProf: 50, porcentajeTecn: 0 },
    { nombre: 'Consulta ginecológica', tipo: 'Otros', precio: 60, porcentajePers: 10, porcentajeProf: 50, porcentajeTecn: 0 },
    { nombre: 'Papanicolaou', tipo: 'Otros', precio: 45, porcentajePers: 15, porcentajeProf: 20, porcentajeTecn: 20 },
    { nombre: 'Densitometría ósea', tipo: 'Rayos X', precio: 130, porcentajePers: 10, porcentajeProf: 0, porcentajeTecn: 35 },
  ];
  const servId: Record<string, number> = {};
  for (const s of servData) servId[s.nombre] = (await prisma.servicio.create({ data: s })).id;

  // Análisis
  const anaData = [
    { nombre: 'Hemograma completo', precio: 35, costo: 12, porcentaje: 65, tiempo: '24 h', material: 'Sangre' },
    { nombre: 'Perfil hormonal', precio: 120, costo: 55, porcentaje: 54, tiempo: '48 h', material: 'Suero' },
    { nombre: 'Glucosa basal', precio: 15, costo: 5, porcentaje: 66, tiempo: '6 h', material: 'Sangre' },
    { nombre: 'Perfil lipídico', precio: 45, costo: 18, porcentaje: 60, tiempo: '24 h', material: 'Suero' },
    { nombre: 'Examen completo de orina', precio: 20, costo: 6, porcentaje: 70, tiempo: '12 h', material: 'Orina' },
    { nombre: 'Prueba de embarazo (β-HCG)', precio: 40, costo: 14, porcentaje: 65, tiempo: '24 h', material: 'Sangre' },
    { nombre: 'TSH', precio: 50, costo: 22, porcentaje: 56, tiempo: '48 h', material: 'Suero' },
    { nombre: 'Cultivo vaginal', precio: 60, costo: 25, porcentaje: 58, tiempo: '72 h', material: 'Hisopado' },
  ];
  const anaId: Record<string, number> = {};
  for (const a of anaData) anaId[a.nombre] = (await prisma.analisis.create({ data: a })).id;

  // Tipos de consulta
  const tipoConData = [
    { nombre: 'Consulta ginecológica', precio: 60, especialidad: 'Ginecología', prenatal: false, gineco: true, formato: 'ginecologica' },
    { nombre: 'Control prenatal', precio: 50, especialidad: 'Obstetricia', prenatal: true, formato: 'prenatal' },
    { nombre: 'Consulta psicológica', precio: 120, especialidad: 'Psicología', prenatal: false, formato: 'general' },
    { nombre: 'Medicina general', precio: 40, especialidad: 'Medicina General', prenatal: false, formato: 'general' },
    { nombre: 'Consulta nutricional', precio: 70, especialidad: 'Nutrición', prenatal: false, formato: 'general' },
    { nombre: 'Consulta pediátrica', precio: 55, especialidad: 'Pediatría', prenatal: false, pediatrico: true, formato: 'pediatrico' },
  ];
  const tipoConId: Record<string, number> = {};
  for (const t of tipoConData) tipoConId[t.nombre] = (await prisma.tipoConsulta.create({ data: t })).id;

  // Catálogo CIE-10 (set común gineco / obstetricia / medicina general)
  await prisma.cie10.createMany({
    data: [
      { codigo: 'Z00.0', descripcion: 'Examen médico general' },
      { codigo: 'Z01.4', descripcion: 'Examen ginecológico (de rutina)' },
      { codigo: 'Z30.9', descripcion: 'Atención para la anticoncepción, no especificada' },
      { codigo: 'Z34.9', descripcion: 'Supervisión de embarazo normal, no especificado' },
      { codigo: 'Z39.1', descripcion: 'Atención y examen de la madre en lactancia' },
      { codigo: 'N76.0', descripcion: 'Vaginitis aguda' },
      { codigo: 'N72', descripcion: 'Enfermedad inflamatoria del cuello uterino' },
      { codigo: 'N89.8', descripcion: 'Otros trastornos no inflamatorios de la vagina' },
      { codigo: 'N94.6', descripcion: 'Dismenorrea, no especificada' },
      { codigo: 'N91.2', descripcion: 'Amenorrea, no especificada' },
      { codigo: 'N92.0', descripcion: 'Menstruación excesiva y frecuente con ciclo regular' },
      { codigo: 'N95.1', descripcion: 'Estados menopáusicos y climatéricos femeninos' },
      { codigo: 'B37.3', descripcion: 'Candidiasis de la vulva y de la vagina' },
      { codigo: 'A59.0', descripcion: 'Tricomoniasis urogenital' },
      { codigo: 'O23.9', descripcion: 'Infección de vías urinarias en el embarazo' },
      { codigo: 'O26.9', descripcion: 'Complicación relacionada con el embarazo' },
      { codigo: 'D50.9', descripcion: 'Anemia por deficiencia de hierro' },
      { codigo: 'E66.9', descripcion: 'Obesidad, no especificada' },
      { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2, sin complicaciones' },
      { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
      { codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' },
      { codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada' },
      { codigo: 'A09', descripcion: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
      { codigo: 'K30', descripcion: 'Dispepsia funcional' },
      { codigo: 'M54.5', descripcion: 'Lumbago no especificado' },
      { codigo: 'R51', descripcion: 'Cefalea' },
      { codigo: 'R10.4', descripcion: 'Dolor abdominal, no especificado' },
      { codigo: 'F41.9', descripcion: 'Trastorno de ansiedad, no especificado' },
      { codigo: 'F32.9', descripcion: 'Episodio depresivo, no especificado' },
      { codigo: 'L20.9', descripcion: 'Dermatitis atópica, no especificada' },
    ],
  });

  // Profesionales
  const profData = [
    { nombres: 'Patricia', apellidos: 'Núñez Salinas', cmp: 'CMP 45821', nacimiento: '1980-03-12', especialidad: 'Ginecología', centro: 'Sede Principal', telefono: '987112233' },
    { nombres: 'Roberto', apellidos: 'Aguilar Pérez', cmp: 'CMP 38120', nacimiento: '1975-08-22', especialidad: 'Obstetricia', centro: 'Sede Principal', telefono: '961445566' },
    { nombres: 'Elena', apellidos: 'Vargas Loayza', cmp: 'CMP 51209', nacimiento: '1988-11-05', especialidad: 'Ecografía', centro: 'Intimas 2', telefono: '934778899' },
    { nombres: 'Daniel', apellidos: 'Espinoza Cruz', cmp: 'CMP 42990', nacimiento: '1983-01-19', especialidad: 'Urología', centro: 'Intimas 2', telefono: '920334455' },
    { nombres: 'Sofía', apellidos: 'Rojas Medina', cmp: 'CPP 7781', nacimiento: '1990-06-30', especialidad: 'Psicología', centro: 'Sede Principal', telefono: '955667788' },
    { nombres: 'Miguel', apellidos: 'Torres Campos', cmp: 'CMP 33450', nacimiento: '1972-09-14', especialidad: 'Medicina General', centro: 'Centro Médico Norte', telefono: '913220099' },
    { nombres: 'Carla', apellidos: 'Benites Flores', cmp: 'CMP 60112', nacimiento: '1992-12-02', especialidad: 'Pediatría', centro: 'Sede Principal', telefono: '942889900' },
  ];
  for (const p of profData) {
    await prisma.profesional.create({
      data: {
        nombres: p.nombres, apellidos: p.apellidos, cmp: p.cmp,
        nacimiento: new Date(p.nacimiento), telefono: p.telefono,
        especialidad: p.especialidad, centroId: centroId[p.centro] ?? null,
        consultorio: 'Consultorio 1', turno: 'Mañana', codigoSalud: p.cmp ?? null,
      },
    });
  }

  await prisma.personal.createMany({
    data: [
      { nombres: 'Gabriela', apellidos: 'Paredes Soto', dni: '44210987', cargo: 'Recepción', tipo: 'Recepcionista', sesion: false, telefono: '987001122', email: 'gparedes@intimas.pe', direccion: 'Av. Grau 220' },
      { nombres: 'Luis', apellidos: 'Castillo Ramos', dni: '41887200', cargo: 'Tecnólogo médico', tipo: 'Tecnólogo', sesion: true, telefono: '961334455', email: 'lcastillo@intimas.pe', direccion: 'Jr. Junín 410' },
      { nombres: 'Mónica', apellidos: 'Flores Díaz', dni: '70554120', cargo: 'Enfermera', tipo: 'Prof. de Salud', sesion: false, telefono: '934667788', email: 'mflores@intimas.pe', direccion: 'Calle Real 90' },
      { nombres: 'Andrés', apellidos: 'Quiroz Lazo', dni: '42119876', cargo: 'Mantenimiento', tipo: 'Mantenimiento', sesion: false, telefono: '920889911', email: 'aquiroz@intimas.pe', direccion: 'Av. Perú 1200' },
      { nombres: 'Teresa', apellidos: 'Ramírez Acuña', dni: '45302188', cargo: 'Caja', tipo: 'Otro', sesion: false, telefono: '955220011', email: 'tramirez@intimas.pe', direccion: 'Jr. Lima 33' },
      { nombres: 'Víctor', apellidos: 'Sánchez Pérez', dni: '43771209', cargo: 'Vigilancia', tipo: 'Seguridad', sesion: false, telefono: '913440022', email: 'vsanchez@intimas.pe', direccion: 'Av. Salaverry 700' },
    ],
  });

  await prisma.producto.createMany({
    data: [
      { nombre: 'Dispositivo intrauterino (DIU)', categoria: 'Métodos', unidad: 'Unidad', minimoCentral: 50, minimoLocal: 10 },
      { nombre: 'Ampolla anticonceptiva mensual', categoria: 'Métodos', unidad: 'Ampolla', minimoCentral: 120, minimoLocal: 30 },
      { nombre: 'Guantes quirúrgicos estériles', categoria: 'Insumos', unidad: 'Caja', minimoCentral: 40, minimoLocal: 8 },
      { nombre: 'Gel para ecografía', categoria: 'Insumos', unidad: 'Frasco', minimoCentral: 25, minimoLocal: 6 },
      { nombre: 'Ácido fólico 5 mg', categoria: 'Medicamentos', unidad: 'Tableta', minimoCentral: 500, minimoLocal: 100 },
      { nombre: 'Tubo de ensayo tapa lila', categoria: 'Laboratorio', unidad: 'Unidad', minimoCentral: 300, minimoLocal: 60 },
      { nombre: 'Película radiográfica', categoria: 'Rayos X', unidad: 'Caja', minimoCentral: 15, minimoLocal: 3 },
      { nombre: 'Papel térmico para ecógrafo', categoria: 'Escritorio', unidad: 'Unidad', minimoCentral: 30, minimoLocal: 5 },
    ],
  });

  await prisma.material.createMany({
    data: [
      { nombre: 'Sangre total', estatus: 'Disponible' },
      { nombre: 'Suero', estatus: 'Disponible' },
      { nombre: 'Orina', estatus: 'Disponible' },
      { nombre: 'Hisopado vaginal', estatus: 'Disponible' },
      { nombre: 'Heces', estatus: 'Disponible' },
      { nombre: 'Plasma', estatus: 'Agotado' },
    ],
  });

  // Pacientes
  const pacData = [
    { nombres: 'María Elena', apellidos: 'Flores Quispe', tipoDoc: 'DNI', numDoc: '70215488', fechaNacimiento: '1992-04-18', sexo: 'Femenino', telefono: '987654321', email: 'maria.flores@gmail.com', ocupacion: 'Docente', estadoCivil: 'Casado(a)', direccion: 'Av. Los Próceres 234' },
    { nombres: 'Carlos Alberto', apellidos: 'Ramos León', tipoDoc: 'DNI', numDoc: '45821190', fechaNacimiento: '1985-11-02', sexo: 'Masculino', telefono: '961203847', email: 'cramos@hotmail.com', ocupacion: 'Ingeniero', estadoCivil: 'Soltero(a)', direccion: 'Jr. Amazonas 891' },
    { nombres: 'Lucía', apellidos: 'Huamán Torres', tipoDoc: 'DNI', numDoc: '73910022', fechaNacimiento: '1998-07-25', sexo: 'Femenino', telefono: '934118827', email: 'lucia.huaman@gmail.com', ocupacion: 'Estudiante', estadoCivil: 'Soltero(a)', direccion: 'Calle Las Gardenias 12' },
    { nombres: 'Rosa María', apellidos: 'Cárdenas Vega', tipoDoc: 'CE', numDoc: '002841558', fechaNacimiento: '1979-01-30', sexo: 'Femenino', telefono: '920458112', email: 'rosa.cardenas@gmail.com', ocupacion: 'Comerciante', estadoCivil: 'Conviviente', direccion: 'Av. Grau 1450' },
    { nombres: 'Jorge Luis', apellidos: 'Mendoza Ríos', tipoDoc: 'DNI', numDoc: '41209873', fechaNacimiento: '1990-09-14', sexo: 'Masculino', telefono: '955302118', email: 'jmendoza@gmail.com', ocupacion: 'Chofer', estadoCivil: 'Casado(a)', direccion: 'Jr. Tacna 320' },
    { nombres: 'Ana Paula', apellidos: 'Salazar Núñez', tipoDoc: 'DNI', numDoc: '76554321', fechaNacimiento: '2001-03-08', sexo: 'Femenino', telefono: '913882044', email: 'anapaula.s@gmail.com', ocupacion: 'Diseñadora', estadoCivil: 'Soltero(a)', direccion: 'Urb. Santa Rosa Mz. C Lt. 8' },
    { nombres: 'Carmen Rosa', apellidos: 'Díaz Paredes', tipoDoc: 'DNI', numDoc: '70019988', fechaNacimiento: '1995-06-11', sexo: 'Femenino', telefono: '938201577', email: 'carmen.diaz@gmail.com', ocupacion: 'Enfermera', estadoCivil: 'Soltero(a)', direccion: 'Calle Bolognesi 540' },
    { nombres: 'Mateo', apellidos: 'Rojas Campos', tipoDoc: 'DNI', numDoc: '88002211', fechaNacimiento: '2022-09-15', sexo: 'Masculino', telefono: '987111222', email: '', ocupacion: 'Lactante mayor', estadoCivil: 'Soltero(a)', direccion: 'Av. Primavera 145' },
  ];
  const ALERG = ['Ninguna conocida', 'Penicilina', 'AINEs', 'Sulfas', 'Ninguna conocida', 'Mariscos', 'Polen'];
  const PATOL = ['Sin antecedentes relevantes', 'Hipertensión controlada', 'Anemia leve', 'Migraña', 'Diabetes tipo 2', 'Sin antecedentes relevantes', 'Hipotiroidismo'];
  const FAMIL = ['Madre con diabetes tipo 2', 'Padre hipertenso', 'Sin antecedentes', 'Cáncer de mama (tía)', 'Sin antecedentes', 'Cardiopatía familiar', 'Sin antecedentes'];
  const GRUPO = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'O+'];
  const pacientes = [] as { id: number }[];
  let pidx = 0;
  for (const p of pacData) {
    pacientes.push(
      await prisma.paciente.create({
        data: {
          ...p,
          fechaNacimiento: new Date(p.fechaNacimiento),
          alergias: ALERG[pidx % ALERG.length],
          antPatologicos: PATOL[pidx % PATOL.length],
          antFamiliares: FAMIL[pidx % FAMIL.length],
          grupoSanguineo: GRUPO[pidx % GRUPO.length],
        },
      }),
    );
    pidx++;
  }

  // Paquetes (conectando servicios y análisis por nombre)
  const paqData = [
    { nombre: 'Paquete Prenatal Básico', precio: 250, porcentaje: 30, consultas: 3, controles: 2, servicios: ['Ecografía obstétrica', 'Consulta ginecológica'], analisis: ['Hemograma completo', 'Examen completo de orina'] },
    { nombre: 'Paquete Control Ginecológico', precio: 180, porcentaje: 28, consultas: 2, controles: 1, servicios: ['Papanicolaou', 'Ecografía transvaginal'], analisis: ['Perfil hormonal'] },
    { nombre: 'Paquete Fertilidad', precio: 420, porcentaje: 32, consultas: 2, controles: 2, servicios: ['Ecografía transvaginal'], analisis: ['Perfil hormonal', 'TSH'] },
    { nombre: 'Paquete Chequeo Mujer', precio: 320, porcentaje: 30, consultas: 1, controles: 1, servicios: ['Ecografía mamaria', 'Papanicolaou'], analisis: ['Hemograma completo', 'Perfil lipídico'] },
    { nombre: 'Paquete Salud Integral', precio: 200, porcentaje: 26, consultas: 1, controles: 0, servicios: ['Consulta ginecológica'], analisis: ['Glucosa basal', 'Perfil lipídico', 'Hemograma completo'] },
  ];
  for (const pq of paqData) {
    await prisma.paquete.create({
      data: {
        nombre: pq.nombre, precio: pq.precio, porcentaje: pq.porcentaje, consultas: pq.consultas, controles: pq.controles,
        servicios: { connect: pq.servicios.map((n) => ({ id: servId[n] })).filter((x) => x.id) },
        analisis: { connect: pq.analisis.map((n) => ({ id: anaId[n] })).filter((x) => x.id) },
      },
    });
  }

  // Atenciones de ejemplo (con ledger de pagos)
  const admin = await prisma.user.findFirst({ where: { roleId: 1 } });
  const adminId = admin?.id ?? null;

  type SeedItem = { kind: string; nombre: string; monto: number };
  type SeedPago = { monto: number; metodo: string };
  async function crearAtencion(
    pacienteId: number, origenTipo: string, origenValor: string,
    items: SeedItem[], pagos: SeedPago[], obs = '',
  ) {
    const total = items.reduce((a, b) => a + b.monto, 0);
    const pagado = pagos.reduce((a, b) => a + b.monto, 0);
    const saldo = total - pagado;
    const estado = saldo <= 0 ? 'Pagado' : pagado <= 0 ? 'Pendiente' : 'Parcial';
    await prisma.atencion.create({
      data: {
        pacienteId, origenTipo, origenValor, observaciones: obs,
        sedeId: 1, usuarioId: adminId, total, pagado, saldo, estado,
        items: { create: items },
        pagos: { create: pagos.map((p) => ({ monto: p.monto, metodo: p.metodo, tipo: 'ABONO_INICIAL', sedeId: 1, usuarioId: adminId })) },
      },
    });
  }

  await crearAtencion(
    pacientes[0].id, 'Profesional', 'Patricia Núñez Salinas',
    [{ kind: 'Ecografía', nombre: 'Ecografía obstétrica', monto: 80 }, { kind: 'Consulta', nombre: 'Consulta ginecológica', monto: 60 }],
    [{ monto: 80, metodo: 'Efectivo' }, { monto: 60, metodo: 'Yape' }],
  );
  await crearAtencion(
    pacientes[5].id, 'Profesional', 'Roberto Aguilar Pérez',
    [{ kind: 'Paquete', nombre: 'Paquete Control Ginecológico', monto: 180 }],
    [{ monto: 100, metodo: 'Efectivo' }],
    'Abono parcial, completa la próxima visita.',
  );

  // Gastos de ejemplo
  await prisma.gasto.createMany({
    data: [
      { descripcion: 'Compra de insumos de laboratorio', categoria: 'Insumos', monto: 240, metodo: 'Efectivo', proveedor: 'BioSupply S.A.C.', sedeId: 1, usuarioId: adminId },
      { descripcion: 'Recibo de luz', categoria: 'Servicios', monto: 380, metodo: 'Depósito', sedeId: 1, usuarioId: adminId },
      { descripcion: 'Mantenimiento de ecógrafo', categoria: 'Mantenimiento', monto: 150, metodo: 'Efectivo', proveedor: 'TecnoMed', sedeId: 1, usuarioId: adminId },
    ],
  });

  // Consultas / historias / controles de ejemplo
  const profGine = await prisma.profesional.findFirst({ where: { especialidad: 'Ginecología' } });
  const profObst = await prisma.profesional.findFirst({ where: { especialidad: 'Obstetricia' } });
  await prisma.consulta.create({
    data: { pacienteId: pacientes[2].id, tipoConsultaId: tipoConId['Consulta ginecológica'], tipoNombre: 'Consulta ginecológica', especialidad: 'Ginecología', gineco: true, especialistaId: profGine?.id ?? null, estado: 'Pendiente', sedeId: 1, usuarioId: adminId },
  });
  const cAtendida = await prisma.consulta.create({
    data: { pacienteId: pacientes[0].id, tipoConsultaId: tipoConId['Consulta ginecológica'], tipoNombre: 'Consulta ginecológica', especialidad: 'Ginecología', gineco: true, especialistaId: profGine?.id ?? null, estado: 'Atendida', sedeId: 1, usuarioId: adminId },
  });
  await prisma.historiaClinica.create({
    data: {
      consultaId: cAtendida.id, pacienteId: pacientes[0].id, especialistaId: profGine?.id ?? null,
      enfInicio: 'Insidioso', enfCurso: 'Estacionario', enfRelato: 'Acude para control ginecológico anual.',
      peso: '62', fc: '72', fr: '18', presionArterial: '110/70', talla: '1.62', temperatura: '36.6',
      examenGeneral: 'Paciente en buen estado general, sin hallazgos patológicos.',
      observaciones: 'Próxima cita en 12 meses. PAP de rutina.',
      diagnosticos: { create: [{ cie10: 'Z01.4', descripcion: 'Examen ginecológico de rutina' }] },
      tratamientos: { create: [{ medicamento: 'Ácido fólico 1mg', presentacion: 'Tableta', cantidad: '30', dosis: '1 diaria', dias: '30' }] },
    },
  });
  // Gestación abierta (carné) de Ana Paula, con 2 controles previos + 1 control pendiente
  const gest = await prisma.gestacion.create({
    data: {
      pacienteId: pacientes[5].id, estado: 'Abierta',
      gestas: 2, partos: 1, abortos: 0, cesareas: 0, vaginales: 1, nacidosVivos: 1, viven: 1, nacidosMuertos: 0,
      fum: new Date('2026-01-10'), fpp: new Date('2026-10-17'), tipoSangre: 'O', factorRh: 'RH +',
    },
  });
  const ctrlSeed = [
    { sem: 14, peso: '60', pa: '110/70', au: '14', fcf: '148', fecha: new Date('2026-04-10') },
    { sem: 18, peso: '62', pa: '110/70', au: '18', fcf: '150', fecha: new Date('2026-05-12') },
  ];
  for (const cd of ctrlSeed) {
    const cc = await prisma.consulta.create({
      data: { pacienteId: pacientes[5].id, tipoConsultaId: tipoConId['Control prenatal'], tipoNombre: 'Control prenatal', especialidad: 'Obstetricia', prenatal: true, especialistaId: profObst?.id ?? null, estado: 'Atendida', sedeId: 1, usuarioId: adminId, fecha: cd.fecha },
    });
    await prisma.controlPrenatal.create({
      data: {
        consultaId: cc.id, gestacionId: gest.id, pacienteId: pacientes[5].id, especialistaId: profObst?.id ?? null, fecha: cd.fecha,
        semanaGestacional: cd.sem, peso: cd.peso, presionArterial: cd.pa, alturaUterina: cd.au, fcf: cd.fcf,
        movimientosFetales: 'Presentes', edema: 'No', sulfatoFerroso: 'Sí', diagnostico: 'Gestación de curso normal',
      },
    });
  }
  await prisma.consulta.create({
    data: { pacienteId: pacientes[5].id, tipoConsultaId: tipoConId['Control prenatal'], tipoNombre: 'Control prenatal', especialidad: 'Obstetricia', prenatal: true, especialistaId: profObst?.id ?? null, estado: 'Pendiente', sedeId: 1, usuarioId: adminId },
  });

  // Pediatría: 1 atendida (con historia pediátrica completa) + 1 pendiente — paciente Mateo (niño)
  const profPed = await prisma.profesional.findFirst({ where: { especialidad: 'Pediatría' } });
  const cPedAtendida = await prisma.consulta.create({
    data: { pacienteId: pacientes[7].id, tipoConsultaId: tipoConId['Consulta pediátrica'], tipoNombre: 'Consulta pediátrica', especialidad: 'Pediatría', pediatrico: true, especialistaId: profPed?.id ?? null, estado: 'Atendida', sedeId: 1, usuarioId: adminId, fecha: new Date('2026-06-10') },
  });
  await prisma.historiaPediatrica.create({
    data: {
      consultaId: cPedAtendida.id, pacienteId: pacientes[7].id, especialistaId: profPed?.id ?? null,
      informante: 'Madre', lugarNacimiento: 'Lima', procedencia: 'Lima', seguro: 'SIS',
      madreNombre: 'Carmen Campos Díaz', padreNombre: 'Luis Rojas Vega', servicioIngreso: 'Consultorio externo',
      motivoConsulta: 'Tos y fiebre', tiempoEnfermedad: '3 días', formaInicio: 'Brusco',
      relato: 'Madre refiere que hace 3 días el niño presenta tos seca, fiebre cuantificada en 38.5 °C y disminución del apetito. No ha presentado dificultad respiratoria ni vómitos.',
      funcionesBiologicas: 'Apetito disminuido, sueño conservado, orina y deposiciones normales.',
      revisionSistemas: 'Respiratorio: tos seca. Resto de sistemas sin alteraciones.',
      antPerinatales: 'Embarazo controlado (6 controles). Parto vaginal a término en clínica. Apgar 8/9. Lactancia materna desde la primera hora de vida.',
      pesoNacer: '3.2 kg', tallaNacer: '49 cm', apgar: '8 / 9',
      antNutricionales: 'Lactancia materna exclusiva hasta los 6 meses. Alimentación complementaria oportuna y adecuada. Actualmente integrado a la dieta familiar.',
      desarrollo: 'Sostén cefálico 3 m, sedestación 6 m, marcha 12 m, primeras palabras 12 m. Desarrollo psicomotor acorde a la edad.',
      escolaridad: 'Asiste a cuna-jardín.',
      inmunizaciones: 'Esquema completo para la edad según carné (BCG, HvB, pentavalente, polio, rotavirus, neumococo, influenza, SPR).',
      antPatologicos: 'Sin hospitalizaciones ni intervenciones quirúrgicas previas. Sin alergias conocidas.',
      antFamiliares: 'Madre con rinitis alérgica. Sin otros antecedentes de importancia.',
      antSocioeconomicos: 'Vive con ambos padres en vivienda propia con servicios básicos completos. Adecuada dinámica familiar.',
      peso: '15', talla: '0.98', pc: '49', imc: '15.6', fc: '110', fr: '28', ta: '90/60', temperatura: '38.2', percentiles: 'Peso P50 · Talla P50',
      inspeccionGeneral: 'Niño activo, reactivo, hidratado, sin signos de dificultad respiratoria. Buen estado general y nutricional.',
      dxPatologia: '1. Faringitis aguda de probable etiología viral\n2. Síndrome febril agudo',
      dxCrecimiento: '1. Crecimiento adecuado para la edad\n2. Estado nutricional normal',
      planEstudio: 'Manejo clínico. No requiere exámenes auxiliares por el momento.',
      planManejo: 'Paracetamol 15 mg/kg/dosis condicional a fiebre. Hidratación abundante. Reposo relativo. Control en 48 horas o antes si presenta signos de alarma.',
    },
  });
  await prisma.consulta.create({
    data: { pacienteId: pacientes[7].id, tipoConsultaId: tipoConId['Consulta pediátrica'], tipoNombre: 'Consulta pediátrica', especialidad: 'Pediatría', pediatrico: true, especialistaId: profPed?.id ?? null, estado: 'Pendiente', sedeId: 1, usuarioId: adminId },
  });

  console.log('Seed completado ✓');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
