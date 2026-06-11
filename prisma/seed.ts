import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpieza (respetando FKs)
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
  const principal = await prisma.sede.create({ data: { nombre: 'Sede Principal' } });
  const intimas2 = await prisma.sede.create({ data: { nombre: 'Intimas 2' } });

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

  // Atenciones de ejemplo
  const mkTotals = (items: { monto: number; abono: number }[]) => {
    const total = items.reduce((a, b) => a + b.monto, 0);
    const abono = items.reduce((a, b) => a + b.abono, 0);
    const saldo = total - abono;
    return { total, abono, saldo, estado: saldo <= 0 ? 'Pagado' : abono <= 0 ? 'Pendiente' : 'Parcial' };
  };
  const at1Items = [
    { kind: 'Ecografía', nombre: 'Ecografía obstétrica', monto: 80, abono: 80, pago: 'Efectivo' },
    { kind: 'Consulta', nombre: 'Consulta ginecológica', monto: 60, abono: 60, pago: 'Yape' },
  ];
  await prisma.atencion.create({
    data: {
      pacienteId: pacientes[0].id, origenTipo: 'Profesional', origenValor: 'Patricia Núñez Salinas',
      observaciones: '', ...mkTotals(at1Items), items: { create: at1Items },
    },
  });
  const at2Items = [{ kind: 'Paquete', nombre: 'Paquete Control Ginecológico', monto: 180, abono: 100, pago: 'Efectivo' }];
  await prisma.atencion.create({
    data: {
      pacienteId: pacientes[5].id, origenTipo: 'Profesional', origenValor: 'Roberto Aguilar Pérez',
      observaciones: 'Abono parcial, completa la próxima visita.', ...mkTotals(at2Items), items: { create: at2Items },
    },
  });

  console.log('Seed completado ✓');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
