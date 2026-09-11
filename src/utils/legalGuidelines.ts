import { LegalRegulation } from '../types';

export const LEGAL_REGULATIONS: LegalRegulation[] = [
  {
    id: 'col-ley-23-1982',
    jurisdiction: 'Colombia',
    normName: 'Ley 23 de 1982 (Derechos de Autor)',
    authority: 'Congreso de la República / DNDA (Dirección Nacional de Derecho de Autor)',
    keyArticles: 'Artículos 30 (Derechos Morales de Paternidad e Integridad) y 31 (Derecho de Cita Lícita)',
    complianceReason: 'El Art. 31 autoriza la transcripción de pasajes necesarios siempre que no configuren una reproducción simulada o sustancial y se cite expresamente al autor y la obra. El sistema identifica coincidencias literales y verifica si están debidamente atribuidas para proteger la paternidad intelectual.',
    relevanceToOriginalityAndAI: 'Distingue entre citas lícitas (entrecomilladas o con sangría y atribución de fuente) y plagio por omisión de crédito o reproducción indebida.'
  },
  {
    id: 'col-ley-1581-2012',
    jurisdiction: 'Colombia',
    normName: 'Ley Estatutaria 1581 de 2012 (Habeas Data y Protección de Datos Personales)',
    authority: 'Superintendencia de Industria y Comercio (SIC)',
    keyArticles: 'Artículos 4 (Principios de Libertad, Veracidad, Seguridad y Confidencialidad), 17 y 26 (Transferencia Internacional)',
    complianceReason: 'CRÍTICO: Al funcionar 100% en la memoria RAM del navegador y almacenamiento local del usuario (sin enviar los textos a ningún servidor ni base de datos externa en la nube), el sistema garantiza la absoluta confidencialidad de las obras inéditas y datos personales de autores y estudiantes, previniendo transferencias ilícitas transfronterizas.',
    relevanceToOriginalityAndAI: 'A diferencia de plataformas en la nube que almacenan los trabajos en repositorios globales perpetuos, este software respeta el principio de privacidad por diseño y custodia soberana de la información.'
  },
  {
    id: 'col-decision-andina-351',
    jurisdiction: 'Colombia',
    normName: 'Decisión Andina 351 de 1993 (Régimen Común sobre Derecho de Autor)',
    authority: 'Comunidad Andina de Naciones (CAN)',
    keyArticles: 'Artículo 22 (Límites al Derecho Patrimonial: Citas Honradas con Indicación de Fuente)',
    complianceReason: 'Establece en la región andina que la reproducción de pasajes de obras divulgadas es lícita únicamente con fines docentes, de crítica o investigación, siempre conforme a los usos honrados y mencionando el título y autor.',
    relevanceToOriginalityAndAI: 'Armoniza los criterios de originalidad académica para Colombia, Perú, Ecuador y Bolivia.'
  },
  {
    id: 'col-men-minciencias',
    jurisdiction: 'Colombia',
    normName: 'Lineamientos MEN y MinCiencias sobre Ética e Inteligencia Artificial en Educación Superior (2023-2024)',
    authority: 'Ministerio de Educación Nacional y Ministerio de Ciencia, Tecnología e Innovación de Colombia',
    keyArticles: 'Ejes de Integridad Científica, Transparencia Algorítmica y Enfoque Pedagógico Formativo',
    complianceReason: 'Los lineamientos prohíben la sanción disciplinaria basada exclusivamente en puntajes automáticos de software. Exigen que los reportes de IA sean herramientas de diagnóstico y acompañamiento pedagógico con debido proceso y revisión docente humana.',
    relevanceToOriginalityAndAI: 'El software advierte explícitamente sobre el margen de error estadístico de los detectores de IA y fomenta la declaración explícita de co-autoría o uso asistido de herramientas LLM.'
  },
  {
    id: 'int-convenio-berna',
    jurisdiction: 'Internacional',
    normName: 'Convenio de Berna para la Protección de las Obras Literarias y Artísticas',
    authority: 'Organización Mundial de la Propiedad Intelectual (OMPI / WIPO)',
    keyArticles: 'Artículo 10 (Libre utilización de obras: Citas)',
    complianceReason: 'Tratado internacional rector que estipula la licitud de las citas tomadas de una obra accesible al público, a condición de que se hagan conforme a los usos honrados y en la medida justificada por el fin perseguido.',
    relevanceToOriginalityAndAI: 'Estándar global vinculante ratificado por más de 180 países para la evaluación de originalidad.'
  },
  {
    id: 'int-gdpr-art22',
    jurisdiction: 'Internacional',
    normName: 'Reglamento General de Protección de Datos (GDPR - UE 2016/679)',
    authority: 'Unión Europea / Comité Europeo de Protección de Datos',
    keyArticles: 'Artículo 22 (Decisiones Individuales Automatizadas y Perfilamiento) y Artículos 5/25 (Privacidad por Diseño)',
    complianceReason: 'Garantiza el derecho del individuo a no ser objeto de una decisión con efectos jurídicos o académicos significativos que se base únicamente en el tratamiento automatizado. Exige intervención humana de un revisor o evaluador.',
    relevanceToOriginalityAndAI: 'Cumplimiento estricto al clasificar el reporte como informe pericial orientativo y no veredicto sancionatorio irrevocable.'
  },
  {
    id: 'int-unesco-etica-ia',
    jurisdiction: 'Internacional',
    normName: 'Recomendación sobre la Ética de la Inteligencia Artificial (UNESCO 2021) y Guía para la IA en Educación (2023)',
    authority: 'UNESCO (Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura)',
    keyArticles: 'Principios de Supervisión Humana, Responsabilidad, Rendición de Cuentas y Equidad Digital',
    complianceReason: 'Promueve que el uso de IA en la academia potencie las capacidades humanas sin desvirtuar la autoría personal ni generar falsas acusaciones que perjudiquen desproporcionadamente a hablantes no nativos.',
    relevanceToOriginalityAndAI: 'Marco ético global para la integración formativa y no punitiva de herramientas de detección de lenguaje sintético.'
  }
];
