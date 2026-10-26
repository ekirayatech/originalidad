import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  RefreshCw,
  X,
  KeyRound,
  School,
  ExternalLink,
  AlertTriangle,
  Database
} from 'lucide-react';
import { InstitutionalUser, InstitutionalUserRole } from '../types';
import {
  subscribeInstitutionalUsers,
  createInstitutionalUser,
  bulkImportInstitutionalUsers,
  updateInstitutionalUser,
  deleteInstitutionalUser,
  isValidEkirayaDomain,
  clearAllEvaluationAndCotejoRecords
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TALLER_PRESETS = [
  'Taller 1 (Primaria Baja - Grados 1° a 3°)',
  'Taller 2 (Primaria Alta - Grados 4° a 6°)',
  'Taller 3 (Secundaria - Grados 7° a 9°)',
  'Taller Juvenil (Media Vocacional - Grados 10° y 11°)',
  'Cuerpo Docente Ekirayá',
  'Coordinación Académica'
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<InstitutionalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'csv'>('list');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'docente' | 'estudiante' | 'admin'>('all');
  const [tallerFilter, setTallerFilter] = useState<string>('all');

  // Form State for Single User
  const [formNombre, setFormNombre] = useState('');
  const [formApellido, setFormApellido] = useState('');
  const [formTaller, setFormTaller] = useState('Taller 1 (Primaria Baja - Grados 1° a 3°)');
  const [formCustomTaller, setFormCustomTaller] = useState('');
  const [isCustomTaller, setIsCustomTaller] = useState(false);
  const [formContrasena, setFormContrasena] = useState('');
  const [formRol, setFormRol] = useState<InstitutionalUserRole>('estudiante');
  const [formEmail, setFormEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Database Purge State ("Borra todos los registros")
  const [isPurgingRecords, setIsPurgingRecords] = useState(false);
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);

  // Editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editTaller, setEditTaller] = useState('');
  const [editContrasena, setEditContrasena] = useState('');
  const [editRol, setEditRol] = useState<InstitutionalUserRole>('estudiante');

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvRows, setParsedCsvRows] = useState<{
    nombre: string;
    apellido: string;
    taller: string;
    contrasena: string;
    rol: InstitutionalUserRole;
    email: string;
    isValid: boolean;
    error?: string;
  }[]>([]);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvResult, setCsvResult] = useState<{ added: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Passwords visibility toggle map for table
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subscribe to institutional users in Firestore
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const unsubscribe = subscribeInstitutionalUsers(
      (list) => {
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error cargando usuarios institucionales:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  // Generate suggested secure password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pass = 'Ekiraya-';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormContrasena(pass);
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.rol !== roleFilter) return false;

      // Taller filter
      if (tallerFilter !== 'all' && u.taller !== tallerFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const full = `${u.nombre} ${u.apellido} ${u.taller} ${u.email}`.toLowerCase();
        return full.includes(q);
      }

      return true;
    });
  }, [users, roleFilter, tallerFilter, searchQuery]);

  // Unique list of Talleres
  const uniqueTalleres = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.taller) set.add(u.taller);
    });
    return Array.from(set).sort();
  }, [users]);

  // Counters
  const totalAdmins = users.filter((u) => u.rol === 'admin').length;
  const totalDocentes = users.filter((u) => u.rol === 'docente').length;
  const totalEstudiantes = users.filter((u) => u.rol === 'estudiante').length;

  // Handle single user submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const tallerFinal = isCustomTaller ? formCustomTaller.trim() : formTaller.trim();
    const cleanMail = formEmail.trim().toLowerCase();

    if (!formNombre.trim() || !formApellido.trim() || !tallerFinal || !formContrasena.trim()) {
      setFormFeedback({
        type: 'error',
        message: 'Por favor completa todos los campos requeridos: Nombre, Apellido, Taller y Contraseña.'
      });
      return;
    }

    // MANDATORY EMAIL AND DOMAIN VALIDATION
    if (!cleanMail) {
      setFormFeedback({
        type: 'error',
        message: 'El correo electrónico institucional es obligatorio.'
      });
      return;
    }

    if (!isValidEkirayaDomain(cleanMail)) {
      setFormFeedback({
        type: 'error',
        message: 'Correo no permitido. Únicamente se pueden registrar correos con dominio @est.cem.edu.co (Estudiantes) o @cem.edu.co (Docentes y Administradores).'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createInstitutionalUser({
        nombre: formNombre,
        apellido: formApellido,
        taller: tallerFinal,
        contrasena: formContrasena,
        rol: formRol,
        email: cleanMail
      });

      setFormFeedback({
        type: 'success',
        message: `Usuario ${formNombre} ${formApellido} (${formRol.toUpperCase()}) registrado con éxito con correo ${cleanMail}.`
      });

      // Reset form
      setFormNombre('');
      setFormApellido('');
      setFormContrasena('');
      setFormEmail('');
      setFormCustomTaller('');
      setIsCustomTaller(false);

      setTimeout(() => {
        setFormFeedback(null);
        setActiveTab('list');
      }, 1500);
    } catch (err: any) {
      setFormFeedback({
        type: 'error',
        message: err?.message || 'Error al guardar el usuario en la base de datos.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Database purge handler ("Borra todos los registros")
  const handlePurgeAllRecords = async () => {
    const confirmation = window.prompt(
      'ADVERTENCIA CRÍTICA: ¿Estás seguro de que deseas borrar TODOS los registros de análisis y documentos de cotejo de Firebase?\n\nPara confirmar, escribe "BORRAR" a continuación:'
    );

    if (confirmation !== 'BORRAR') {
      return;
    }

    setIsPurgingRecords(true);
    setPurgeFeedback(null);
    try {
      const res = await clearAllEvaluationAndCotejoRecords();
      setPurgeFeedback(
        `✓ Base de datos purgada: se eliminaron ${res.documentsCleared} evaluaciones guardadas y ${res.referenceDocsCleared} documentos de la biblioteca de cotejo.`
      );
      setTimeout(() => setPurgeFeedback(null), 6000);
    } catch (err: any) {
      alert(`Error al limpiar registros: ${err?.message || err}`);
    } finally {
      setIsPurgingRecords(false);
    }
  };

  // CSV Parsing
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    parseCsvFile(file);
  };

  const parseCsvFile = (file: File) => {
    setIsParsingCsv(true);
    setCsvResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setIsParsingCsv(false);
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setParsedCsvRows([]);
        setIsParsingCsv(false);
        return;
      }

      // Detect delimiter: comma or semicolon or tab
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';

      // Parse line taking into account quotes
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let insideQuote = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            insideQuote = !insideQuote;
          } else if (char === delimiter && !insideQuote) {
            result.push(cur.trim().replace(/^["']|["']$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        return result;
      };

      const headers = parseLine(lines[0]).map((h) =>
        h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
      );

      // Locate column indices
      const nombreIdx = headers.findIndex((h) => h.includes('nombre') || h.includes('name') || h === 'nombres');
      const apellidoIdx = headers.findIndex((h) => h.includes('apellido') || h.includes('last') || h === 'apellidos');
      const tallerIdx = headers.findIndex((h) => h.includes('taller') || h.includes('curso') || h.includes('grado') || h.includes('grade'));
      const contrasenaIdx = headers.findIndex((h) => h.includes('contrasena') || h.includes('password') || h.includes('clave') || h.includes('pass'));
      const rolIdx = headers.findIndex((h) => h.includes('rol') || h.includes('role') || h.includes('perfil') || h.includes('tipo'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('correo'));

      const rows: typeof parsedCsvRows = [];

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        if (!rawLine.trim()) continue;

        const cols = parseLine(rawLine);
        const nombre = (nombreIdx >= 0 ? cols[nombreIdx] : cols[0]) || '';
        const apellido = (apellidoIdx >= 0 ? cols[apellidoIdx] : cols[1]) || '';
        const taller = (tallerIdx >= 0 ? cols[tallerIdx] : cols[2]) || 'Taller Ekirayá';
        const contrasena = (contrasenaIdx >= 0 ? cols[contrasenaIdx] : cols[3]) || 'Ekiraya2026';
        const rawRol = (rolIdx >= 0 ? cols[rolIdx] : cols[4] || '').toLowerCase().trim();
        const email = (emailIdx >= 0 ? cols[emailIdx] : '')?.trim();

        const rol: InstitutionalUserRole =
          rawRol.includes('admin')
            ? 'admin'
            : rawRol.includes('docente') || rawRol.includes('profesor') || rawRol.includes('maestro') || rawRol.includes('teacher')
            ? 'docente'
            : 'estudiante';

        let isValid = true;
        let error = '';

        if (!nombre.trim()) {
          isValid = false;
          error = 'Falta Nombre';
        } else if (!apellido.trim()) {
          isValid = false;
          error = 'Falta Apellido';
        } else if (!taller.trim()) {
          isValid = false;
          error = 'Falta Taller';
        } else if (!contrasena.trim()) {
          isValid = false;
          error = 'Falta Contraseña';
        } else if (!email) {
          isValid = false;
          error = 'Correo institucional obligatorio';
        } else if (!isValidEkirayaDomain(email)) {
          isValid = false;
          error = 'Dominio no permitido (solo @est.cem.edu.co o @cem.edu.co)';
        }

        rows.push({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          taller: taller.trim(),
          contrasena: contrasena.trim(),
          rol,
          email: email.toLowerCase(),
          isValid,
          error
        });
      }

      setParsedCsvRows(rows);
      setIsParsingCsv(false);
    };

    reader.readAsText(file);
  };

  // Perform bulk import
  const handleBulkImport = async () => {
    const validRows = parsedCsvRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsImportingCsv(true);
    try {
      const res = await bulkImportInstitutionalUsers(validRows);
      setCsvResult(res);
      setParsedCsvRows([]);
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setCsvResult({
        added: 0,
        errors: [err?.message || 'Error en la importación']
      });
    } finally {
      setIsImportingCsv(false);
    }
  };

  // Download Sample CSV template
  const downloadSampleCsv = () => {
    const content =
      'Nombre,Apellido,Taller,Contraseña,Rol,Email\n' +
      'Camila,Restrepo,Taller 1 (Primaria Baja),Cami2026*,estudiante,crestrepo@est.cem.edu.co\n' +
      'Mateo,Gómez,Taller 2 (Primaria Alta),Mateo#2026,estudiante,mgomez@est.cem.edu.co\n' +
      'Valeria,Salamanca,Taller 3 (Secundaria),ValeEkiraya9,estudiante,vsalamanca@est.cem.edu.co\n' +
      'Andrés,Jiménez,Taller Juvenil (Media),AndresJ26!,estudiante,ajimenez@est.cem.edu.co\n' +
      'Carolina,Mendoza,Cuerpo Docente Ekirayá,CaroDoc2026,docente,cmendoza@cem.edu.co\n' +
      'Santiago,Ríos,Cuerpo Docente Ekirayá,SantiProf2026,docente,srios@cem.edu.co\n' +
      'Coordinación,Académica,Administración Ekirayá,AdminEkiraya26,admin,coordinacion@cem.edu.co\n';

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_usuarios_ekiraya.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export current users to CSV
  const handleExportUsersToCsv = () => {
    if (users.length === 0) return;

    let content = 'Nombre,Apellido,Taller,Contraseña,Rol,Email Institucional,Fecha Registro\n';
    users.forEach((u) => {
      content += `"${u.nombre}","${u.apellido}","${u.taller}","${u.contrasena}","${u.rol}","${u.email}","${u.createdAt}"\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `usuarios_ekiraya_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle show password for specific user
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy user credentials
  const copyCredentials = (u: InstitutionalUser) => {
    const credText = `COLEGIO BILINGÜE EKIRAYÁ - CEM\nUsuario: ${u.displayName}\nRol: ${u.rol.toUpperCase()}\nTaller: ${u.taller}\nCorreo: ${u.email}\nContraseña: ${u.contrasena}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle edit start
  const startEditing = (u: InstitutionalUser) => {
    setEditingUserId(u.id);
    setEditTaller(u.taller);
    setEditContrasena(u.contrasena);
    setEditRol(u.rol);
  };

  // Handle save edit
  const saveEdit = async (userId: string) => {
    try {
      await updateInstitutionalUser(userId, {
        taller: editTaller,
        contrasena: editContrasena,
        rol: editRol
      });
      setEditingUserId(null);
    } catch (err: any) {
      alert(`Error al actualizar usuario: ${err?.message || err}`);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (u: InstitutionalUser) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${u.displayName} (${u.rol})?`)) {
      try {
        await deleteInstitutionalUser(u.id);
      } catch (err: any) {
        alert(`Error al eliminar usuario: ${err?.message || err}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Gestión de Usuarios Ekirayá
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                  Docentes y Estudiantes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administración de perfiles institucionales con Taller, Contraseña y Carga Masiva CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex space-x-1.5 sm:space-x-4 min-w-max py-0.5">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-red-600 text-red-700 bg-white/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-red-600 shrink-0" />
              <span>Directorio de Usuarios</span>
              <span className="bg-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.2 rounded-full font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'add'
                  ? 'border-red-600 text-red-700 bg-white/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Agregar Individual</span>
            </button>

            <button
              onClick={() => setActiveTab('csv')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'csv'
                  ? 'border-red-600 text-red-700 bg-white/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Carga Masiva con CSV</span>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                .csv
              </span>
            </button>
          </div>

          {activeTab === 'list' && users.length > 0 && (
            <button
              onClick={handleExportUsersToCsv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs transition-all cursor-pointer shrink-0 ml-2"
              title="Descargar respaldo de usuarios en formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* TAB 1: LIST / DIRECTORY */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Usuarios</span>
                    <p className="text-lg font-black text-slate-900 leading-none">{users.length}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-amber-800 uppercase">Admins</span>
                    <p className="text-lg font-black text-amber-950 leading-none">{totalAdmins}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase">Docentes</span>
                    <p className="text-lg font-black text-indigo-950 leading-none">{totalDocentes}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase">Estudiantes</span>
                    <p className="text-lg font-black text-emerald-950 leading-none">{totalEstudiantes}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 uppercase">Talleres</span>
                    <p className="text-lg font-black text-slate-900 leading-none">{uniqueTalleres.length}</p>
                  </div>
                </div>
              </div>

              {/* Purge / Database Clear Status */}
              {purgeFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{purgeFeedback}</span>
                </div>
              )}

              {/* Filters & Search Controls */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por Nombre, Apellido, Taller o Correo..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Role filter buttons */}
                  <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs flex-wrap">
                    <button
                      onClick={() => setRoleFilter('all')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        roleFilter === 'all' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
                      }`}
                    >
                      Todos ({users.length})
                    </button>
                    <button
                      onClick={() => setRoleFilter('admin')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        roleFilter === 'admin' ? 'bg-white shadow-2xs text-amber-800 font-bold' : 'text-slate-600'
                      }`}
                    >
                      Admins ({totalAdmins})
                    </button>
                    <button
                      onClick={() => setRoleFilter('docente')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        roleFilter === 'docente' ? 'bg-white shadow-2xs text-indigo-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      Docentes ({totalDocentes})
                    </button>
                    <button
                      onClick={() => setRoleFilter('estudiante')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        roleFilter === 'estudiante' ? 'bg-white shadow-2xs text-emerald-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      Estudiantes ({totalEstudiantes})
                    </button>
                  </div>

                  {/* Taller filter dropdown */}
                  {uniqueTalleres.length > 0 && (
                    <select
                      value={tallerFilter}
                      onChange={(e) => setTallerFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden text-slate-700 font-medium"
                    >
                      <option value="all">Todos los Talleres</option>
                      {uniqueTalleres.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Table of Users */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                    <span className="text-xs font-semibold">Cargando directorio de usuarios desde Firestore...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">No se encontraron usuarios</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery || roleFilter !== 'all' || tallerFilter !== 'all'
                        ? 'Prueba modificando los filtros de búsqueda o rol.'
                        : 'Aún no hay usuarios registrados. Agrega uno manualmente o realiza una carga masiva mediante CSV.'}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                      >
                        Agregar Usuario
                      </button>
                      <button
                        onClick={() => setActiveTab('csv')}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                      >
                        Subir CSV
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3">Usuario (Nombre y Apellido)</th>
                          <th className="py-2.5 px-3">Perfil / Rol</th>
                          <th className="py-2.5 px-3">Taller (Curso)</th>
                          <th className="py-2.5 px-3">Contraseña</th>
                          <th className="py-2.5 px-3">Correo Institucional</th>
                          <th className="py-2.5 px-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((u) => {
                          const isEditing = editingUserId === u.id;
                          const isPasswordVisible = visiblePasswords[u.id];

                          return (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              {/* Nombre y Apellido */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                      u.rol === 'admin'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : u.rol === 'docente'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {(u.nombre || 'U')[0].toUpperCase()}
                                    {(u.apellido || '')[0]?.toUpperCase() || ''}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">
                                      {u.nombre} {u.apellido}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ID: {u.id.slice(0, 14)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Rol */}
                              <td className="py-2.5 px-3">
                                {isEditing ? (
                                  <select
                                    value={editRol}
                                    onChange={(e) => setEditRol(e.target.value as InstitutionalUserRole)}
                                    className="p-1 text-xs border border-slate-300 rounded bg-white"
                                  >
                                    <option value="estudiante">Estudiante</option>
                                    <option value="docente">Docente</option>
                                    <option value="admin">Administrador</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                      u.rol === 'admin'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : u.rol === 'docente'
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    {u.rol === 'admin' ? (
                                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                                    ) : u.rol === 'docente' ? (
                                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                    ) : (
                                      <GraduationCap className="w-3 h-3 text-emerald-600" />
                                    )}
                                    <span className="capitalize">{u.rol === 'admin' ? 'Administrador' : u.rol}</span>
                                  </span>
                                )}
                              </td>

                              {/* Taller */}
                              <td className="py-2.5 px-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editTaller}
                                    onChange={(e) => setEditTaller(e.target.value)}
                                    className="p-1 text-xs border border-slate-300 rounded bg-white w-full max-w-[200px]"
                                  />
                                ) : (
                                  <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px] border border-slate-200">
                                    {u.taller}
                                  </span>
                                )}
                              </td>

                              {/* Contraseña */}
                              <td className="py-2.5 px-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editContrasena}
                                    onChange={(e) => setEditContrasena(e.target.value)}
                                    className="p-1 text-xs border border-slate-300 rounded bg-white font-mono w-28"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                                      {isPasswordVisible ? u.contrasena : '••••••••'}
                                    </span>
                                    <button
                                      onClick={() => togglePasswordVisibility(u.id)}
                                      className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                                      title={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                      {isPasswordVisible ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Email */}
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-slate-600 text-[11px] block truncate max-w-[200px]">
                                  {u.email}
                                </span>
                              </td>

                              {/* Acciones */}
                              <td className="py-2.5 px-3 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => saveEdit(u.id)}
                                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] hover:bg-slate-300"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => copyCredentials(u)}
                                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                      title="Copiar credenciales completas"
                                    >
                                      {copiedId === u.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => startEditing(u)}
                                      className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-sky-50 transition-colors cursor-pointer"
                                      title="Editar usuario"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Eliminar usuario"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AGREGAR USUARIO INDIVIDUAL */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <UserPlus className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Registrar Nuevo Usuario Institucional
                  </h3>
                  <p className="text-xs text-slate-500">
                    Crea una cuenta para docente o estudiante con su Taller y Contraseña
                  </p>
                </div>
              </div>

              {formFeedback && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                    formFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {formFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{formFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Perfil / Rol Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Perfil / Rol Institucional *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFormRol('estudiante');
                        if (formEmail.includes('@cem.edu.co')) {
                          setFormEmail(formEmail.replace('@cem.edu.co', '@est.cem.edu.co'));
                        }
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRol === 'estudiante'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs block truncate">Estudiante</span>
                        <span className="text-[10px] text-slate-500 font-mono">@est.cem.edu.co</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormRol('docente');
                        if (formEmail.includes('@est.cem.edu.co')) {
                          setFormEmail(formEmail.replace('@est.cem.edu.co', '@cem.edu.co'));
                        }
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRol === 'docente'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs block truncate">Docente</span>
                        <span className="text-[10px] text-slate-500 font-mono">@cem.edu.co</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormRol('admin');
                        if (formEmail.includes('@est.cem.edu.co')) {
                          setFormEmail(formEmail.replace('@est.cem.edu.co', '@cem.edu.co'));
                        }
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRol === 'admin'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs block truncate">Administrador</span>
                        <span className="text-[10px] text-amber-700 font-mono">@cem.edu.co</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      placeholder="Ej. Sofía o Carlos"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={formApellido}
                      onChange={(e) => setFormApellido(e.target.value)}
                      placeholder="Ej. Gómez o Restrepo"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Taller (Curso) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Taller (Curso / Grado) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomTaller(!isCustomTaller)}
                      className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      {isCustomTaller ? 'Seleccionar de lista estándar' : 'Escribir taller personalizado'}
                    </button>
                  </div>

                  {isCustomTaller ? (
                    <input
                      type="text"
                      required
                      value={formCustomTaller}
                      onChange={(e) => setFormCustomTaller(e.target.value)}
                      placeholder="Ej. Taller 2B o Grado 8°"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  ) : (
                    <select
                      value={formTaller}
                      onChange={(e) => setFormTaller(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white font-medium"
                    >
                      {TALLER_PRESETS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Contraseña de Acceso *
                    </label>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Generar Contraseña</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formContrasena}
                      onChange={(e) => setFormContrasena(e.target.value)}
                      placeholder="Mínimo 4 caracteres (ej. Ekiraya2026)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Correo institucional (ESTRICTAMENTE OBLIGATORIO) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Correo Institucional * <span className="text-rose-600 font-normal">(Obligatorio: @est.cem.edu.co o @cem.edu.co)</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const base = (formEmail.split('@')[0] || `${formNombre.charAt(0)}${formApellido}`.toLowerCase()).replace(/\s+/g, '');
                          setFormEmail(`${base}@est.cem.edu.co`);
                        }}
                        className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-100"
                      >
                        + @est.cem.edu.co
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const base = (formEmail.split('@')[0] || `${formNombre.charAt(0)}${formApellido}`.toLowerCase()).replace(/\s+/g, '');
                          setFormEmail(`${base}@cem.edu.co`);
                        }}
                        className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded cursor-pointer hover:bg-indigo-100"
                      >
                        + @cem.edu.co
                      </button>
                    </div>
                  </div>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={
                      formRol === 'estudiante'
                        ? 'ejemplo: crestrepo@est.cem.edu.co'
                        : 'ejemplo: cmendoza@cem.edu.co'
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Solo se permiten correos institucionales oficiales. Cuentas personales (@gmail, @hotmail) no son admitidas.
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Registrar Usuario</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CARGA MASIVA CON CSV */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              {/* Instructions banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Importación Masiva de Estudiantes y Docentes (.csv)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Carga cientos de usuarios simultáneamente. El archivo debe contener las columnas:{' '}
                      <span className="font-mono font-bold text-slate-700">
                        Nombre, Apellido, Taller, Contraseña, Rol
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadSampleCsv}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Plantilla CSV</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-red-400 text-center transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                  id="csv-upload-input"
                />
                <label
                  htmlFor="csv-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Haz clic aquí para seleccionar tu archivo CSV o arrástralo
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Formato compatible: valores separados por comas o punto y coma (.csv)
                    </span>
                  </div>
                </label>
              </div>

              {/* CSV Result Message */}
              {csvResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    csvResult.errors.length === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {csvResult.errors.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>
                      {csvResult.added} usuario(s) importados con éxito a la base de datos de Firebase.
                    </span>
                  </div>
                  {csvResult.errors.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-rose-700">
                      {csvResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {csvResult.errors.length > 5 && (
                        <li>... y {csvResult.errors.length - 5} observaciones más.</li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              {/* Preview parsed rows before import */}
              {parsedCsvRows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Vista previa de usuarios detectados:
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        {parsedCsvRows.filter((r) => r.isValid).length} válidos
                      </span>
                      {parsedCsvRows.filter((r) => !r.isValid).length > 0 && (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                          {parsedCsvRows.filter((r) => !r.isValid).length} con errores
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleBulkImport}
                      disabled={isImportingCsv || parsedCsvRows.filter((r) => r.isValid).length === 0}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isImportingCsv ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando en Firebase...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            Importar {parsedCsvRows.filter((r) => r.isValid).length} Usuarios a Firestore
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Estado</th>
                          <th className="py-2 px-3">Nombre</th>
                          <th className="py-2 px-3">Apellido</th>
                          <th className="py-2 px-3">Taller</th>
                          <th className="py-2 px-3">Contraseña</th>
                          <th className="py-2 px-3">Rol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedCsvRows.map((row, idx) => (
                          <tr
                            key={idx}
                            className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50 text-rose-900'}
                          >
                            <td className="py-2 px-3">
                              {row.isValid ? (
                                <span className="inline-flex items-center text-emerald-600 font-bold text-[11px] gap-1">
                                  <Check className="w-3.5 h-3.5" /> Válido
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-rose-600 font-bold text-[11px] gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> {row.error}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-semibold">{row.nombre || '—'}</td>
                            <td className="py-2 px-3 font-semibold">{row.apellido || '—'}</td>
                            <td className="py-2 px-3">{row.taller || '—'}</td>
                            <td className="py-2 px-3 font-mono">{row.contrasena || '—'}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  row.rol === 'admin'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : row.rol === 'docente'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {row.rol}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Sincronizado con Firebase Firestore</span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handlePurgeAllRecords}
                disabled={isPurgingRecords}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Elimina todos los registros de cotejo y evaluaciones guardadas en Firebase"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{isPurgingRecords ? 'Borrando...' : 'Borrar todos los registros'}</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
