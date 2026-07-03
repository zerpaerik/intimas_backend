// Plantillas de informe migradas del sistema Intimas anterior (.doc/.docx → HTML).
// Solo el CUERPO del informe: la cabecera (paciente, examen, fecha, médico) y el
// membrete se renderizan al imprimir. Se auto-siembran si la tabla está vacía.

export type PlantillaSeed = { nombre: string; tipo: string; cuerpo: string };

export const PLANTILLAS_SEED: PlantillaSeed[] = [
  // ─────────────────────────── ECOGRAFÍAS / SERVICIOS ───────────────────────────
  {
    nombre: 'Ecografía obstétrica',
    tipo: 'Ecografía',
    cuerpo: `<p><strong>1.- FETO:</strong> Único, en situación y posición longitudinal con movimiento fetal y actividad cardiaca presente con 135 latidos por minuto.</p>
<p>Con la siguiente biometría fetal:</p>
<ul><li>DBP: 67.5 mm</li><li>PC: 247.8 mm</li><li>AC: 227.4 mm</li><li>LF: 47.7 mm</li></ul>
<p><strong>ANATOMÍA FETAL:</strong> Anatomía reconocible y visible sin alteraciones aparentes.</p>
<p><strong>2.- PLACENTA:</strong> Corporal posterior en grado I/III (según Grannum). Espesor placentario: 50 mm.</p>
<p><strong>3.- LÍQUIDO AMNIÓTICO:</strong> De volumen adecuado, pozo mayor de 65 mm.</p>
<p><strong>4.- CORDÓN UMBILICAL:</strong> 2 arterias y 1 vena.</p>
<p><strong>5.- PONDERADO FETAL:</strong> 972 gramos.</p>
<p><strong>6.- FPP POR ECO:</strong> __/__/____</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>GESTACIÓN ÚNICA ACTIVA DE ___ SEMANAS +/- 1 SEMANA POR BIOMETRÍA FETAL.</li></ul>
<p><em>La ecografía es un método de ayuda al diagnóstico no invasivo, no concluyente, sin valor médico legal.</em></p>`,
  },
  {
    nombre: 'Ecografía obstétrica — control (biometría)',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ultrasonográfico muestra:</p>
<p><strong>ÚTERO:</strong> Ocupado por un feto activo, en situación longitudinal, presentación cefálica y dorso a la ___ al momento del examen.</p>
<p><strong>BIOMETRÍA FETAL:</strong></p>
<ul><li>Diámetro biparietal: 72.8 mm</li><li>Perímetro cefálico: 271.4 mm</li><li>Perímetro abdominal: 254.2 mm</li><li>Longitud de fémur: 54.8 mm</li><li>Ponderado fetal: 1528 gr</li></ul>
<p><strong>BIENESTAR FETAL:</strong></p>
<ul><li>Actividad cardiaca: presente (138 x min)</li><li>Movimientos fetales: presentes</li></ul>
<p><strong>ANATOMÍA FETAL:</strong> Cráneo, tórax, cámara gástrica, riñones, vejiga, columna vertebral y extremidades normales.</p>
<p><strong>PLACENTA:</strong> Localización corporal posterior. Espesor 28 mm. Grado I/III.</p>
<p><strong>LÍQUIDO AMNIÓTICO:</strong> Adecuado. Pozo mayor 45 mm (VN: 30-80 mm).</p>
<p>No se aprecia circular de cordón en cuello fetal.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>GESTACIÓN ÚNICA ACTIVA DE ___ SEMANAS +/- 3 DÍAS POR BIOMETRÍA FETAL.</li><li>SE SUGIERE CONTROL POSTERIOR.</li></ul>`,
  },
  {
    nombre: 'Ecografía obstétrica morfológica (II trimestre)',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ultrasonográfico en tiempo real, utilizando transductor convexo, muestra:</p>
<p><strong>FETO</strong> único en:</p>
<ul><li>Situación: longitudinal</li><li>Polo: cefálico hacia la ___</li><li>Dorso: posterior, al momento del examen</li></ul>
<p><strong>BIOMETRÍA FETAL:</strong></p>
<ul><li>DBP: 46 mm (EG: 19 semanas)</li><li>Per. cefálico: 194 mm</li><li>Per. abdominal: 170 mm</li><li>LF: 31 mm</li><li>Ponderación fetal: 594 gr (Hadlock)</li></ul>
<p><strong>ANATOMÍA FETAL</strong></p>
<p><strong>Cráneo y estructuras cerebrales:</strong> tálamo, ventrículos laterales y hemisferios cerebrales impresionan dentro de la normalidad. Calota craneana de ecogenicidad conservada. Estructuras óseas del macizo facial conservadas.</p>
<p><strong>Tórax:</strong> corazón con 4 cámaras, sin defectos en tabiques auriculares y ventriculares, sin arritmias. Actividad cardiaca presente, rítmica, regular, 147 lpm. Grandes vasos sin alteraciones. Pulmones de tamaño y ecogenicidad normales.</p>
<p><strong>Abdomen:</strong> hígado, riñones, cavidad gástrica y vejiga ecográficamente conservados. Sin líquido libre en cavidad peritoneal.</p>
<p><strong>Columna vertebral:</strong> segmentos cervical, dorsal y lumbar con cuerpos vertebrales de morfología habitual, arco posterior cerrado.</p>
<p><strong>Extremidades:</strong> miembros superiores e inferiores presentes, con movimientos espontáneos, sin alteraciones.</p>
<p><strong>SEXO FETAL:</strong> ___</p>
<p><strong>PLACENTA:</strong> inserción corporal posterior. Espesor 31 mm. Grado II/III (Grannum).</p>
<p><strong>CORDÓN UMBILICAL:</strong> normo-inserto, dos arterias y una vena, trayecto espiralado habitual.</p>
<p><strong>LÍQUIDO AMNIÓTICO:</strong> volumen adecuado. Pozo mayor: 83 mm.</p>
<p><strong>IMPRESIÓN DIAGNÓSTICA:</strong></p>
<ul><li>GESTACIÓN ÚNICA ACTIVA DE ___ SEMANAS POR BIOMETRÍA FETAL.</li><li>NO SE OBSERVAN MALFORMACIONES MAYORES NI MENORES.</li></ul>`,
  },
  {
    nombre: 'Ecografía transvaginal (útero y anexos)',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio sonográfico de la cavidad pélvica realizado con transductor de 7.5 MHz muestra:</p>
<p><strong>1.- ÚTERO:</strong> De tamaño fisiológicamente conservado, AVF, de 47.1 x 31.1 x 40.6 mm en sus diámetros longitudinal, anteroposterior y transverso respectivamente. Miometrio homogéneo, sin imágenes focales, bordes regulares.</p>
<p><strong>2.- CAVIDAD ENDOMETRIAL:</strong> Endometrio de 1.4 mm de espesor.</p>
<p><strong>3.- ANEXOS:</strong></p>
<ul><li>Anexo derecho: de tamaño conservado, ecoestructura homogénea de 26.8 x 16.6 mm. Presencia de varias imágenes foliculares.</li><li>Anexo izquierdo: de tamaño conservado, ecoestructura homogénea de 22.7 x 14.8 mm. Presencia de varias imágenes foliculares.</li></ul>
<p><strong>4.- CÉRVIX:</strong> Cerrado.</p>
<p><strong>5.- FONDO DE SACO DE DOUGLAS:</strong> Libre.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>ÚTERO Y ANEXOS ECOGRÁFICAMENTE NORMALES.</li></ul>
<p><em>La ecografía es un método de ayuda al diagnóstico no invasivo, no concluyente, sin valor médico legal.</em></p>`,
  },
  {
    nombre: 'Ecografía transvaginal — gestación inicial',
    tipo: 'Ecografía',
    cuerpo: `<p><strong>1.- ÚTERO:</strong> Se observa engrosamiento endometrial con presencia de imagen hiperecogénica en forma de anillo compatible con saco gestacional de bordes regulares bien definidos. Se visualiza en su interior embrión con actividad cardiaca. Vesícula vitelina de 3.8 mm.</p>
<p><strong>Biometría:</strong></p>
<ul><li>CRL: 5.9 mm</li><li>SG: 20.2 mm</li></ul>
<p><strong>2.- FONDO DE SACO DE DOUGLAS:</strong> Libre.</p>
<p><strong>3.- OCI:</strong> Cerrado.</p>
<p><strong>4.- FPP por ECO:</strong> __/__/____</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>GESTACIÓN ÚNICA ACTIVA DE ___ SEMANAS +/- 1 SEMANA POR CRL Y SG.</li></ul>`,
  },
  {
    nombre: 'Ecografía de mamas (normal)',
    tipo: 'Ecografía',
    cuerpo: `<p><strong>1.- Mama derecha:</strong></p>
<ul><li>Piel y TCSC de ecogenicidad conservada.</li><li>Tejido graso en poca cantidad sin masas sólidas en su contenido.</li><li>Tejido fibroglandular homogéneo hiperecogénico, regular cantidad.</li><li>Región retromamaria adecuada, sin repleción.</li><li>No se visualizan imágenes quísticas ni masas sólidas.</li><li>Región axilar ecogénica, sin crecimiento ganglionar.</li></ul>
<p><strong>2.- Mama izquierda:</strong></p>
<ul><li>Piel y TCSC de ecogenicidad conservada.</li><li>Tejido graso en poca cantidad sin masas sólidas en su contenido.</li><li>Tejido fibroglandular homogéneo hiperecogénico, regular cantidad.</li><li>Región retromamaria adecuada, sin repleción.</li><li>No se visualizan imágenes quísticas ni masas sólidas.</li><li>Región axilar ecogénica, sin crecimiento ganglionar.</li></ul>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>AMBAS MAMAS ECOGRÁFICAMENTE CONSERVADAS.</li></ul>`,
  },
  {
    nombre: 'Ecografía abdominal total',
    tipo: 'Ecografía',
    cuerpo: `<p><strong>HÍGADO:</strong> Morfología y volumen normal. Bordes regulares. Mide ___ x ___ mm. Ecogenicidad dentro de límites normales, ecoestructura homogénea. Elementos vasculares bien visualizados. Vías biliares intrahepáticas no dilatadas.</p>
<p><strong>VENA PORTA:</strong> ___ mm de diámetro.</p>
<p><strong>VESÍCULA BILIAR:</strong> Mide ___ x ___ mm. Paredes delgadas, bien delimitadas. Ausencia de ecos en el interior.</p>
<p><strong>COLÉDOCO:</strong> ___ mm.</p>
<p><strong>PÁNCREAS:</strong> De morfología normal. Ecogenicidad y ecoestructura normales, sin lesiones. Cabeza ___ mm, cuerpo ___ mm.</p>
<p><strong>RIÑONES:</strong> Morfología y ubicación habitual. Ecogenicidad y ecoestructura parenquimal normal, con adecuada diferenciación cortico-medular. Seno renal ecogénico habitual, sin litiasis. Cavidades colectoras no dilatadas.</p>
<ul><li>Derecho: mide ___ x ___ mm. Parénquima ___ mm.</li><li>Izquierdo: mide ___ x ___ mm. Parénquima ___ mm.</li></ul>
<p><strong>BAZO:</strong> Morfología y ubicación habitual. Ecogenicidad y ecoestructura normal. Dimensiones ___ x ___ mm. Hilio esplénico libre.</p>
<p><strong>VEJIGA:</strong> Distendida, de morfología habitual. Paredes delgadas, contenido anecoico, sin formaciones litiásicas ni polipoideas.</p>
<p><strong>FID:</strong> No se observan asas de paredes gruesas. No se identifica apéndice. Sin colecciones.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>HÍGADO, VESÍCULA, RIÑONES, BAZO, PÁNCREAS Y VEJIGA: SIN ALTERACIONES.</li></ul>`,
  },
  {
    nombre: 'Ecografía abdominal — gastritis / aerocolia',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ecográfico trans-abdominal revela:</p>
<p>Hígado a nivel del reborde costal derecho, bordes regulares, tamaño normal, parénquima homogéneo, ecogenicidad conservada. Sin imágenes expansivas ni colecciones. Vena porta y venas hepáticas de calibre normal. Vías biliares intrahepáticas no dilatadas. Colédoco proximal de 4 mm.</p>
<p>Vesícula biliar piriforme, 65 x 26 mm, de paredes discretamente engrosadas. Lumen normal, sin contenido litiásico ni barro biliar.</p>
<p>Páncreas de forma conservada, contornos regulares, tamaño normal, parénquima homogéneo.</p>
<p>Bazo de forma conservada, tamaño normal. Medidas: 8.2 cm de longitud y 3.4 cm de diámetro AP.</p>
<p>Grandes vasos de calibre normal. Pared gástrica conservada de 0.4 cm de espesor. Asas intestinales sobredistendidas con contenido gaseoso y líquido. Sin líquido libre en cavidad abdominal.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>COLECISTOPATÍA LEVE.</li><li>METEORISMO MARCADO.</li></ul>`,
  },
  {
    nombre: 'Ecografía abdominal — litiasis vesicular',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ecográfico trans-abdominal revela:</p>
<p>Hígado a nivel del reborde costal derecho, bordes regulares, tamaño normal (HCD: 12.0 cm), parénquima homogéneo. Sin imágenes expansivas ni colecciones. Vena porta y venas hepáticas de calibre normal. Vías biliares intrahepáticas no dilatadas. Colédoco proximal de 4 mm. Marco colónico con regular cantidad de gas.</p>
<p>Vesícula biliar piriforme, de paredes engrosadas (4 mm). Mide 49 x 25 mm. En su interior se aprecia imagen hiperecoica de 16 mm que produce sombra acústica posterior.</p>
<p>Páncreas de forma conservada, contornos regulares, tamaño normal, parénquima homogéneo.</p>
<p>Bazo de forma conservada, tamaño normal. Medidas: 7.0 cm de longitud y 3.2 cm de diámetro AP. Grandes vasos de calibre normal. Pared gástrica engrosada (3 mm).</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>LITIASIS VESICULAR.</li><li>METEORISMO MODERADO.</li><li>Se sugiere control posterior.</li></ul>`,
  },
  {
    nombre: 'Ecografía abdominal — quiste hepático',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ecográfico trans-abdominal revela:</p>
<p>Hígado a nivel del reborde costal derecho, bordes regulares, tamaño normal (diámetro transverso 133 mm), parénquima homogéneo. A nivel del parénquima se aprecia masa quística en segmento IV, de paredes delgadas, ovoidea, contenido anecogénico, de 37 x 22 mm; y masa quística compleja en segmento V con pequeñas membranas ecogénicas, paredes delgadas, de 42 x 34 mm. Vena porta de calibre normal. Venas suprahepáticas no dilatadas. Vías biliares intrahepáticas no dilatadas. Colédoco proximal 4 mm. Pared gástrica de 7 mm a nivel de antro.</p>
<p>Vesícula biliar piriforme, paredes delgadas, con focos hiperecogénicos de 8 y 7 mm con sombra acústica posterior. Diámetro transverso 23 mm (VN ≤ 40 mm).</p>
<p>Páncreas conservado. Bazo con quiste de paredes ecogénicas delgadas de 32 mm; medidas 10.1 x 3.2 cm. Sin líquido libre. Incidentalmente, foco hiperecogénico en polo inferior de riñón derecho.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>Quistes hepáticos y quiste esplénico sugestivos de hidatidosis.</li><li>Litiasis vesicular.</li><li>Litiasis renal derecha.</li><li>Considerar proceso inflamatorio gástrico.</li><li>Se sugiere control posterior.</li></ul>`,
  },
  {
    nombre: 'Ecografía de próstata (hiperplasia)',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ecográfico trans-abdominal revela:</p>
<p><strong>Vejiga:</strong> de paredes conservadas, contenido líquido homogéneo, expansibilidad aumentada. Sin cálculos ni imágenes expansivas. Volumen pre-miccional: 1002 cc. Volumen post-miccional: 923 cc.</p>
<p><strong>Próstata:</strong> de bordes regulares, ecogenicidad homogénea, tamaño aumentado.</p>
<ul><li>Longitudinal: 6.08 cm</li><li>Transverso: 6.11 cm</li><li>Anteroposterior: 4.93 cm</li><li>Volumen: 95.8 cm³</li></ul>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>HIPERPLASIA PROSTÁTICA GRADO IV.</li><li>RETENCIÓN URINARIA 92.1% (V. normal &lt; 10%).</li><li>Se sugiere evaluación por la especialidad y control posterior.</li></ul>`,
  },
  {
    nombre: 'Ecografía renal — arenilla bilateral',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ecográfico revela:</p>
<p><strong>RIÑÓN DERECHO:</strong> de forma y tamaño normal, superficies regulares, ecogenicidad del parénquima conservada, buena diferenciación cortico-medular. Medidas: 91 x 41 mm; 20 mm de parénquima. Sin dilatación del sistema pielo-calicial. A nivel del seno renal se evidencian ecos finos hiperrefringentes en relación a arenilla.</p>
<p><strong>RIÑÓN IZQUIERDO:</strong> de forma y tamaño normal, superficies regulares, ecogenicidad conservada, buena diferenciación cortico-medular. Medidas: 91 x 52 mm; 21 mm de parénquima. Sin dilatación del sistema pielo-calicial. A nivel del seno renal se evidencian ecos finos hiperrefringentes en relación a arenilla.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>Arenilla renal bilateral.</li></ul>`,
  },
  {
    nombre: 'Ecografía renal — litiasis bilateral',
    tipo: 'Ecografía',
    cuerpo: `<p><strong>ÁREAS SUPRARRENALES:</strong> libres.</p>
<p>Ambos riñones de volumen y posición conservada, móviles con la respiración, sin alteración sónica del parénquima ni dilatación del sistema pielocalicial. A nivel renal derecho se delimita imagen hiperecogénica de 6 mm en polo superior, con sombra acústica posterior. A nivel renal izquierdo, pequeña imagen hiperecogénica de 4 mm en polo superior, con sombra acústica posterior.</p>
<ul><li>Riñón derecho: mide 97 x 42 mm, cortical 18 mm.</li><li>Riñón izquierdo: mide 96 x 46 mm, cortical 17 mm.</li></ul>
<p>Planos grasos perirrenales conservados.</p>
<p><strong>IMPRESIÓN DIAGNÓSTICA:</strong></p>
<ul><li>IMÁGENES COMPATIBLES CON LITIASIS RENAL BILATERAL.</li><li>Se sugiere correlación con exámenes de laboratorio y control posterior.</li></ul>`,
  },
  {
    nombre: 'Ecografía de vías urinarias',
    tipo: 'Ecografía',
    cuerpo: `<p>El estudio ecográfico revela:</p>
<p><strong>RIÑÓN DERECHO:</strong> de forma y tamaño normal, superficies regulares, ecogenicidad conservada, buena diferenciación cortico-medular. Tamaño 99 x 48 mm; 21 mm de parénquima. Sin dilatación del sistema pielo-calicial. A nivel del seno renal se evidencia imagen hiperecoica de 4 mm con sombra acústica posterior.</p>
<p><strong>RIÑÓN IZQUIERDO:</strong> de forma y tamaño normal, superficies regulares, ecogenicidad conservada, buena diferenciación cortico-medular. Medidas 109 x 55 mm; 23 mm de parénquima. Sin dilatación del sistema pielo-calicial.</p>
<p><strong>VEJIGA:</strong> llena, de paredes conservadas, contenido líquido homogéneo, adecuada expansibilidad. Sin cálculos ni imágenes expansivas. Volumen pre-miccional: 226 cc. Post-miccional: vacía.</p>
<p><strong>PRÓSTATA:</strong> de tamaño conservado, bordes regulares, ecogenicidad heterogénea, sin imágenes expansivas. Longitudinal 3.1 cm, transverso 2.3 cm, AP 1.9 cm; volumen 10.0 cm³.</p>
<p><strong>CONCLUSIÓN:</strong></p>
<ul><li>MICROLITIASIS RENAL DERECHA.</li><li>VEJIGA Y PRÓSTATA SIN ALTERACIONES ECOGRÁFICAS.</li><li>Se sugiere control posterior.</li></ul>`,
  },
  {
    nombre: 'Ecografía de partes blandas — hernia inguinal',
    tipo: 'Ecografía',
    cuerpo: `<p>En proyección del conducto inguinal externo derecho se delimita tumoración compleja lobulada, localizada por fuera de la bolsa testicular ipsilateral, de 60 x 20 mm en sus diámetros mayores, con zonas hiperecogénicas e hipoecogénicas internas, impresionando pedículo en orientación al anillo inguinal externo por donde se introduce. Se evidencia hidrocele en mínima cantidad.</p>
<p>En proyección del conducto inguinal externo izquierdo se evidencia tumoración compleja lobulada, localizada por fuera de la bolsa testicular ipsilateral, de 100 x 40 mm en sus diámetros mayores, con zonas hiperecogénicas e hipoecogénicas internas, impresionando pedículo en orientación al anillo inguinal externo por donde se introduce.</p>
<p><strong>IMPRESIÓN DIAGNÓSTICA:</strong></p>
<ul><li>Hallazgos ecográficos en relación a saco herniario ocupando canal inguinal de manera bilateral, a predominio izquierdo, asociado a hidrocele mínimo derecho.</li></ul>
<p><strong>RECOMENDACIÓN:</strong></p>
<ul><li>Se sugiere ecografía testicular bilateral.</li></ul>`,
  },
  {
    nombre: 'Ecografía de partes blandas — lipoma axilar',
    tipo: 'Ecografía',
    cuerpo: `<p>La exploración física de la región axilar derecha muestra tumoración palpable en región anterior, de consistencia blanda, de aprox. 40 mm de longitud. Comparativamente con el lado contralateral no muestra masas ni zonas de empastamiento o flogosis.</p>
<p>Ecográficamente, dicho hallazgo se localiza en los planos subcutáneos, constituido por formación sólida discretamente heterogénea, predominantemente ecogénica, con pequeñas áreas hipoecogénicas dispersas, de bordes definidos y regulares, de 37 x 13 mm en sus diámetros mayores. Las áreas restantes presentan adecuada interfase a los planos grasos y musculares adyacentes. Sin imágenes sugerentes de colecciones o masas sólidas/quísticas. Planos grasos de aspecto ecográfico normal.</p>
<p><strong>IMPRESIÓN DIAGNÓSTICA:</strong></p>
<ul><li>Hallazgo ecográfico en relación a tumoración sólida heterogénea en axila derecha. Considerar como diagnóstico diferencial lipoma.</li></ul>
<p><strong>RECOMENDACIONES:</strong></p>
<ul><li>Se sugiere seguimiento clínico.</li></ul>`,
  },

  // ─────────────────────────── LABORATORIO (pruebas rápidas) ───────────────────────────
  {
    nombre: 'Hemoglobina (prueba rápida)',
    tipo: 'Laboratorio',
    cuerpo: `<p><strong>HEMATOLOGÍA</strong> — Prueba rápida</p>
<p><strong>HEMOGLOBINA:</strong> 12.5 g/dL &nbsp;&nbsp;(Rango referencial: 11.5 - 17.5 g/dL)</p>`,
  },
  {
    nombre: 'Bacteriuria (prueba rápida)',
    tipo: 'Laboratorio',
    cuerpo: `<p><strong>ANÁLISIS:</strong> Bacteriuria — Prueba rápida</p>
<p><strong>RESULTADO:</strong> POSITIVO (75 x C)</p>`,
  },
  {
    nombre: 'VIH · Sífilis · Hepatitis B (prueba rápida)',
    tipo: 'Laboratorio',
    cuerpo: `<p><strong>Prueba rápida</strong></p>
<p><strong>VIH:</strong> NO REACTIVO</p>
<p><strong>SÍFILIS (RPR / VDRL):</strong> NO REACTIVO</p>
<p><strong>HEPATITIS B:</strong> NO REACTIVO</p>`,
  },
  {
    nombre: 'HCG cualitativo',
    tipo: 'Laboratorio',
    cuerpo: `<p><strong>HCG CUALITATIVO</strong></p>
<p><strong>RESULTADO:</strong> NEGATIVO</p>`,
  },
  {
    nombre: 'Sub-unidad Beta HCG — negativo',
    tipo: 'Laboratorio',
    cuerpo: `<p><strong>SUB-UNIDAD BETA — SANGRE</strong></p>
<p><strong>RESULTADO:</strong> NEGATIVO</p>
<p>Sensibilidad: 10 mUI/ml.</p>
<p><em>Se sugiere ecografía transvaginal.</em></p>`,
  },
  {
    nombre: 'Sub-unidad Beta HCG — positivo',
    tipo: 'Laboratorio',
    cuerpo: `<p><strong>SUB-UNIDAD BETA — SANGRE</strong></p>
<p><strong>RESULTADO:</strong> POSITIVO</p>
<p>Sensibilidad: 10 mUI/ml.</p>
<p><em>Se sugiere ecografía transvaginal.</em></p>`,
  },
];
