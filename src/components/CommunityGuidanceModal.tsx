import React from 'react';
import {
  ShieldCheck,
  Scale,
  Lock,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  FileCheck2,
  Users
} from 'lucide-react';

interface CommunityGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
}

export const CommunityGuidanceModal: React.FC<CommunityGuidanceModalProps> = ({
  isOpen,
  onClose,
  logoUrl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Ekirayá Logo and Title */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="bg-white p-1 sm:p-1.5 rounded-xl flex items-center justify-center shadow-xs shrink-0">
              <img
                src={logoUrl}
                alt="Colegio Bilingüe Ekirayá"
                className="h-7 sm:h-10 w-auto object-contain max-w-[85px] sm:max-w-[120px]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-lg text-white truncate">
                  Guía Comunidad Ekirayá
                </h3>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Normas y Embudo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Ética académica, embudo de originalidad y cumplimiento normativo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-6 sm:space-y-8">
          {/* Section 1: Explicación Detallada del Embudo de Colores (Embudo Institucional) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <HelpCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-base text-slate-900">
                1. ¿Cómo interpretar el Embudo de Colores (Índice de Similitud)?
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              El embudo clasifica los porcentajes de similitud textual para guiar el aprendizaje. En el <strong>Colegio Bilingüe Ekirayá</strong>, un porcentaje de similitud <strong>no es un veredicto automático de plagio</strong>, sino un punto de partida pedagógico para aprender a citar, dialogar con fuentes y cultivar el pensamiento crítico.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Azul */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2 shadow-xs">
                    0%
                  </div>
                  <h5 className="font-bold text-xs text-blue-950 uppercase tracking-wider">
                    Azul (0%)
                  </h5>
                  <p className="text-[11px] font-semibold text-blue-800 mt-1">Sin coincidencias</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Redacción totalmente original o sin términos cotejados en la base de referencia.
                  </p>
                </div>
                <span className="text-[10px] font-medium text-blue-700 mt-2 block bg-blue-100/80 px-2 py-0.5 rounded">
                  Excelente originalidad
                </span>
              </div>

              {/* Verde */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2 shadow-xs">
                    1-24%
                  </div>
                  <h5 className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                    Verde (1% - 24%)
                  </h5>
                  <p className="text-[11px] font-semibold text-emerald-800 mt-1">Rango Ideal y Esperado</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Comportamiento natural de una investigación académica rigurosa: citas formales, definiciones estándar y bibliografía.
                  </p>
                </div>
                <span className="text-[10px] font-medium text-emerald-800 mt-2 block bg-emerald-100/80 px-2 py-0.5 rounded">
                  Nivel saludable
                </span>
              </div>

              {/* Amarillo */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs mb-2 shadow-xs">
                    25-49%
                  </div>
                  <h5 className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                    Amarillo (25% - 49%)
                  </h5>
                  <p className="text-[11px] font-semibold text-amber-800 mt-1">Revisión Formativa</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Presencia moderada de pasajes de terceros. El docente y el estudiante revisan si faltan comillas o atribuir autores.
                  </p>
                </div>
                <span className="text-[10px] font-medium text-amber-800 mt-2 block bg-amber-100/80 px-2 py-0.5 rounded">
                  Oportunidad de mejora
                </span>
              </div>

              {/* Naranja */}
              <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/70 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center text-xs mb-2 shadow-xs">
                    50-74%
                  </div>
                  <h5 className="font-bold text-xs text-orange-950 uppercase tracking-wider">
                    Naranja (50% - 74%)
                  </h5>
                  <p className="text-[11px] font-semibold text-orange-800 mt-1">Similitud Alta</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Más de la mitad del texto coincide con obras existentes. Se requiere reescribir con argumentación propia.
                  </p>
                </div>
                <span className="text-[10px] font-medium text-orange-800 mt-2 block bg-orange-100/80 px-2 py-0.5 rounded">
                  Alerta pedagógica
                </span>
              </div>

              {/* Rojo */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-xs mb-2 shadow-xs">
                    75-100%
                  </div>
                  <h5 className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                    Rojo (75% - 100%)
                  </h5>
                  <p className="text-[11px] font-semibold text-rose-800 mt-1">Similitud Crítica</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Copia casi integral. No satisface el requisito de originalidad escolar ni las exigencias de Ley 23/1982.
                  </p>
                </div>
                <span className="text-[10px] font-medium text-rose-800 mt-2 block bg-rose-100/80 px-2 py-0.5 rounded">
                  Revisión obligatoria
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Garantía de Protección de Datos de los Estudiantes (Ley 1581 / Habeas Data) */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-sm text-emerald-950">
                2. Protección de la Privacidad de los Estudiantes Ekirayá (Ley 1581 de 2012 y Habeas Data)
              </h4>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              En muchas plataformas comerciales externas, los trabajos, nombres e ideas de los estudiantes son subidos a nubes públicas extranjeras donde quedan almacenados indefinidamente. En el <strong>Colegio Bilingüe Ekirayá</strong>, este sistema fue configurado bajo el principio de <strong>Privacidad por Diseño (Privacy by Design)</strong>:
            </p>

            <ul className="text-xs text-emerald-900 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Cero Transmisión Externa:</strong> El análisis se procesa <strong>100% en la memoria RAM del navegador</strong> del usuario. Ningún escrito se envía a servidores de terceros ni se almacena en la nube.
              </li>
              <li>
                <strong>Protección de Menores de Edad:</strong> Al no recopilar información identificable ni bases de datos centralizadas, se cumple estrictamente con el Código de la Infancia y la Adolescencia (Ley 1098 de 2006) y la Ley 1581 de 2012 de Colombia.
              </li>
              <li>
                <strong>Soberanía Intelectual:</strong> Las creaciones de los alumnos permanecen bajo su entera custodia y la del colegio, sin cesión forzosa de derechos patrimoniales a multinacionales.
              </li>
            </ul>
          </div>

          {/* Section 3: Normativas Colombianas e Internacionales de Derechos de Autor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Scale className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-base text-slate-900">
                3. Marco Legal de Derechos de Autor Aplicable a los Trabajos
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ley 23 de 1982 (Colombia, Art. 30 y 31)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Permite transcribir pasajes necesarios para la docencia o investigación (derecho de cita), siempre que se indique claramente el autor y el título de la obra, y no constituya una reproducción simulada o fraudulenta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Decisión Andina 351 de 1993 (Art. 22)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Norma comunitaria vinculante para Colombia que reconoce el derecho de cita conforme a los usos honrados y la debida mención de la fuente en todo trabajo escolar y académico.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Convenio de Berna (Art. 10 Internacional)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Estándar internacional que avala las citas literarias y científicas lícitas en publicaciones educativas, sirviendo de base para los programas de bachillerato internacional y proyectos bilingües.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lineamientos MEN & UNESCO sobre IA (2023-2024)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Exigen que los reportes de IA sean herramientas pedagógicas formativas. Prohíben sanciones disciplinarias basadas únicamente en algoritmos; garantizan siempre el diálogo formativo y el debido proceso escolar.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Recomendaciones para Docentes y Estudiantes */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>¿Cómo usar este verificador en clase?</span>
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Los docentes pueden solicitar a los estudiantes que adjunten el reporte PDF de esta herramienta antes de entregar sus ensayos finales. Los alumnos aprenden a revisar sus propias citas y a declarar honestamente cualquier apoyo que hayan recibido de herramientas de IA.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium text-slate-700">Colegio Bilingüe Ekirayá • Excelencia e Integridad Académica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
