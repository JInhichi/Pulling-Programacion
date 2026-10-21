import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  Play, 
  RotateCcw, 
  Pause, 
  FastForward, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  BarChart3, 
  Clock, 
  HelpCircle, 
  X, 
  Target,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart, 
  ReferenceLine 
} from 'recharts';
import { runSimulation } from '../utils/simulation';
import { SimulationResults, ScenarioConfig, MergedDataPoint } from '../types';

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: MergedDataPoint;
  }>;
  label?: number | string;
  scenarios: ScenarioConfig[];
  initialBacklog: number;
  confidenceLevel: number;
  showConfidenceBands: boolean;
  visibleScenarios?: Record<string, boolean>;
}

const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  scenarios, 
  initialBacklog,
  confidenceLevel,
  showConfidenceBands,
  visibleScenarios 
}) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const currentDay = typeof dataPoint.day === 'number' ? dataPoint.day : label;

  const allScenarioRows = [
    {
      config: scenarios[0],
      value: dataPoint.s1_mean,
      lower: dataPoint.s1_lower,
      upper: dataPoint.s1_upper,
      borderColor: 'border-l-[#1877F2]',
      colorHex: scenarios[0].color,
    },
    {
      config: scenarios[1],
      value: dataPoint.s2_mean,
      lower: dataPoint.s2_lower,
      upper: dataPoint.s2_upper,
      borderColor: 'border-l-emerald-500',
      colorHex: scenarios[1].color,
    },
    {
      config: scenarios[2],
      value: dataPoint.s3_mean,
      lower: dataPoint.s3_lower,
      upper: dataPoint.s3_upper,
      borderColor: 'border-l-rose-500',
      colorHex: scenarios[2].color,
    },
  ];

  const scenarioRows = allScenarioRows.filter(
    row => !visibleScenarios || visibleScenarios[row.config.id] !== false
  );

  const confPercent = Math.round(confidenceLevel * 100);

  if (scenarioRows.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-300/90 rounded-2xl shadow-2xl p-3.5 min-w-[220px] text-slate-800 font-sans pointer-events-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Día de simulación</span>
          <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Día {currentDay}</span>
        </div>
        <p className="text-xs text-slate-500 italic">Todos los escenarios están desactivados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-300/90 rounded-2xl shadow-2xl p-4 min-w-[305px] max-w-[350px] text-slate-800 font-sans pointer-events-none transition-all">
      {/* Encabezado: Día de Simulación exacto */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Día de simulación
          </span>
        </div>
        <span className="text-xs font-black text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums border border-slate-200">
          Día {currentDay}
        </span>
      </div>

      {/* Comparativa simultánea de los 3 escenarios */}
      <div className="space-y-2">
        {scenarioRows.map(({ config, value, lower, upper, borderColor, colorHex }) => {
          const numVal = typeof value === 'number' ? value : 0;
          const lowerVal = typeof lower === 'number' ? lower : numVal;
          const upperVal = typeof upper === 'number' ? upper : numVal;
          const delta = numVal - initialBacklog;
          const isCleared = numVal <= 0.05;

          return (
            <div
              key={config.id}
              className={`p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 border-l-4 ${borderColor} flex flex-col gap-1.5`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-xs font-black text-slate-950">{config.name}</span>
                  <span className="text-[10px] text-slate-600 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {config.numEquipments} eq.
                  </span>
                </div>
                <div className="text-xs font-black tabular-nums" style={{ color: colorHex }}>
                  {isCleared ? (
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-bold border border-emerald-200/60">
                      0.0 pozos (Meta)
                    </span>
                  ) : (
                    <span>{numVal.toFixed(1)} pozos</span>
                  )}
                </div>
              </div>

              {/* Intervalo de Confianza para este día */}
              {showConfidenceBands && !isCleared && (
                <div className="flex items-center justify-between text-[10.5px] bg-white px-2 py-1 rounded-md border border-slate-200/80 text-slate-600 font-medium">
                  <span className="font-semibold text-slate-700">IC {confPercent}%:</span>
                  <span className="tabular-nums font-bold text-slate-900">
                    {lowerVal.toFixed(1)} a {upperVal.toFixed(1)} pozos
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Ingreso: {config.arrivalRate} pozos/día</span>
                <span className={`tabular-nums font-semibold ${delta <= 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {delta <= 0 ? `${delta.toFixed(1)} vs inicio` : `+${delta.toFixed(1)} vs inicio`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referencia de Cartera Inicial */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span>Cartera inicial:</span>
        <span className="font-bold text-slate-700 tabular-nums">{initialBacklog} pozos</span>
      </div>
    </div>
  );
};

export default function Simulator() {
  // Parámetros Fijos del Backlog
  const [globalParams, setGlobalParams] = useState({
    initialBacklog: 80,
    serviceRateDays: 1.5,
  });

  // Modal explicativo de "¿Qué es la ocupación?"
  const [showOcupacionModal, setShowOcupacionModal] = useState(false);

  // 3 Escenarios con los colores confirmados: Azul Facebook (E1), Verde (E2), Rojo (E3)
  // Con nombres estrictos: Escenario 1, Escenario 2, Escenario 3
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([
    { 
      id: 's1', 
      name: 'Escenario 1', 
      arrivalRate: 2.5, 
      numEquipments: 4, 
      color: '#1877F2', // Azul Facebook
      accentBg: 'rgba(24, 119, 242, 0.08)' 
    },
    { 
      id: 's2', 
      name: 'Escenario 2', 
      arrivalRate: 2.5, 
      numEquipments: 5, 
      color: '#10b981', // Verde
      accentBg: 'rgba(16, 185, 129, 0.08)' 
    },
    { 
      id: 's3', 
      name: 'Escenario 3', 
      arrivalRate: 3.0, 
      numEquipments: 6, 
      color: '#ef4444', // Rojo
      accentBg: 'rgba(239, 68, 68, 0.08)' 
    },
  ]);

  // Configuración de Nivel de Confianza Estadística (90%, 95%, 99%)
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(true);

  // Activación / Desactivación individual de cada escenario (por defecto todos activos)
  const [visibleScenarios, setVisibleScenarios] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
    s3: true,
  });

  const toggleScenario = (id: string) => {
    setVisibleScenarios(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setAllScenarios = (status: boolean) => {
    setVisibleScenarios({
      s1: status,
      s2: status,
      s3: status,
    });
  };

  // Almacén de resultados
  const [results, setResults] = useState<{
    res1: SimulationResults;
    res2: SimulationResults;
    res3: SimulationResults;
    fullMergedData: MergedDataPoint[];
    maxSimulationDay: number;
  } | null>(null);

  // Estados de simulación y animación
  const [isComputing, setIsComputing] = useState(false);
  const [computeProgress, setComputeProgress] = useState(0);

  // Trazado Progresivo Continuo (con velocidad pausada y suave fija)
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlayingTrace, setIsPlayingTrace] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  // Intervalo fijo pausado para una apreciación clara y elegante del avance diario
  const TRACE_INTERVAL_MS = 85;

  // Función pura de cálculo de Monte Carlo y combinación de datos
  const computeSimulationData = (targetConfidence: number) => {
    const deterministicDays = scenarios.map(s => {
      const mu = 1 / Math.max(0.1, globalParams.serviceRateDays);
      const totalMu = s.numEquipments * mu;
      if (totalMu > s.arrivalRate) {
        return globalParams.initialBacklog / (totalMu - s.arrivalRate);
      }
      return 365;
    });

    const maxDet = Math.max(...deterministicDays);
    const overallMaxDays = Math.min(Math.max(Math.ceil((maxDet || 365) * 1.8), 120), 1825);

    const r1 = runSimulation({ ...globalParams, ...scenarios[0] }, overallMaxDays, targetConfidence);
    const r2 = runSimulation({ ...globalParams, ...scenarios[1] }, overallMaxDays, targetConfidence);
    const r3 = runSimulation({ ...globalParams, ...scenarios[2] }, overallMaxDays, targetConfidence);

    // Generar puntos combinados uniformemente con medias e intervalos
    const daySteps = Array.from(new Set([
      ...r1.chartData.map(d => d.day),
      ...r2.chartData.map(d => d.day),
      ...r3.chartData.map(d => d.day)
    ])).sort((a, b) => a - b);

    const fullMerged: MergedDataPoint[] = daySteps.map(day => {
      const p1 = r1.chartData.find(d => d.day === day) || r1.chartData[r1.chartData.length - 1];
      const p2 = r2.chartData.find(d => d.day === day) || r2.chartData[r2.chartData.length - 1];
      const p3 = r3.chartData.find(d => d.day === day) || r3.chartData[r3.chartData.length - 1];

      return {
        day,
        s1_mean: p1 ? p1.meanBacklog : 0,
        s1_lower: p1 ? p1.lowerBacklog : 0,
        s1_upper: p1 ? p1.upperBacklog : 0,
        s2_mean: p2 ? p2.meanBacklog : 0,
        s2_lower: p2 ? p2.lowerBacklog : 0,
        s2_upper: p2 ? p2.upperBacklog : 0,
        s3_mean: p3 ? p3.meanBacklog : 0,
        s3_lower: p3 ? p3.lowerBacklog : 0,
        s3_upper: p3 ? p3.upperBacklog : 0,
      };
    });

    return {
      res1: r1,
      res2: r2,
      res3: r3,
      fullMergedData: fullMerged,
      maxSimulationDay: overallMaxDays,
    };
  };

  // Cambio dinámico e inmediato de nivel de confianza estadística
  const handleConfidenceChange = (newLevel: number) => {
    setConfidenceLevel(newLevel);
    if (results) {
      const updated = computeSimulationData(newLevel);
      setResults(updated);
    }
  };

  // Ejecución de la simulación con barra envolvente
  const handleStartSimulation = () => {
    if (isComputing) return;
    setIsPlayingTrace(false);
    setIsComputing(true);
    setComputeProgress(0);

    const startTime = Date.now();
    const duration = 1100; // 1.1s para visualizar el progreso estocástico de cálculo

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setComputeProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
        
        const computed = computeSimulationData(confidenceLevel);
        setResults(computed);

        setIsComputing(false);
        // Iniciar trazado progresivo continuo
        setCurrentFrameIndex(0);
        setIsPlayingTrace(true);
      }
    }, 25);
  };

  // Motor de animación continua del trazado
  useEffect(() => {
    if (!isPlayingTrace || !results) return;

    let lastTimestamp = performance.now();

    const stepAnimation = (now: number) => {
      if (now - lastTimestamp >= TRACE_INTERVAL_MS) {
        lastTimestamp = now;
        setCurrentFrameIndex(prev => {
          if (prev >= results.fullMergedData.length - 1) {
            setIsPlayingTrace(false);
            return results.fullMergedData.length - 1;
          }
          return prev + 1;
        });
      }
      animationFrameRef.current = requestAnimationFrame(stepAnimation);
    };

    animationFrameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlayingTrace, results]);

  // Ejecución inicial automática
  useEffect(() => {
    handleStartSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers de cambios
  const handleGlobalChange = (key: keyof typeof globalParams, val: number) => {
    setGlobalParams(prev => ({ ...prev, [key]: Math.max(0.1, val) }));
  };

  const handleScenarioChange = (index: number, field: 'arrivalRate' | 'numEquipments', val: number) => {
    setScenarios(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Math.max(0.1, val) };
      return next;
    });
  };

  // Datos recortados para el trazado continuo en pantalla
  const visibleData = results ? results.fullMergedData.slice(0, currentFrameIndex + 1) : [];
  const currentSimDay = visibleData.length > 0 ? visibleData[visibleData.length - 1].day : 0;
  const totalDays = results ? results.maxSimulationDay : 100;
  const progressRatio = results ? Math.min(100, Math.round((currentSimDay / totalDays) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#1877F2]/15 selection:text-[#1877F2]">
      {/* ── Top Bar Contract (1 Fila, 3 Zonas - Blanco, Azul Facebook y Negro) ── */}
      <header className="h-18 border-b border-slate-200/90 bg-white px-4 md:px-8 flex items-center justify-between gap-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Zone 1: Brand Wordmark Sans-serif con Gran Jerarquía */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tight text-slate-950 flex items-center gap-1.5">
              Pulling <span className="text-[#1877F2] font-black">Simulator</span>
            </span>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Análisis estocástico
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Info & Botón Explicativo "¿Qué es ocupación?" */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-700 font-medium">
          <button
            onClick={() => setShowOcupacionModal(true)}
            className="flex items-center gap-1.5 text-[#1877F2] hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-200/80 transition-colors font-semibold cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>¿Qué es Ocupación?</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => toggleScenario('s1')}
            className={`flex items-center gap-1.5 font-semibold transition-opacity cursor-pointer hover:opacity-80 ${
              visibleScenarios.s1 ? 'text-slate-900 opacity-100' : 'text-slate-400 opacity-40 line-through'
            }`}
            title="Activar / Desactivar Escenario 1"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]"></span> Escenario 1
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => toggleScenario('s2')}
            className={`flex items-center gap-1.5 font-semibold transition-opacity cursor-pointer hover:opacity-80 ${
              visibleScenarios.s2 ? 'text-slate-900 opacity-100' : 'text-slate-400 opacity-40 line-through'
            }`}
            title="Activar / Desactivar Escenario 2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Escenario 2
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => toggleScenario('s3')}
            className={`flex items-center gap-1.5 font-semibold transition-opacity cursor-pointer hover:opacity-80 ${
              visibleScenarios.s3 ? 'text-slate-900 opacity-100' : 'text-slate-400 opacity-40 line-through'
            }`}
            title="Activar / Desactivar Escenario 3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Escenario 3
          </button>
        </div>

        {/* Zone 3: Primary Simulation Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleStartSimulation}
            disabled={isComputing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-950 hover:bg-slate-800 active:bg-black transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer tracking-wide"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isComputing ? 'animate-spin' : ''}`} />
            <span>{isComputing ? 'Calculando Monte Carlo...' : 'Ejecutar Simulación'}</span>
          </button>
        </div>
      </header>

      {/* ── Modal Explicativo de Ocupación (Sans-serif Elegante y Claro) ── */}
      {showOcupacionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-7 shadow-2xl relative text-left">
            <button 
              onClick={() => setShowOcupacionModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center border border-blue-100">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight">¿Qué es la Ocupación (ρ)?</h3>
                <p className="text-xs text-slate-500 font-medium">Relación fundamental entre Demanda y Capacidad del Parque</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                La <strong className="text-slate-950 font-bold">Ocupación (denotada con la letra griega ρ)</strong> mide la relación porcentual entre los pozos que fallan diariamente y la capacidad total de trabajo que poseen los equipos de pulling para atenderlos:
              </p>
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold tracking-wide text-center">
                Ocupación = Tasa de pozos que fallan / Capacidad total diaria de los equipos
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">
                    <strong className="text-emerald-700 font-bold">Menor al 100% (Capacidad suficiente):</strong> Los equipos reparan más pozos de los que ingresan cada día. La cartera descenderá progresivamente hasta <strong className="text-slate-950 font-bold">llegar a cero pozos</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">
                    <strong className="text-orange-700 font-bold">Mayor al 100% (Sobrecarga / Inestable):</strong> Se averían más pozos de los que los equipos pueden reparar. La cartera nunca llegará a cero y continuará acumulándose indefinidamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowOcupacionModal(false)}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Barra Envolvente de Cómputo (Plomo y Azul Facebook) ── */}
      {isComputing && (
        <div className="w-full bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-ping"></div>
            <span className="text-slate-800 font-semibold">
              Calculando 300 réplicas Monte Carlo y distribuciones estocásticas de Poisson...
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-950 font-black tabular-nums">{computeProgress}%</span>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-slate-600 via-[#1877F2] to-slate-950 transition-all duration-75"
                style={{ width: `${computeProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Layout Principal (Sidebar de Parámetros + Lienzo Analítico) ── */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ── Panel Izquierdo: Configuración Técnica (Tarjetas Blancas y Acentos) ── */}
        <aside className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Tarjeta 1: Backlog con Título Grande y Destacado */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200/60">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-slate-950 uppercase tracking-wider">Backlog</h2>
                  <span className="text-[11px] text-slate-500 font-medium">Parámetros iniciales de cartera</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-md">
                Base Fija
              </span>
            </div>

            <div className="space-y-4">
              {/* Backlog Inicial */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <label className="text-slate-800 font-semibold">Pozos Iniciales en Cartera</label>
                  <span className="text-slate-950 font-bold tabular-nums bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {globalParams.initialBacklog} pozos
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={globalParams.initialBacklog}
                  onChange={(e) => handleGlobalChange('initialBacklog', parseInt(e.target.value, 10))}
                  className="w-full accent-[#1877F2] bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>10 pozos</span>
                  <span>300 pozos</span>
                </div>
              </div>

              {/* Tiempo Medio de Servicio (Días/Pozo) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Días por Pozo (1/μ)</span>
                  </label>
                  <span className="text-slate-950 font-bold tabular-nums bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {globalParams.serviceRateDays} días / pozo
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={globalParams.serviceRateDays}
                  onChange={(e) => handleGlobalChange('serviceRateDays', parseFloat(e.target.value))}
                  className="w-full accent-slate-800 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>0.5 días (Rápido)</span>
                  <span>5.0 días (Complejo)</span>
                </div>
              </div>
            </div>

            {/* Métrica Derivada: Ritmo de servicio por equipo */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Ritmo por equipo (μ):</span>
              <span className="text-slate-950 font-bold tabular-nums">
                {(1 / globalParams.serviceRateDays).toFixed(2)} pozos / día
              </span>
            </div>
          </div>

          {/* Tarjeta 2: Escenarios con Título Grande y Destacado */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200/60">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-950 uppercase tracking-wider">
                    Escenarios
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    3 Estrategias comparativas
                  </span>
                </div>
              </div>
            </div>

            {scenarios.map((sc, idx) => {
              const mu = 1 / Math.max(0.1, globalParams.serviceRateDays);
              const totalCapacity = sc.numEquipments * mu;
              const rho = sc.arrivalRate / Math.max(0.001, totalCapacity);
              const isStable = rho < 1.0;

              return (
                <div 
                  key={sc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all hover:border-slate-300 relative overflow-hidden"
                >
                  {/* Borde sutil lateral con el color del escenario */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: sc.color }}
                  ></div>

                  {/* Header de la tarjeta del escenario: ÚNICAMENTE Escenario 1, 2, 3 */}
                  <div className="flex items-center justify-between mb-3.5 pl-1.5">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: sc.color }}
                      ></span>
                      <h4 className="text-base font-bold text-slate-950 tracking-tight">{sc.name}</h4>
                    </div>

                    {/* Estado de ocupación sin "(da abasto)" */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {isStable ? (
                        <span className="text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Ocupación: {(rho * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-rose-800 font-bold flex items-center gap-1.5 bg-rose-50 border border-rose-200/70 px-2.5 py-1 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                          Ocupación: {(rho * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controles de Entrada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 pl-1.5">
                    {/* Pozos que ingresan a pulling por día */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <label className="text-[11px] text-slate-700 font-bold flex items-start gap-1 mb-1.5 leading-snug">
                        Pozos que ingresan a pulling por día
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="15"
                          value={sc.arrivalRate}
                          onChange={(e) => handleScenarioChange(idx, 'arrivalRate', parseFloat(e.target.value))}
                          className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-950 text-base font-black outline-none focus:border-[#1877F2] transition-colors tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Equipos disponibles */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <label className="text-[11px] text-slate-700 font-bold flex items-center gap-1.5 mb-1.5 leading-snug">
                        <Wrench className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Equipos disponibles</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="25"
                          value={sc.numEquipments}
                          onChange={(e) => handleScenarioChange(idx, 'numEquipments', parseInt(e.target.value, 10))}
                          className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-950 text-base font-black outline-none focus:border-[#1877F2] transition-colors tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Micro-barra de Balance Capacidad vs Demanda */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 pl-1.5 font-medium">
                    <span>Capacidad: <strong className="text-slate-900">{totalCapacity.toFixed(2)}</strong> pozos/d</span>
                    <span className={isStable ? 'text-emerald-700 font-bold' : 'text-orange-700 font-bold'}>
                      Reducción neta: {(totalCapacity - sc.arrivalRate).toFixed(2)} pozos/d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Panel Derecho: Visualización y Trazado Progresivo Continuo ── */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Tarjetas KPI Superiores con Gran Jerarquía y Números Gigantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results && [
              { res: results.res1, scenario: scenarios[0] },
              { res: results.res2, scenario: scenarios[1] },
              { res: results.res3, scenario: scenarios[2] },
            ].map(({ res, scenario }, idx) => {
              const isStable = res.isStable;
              const meanDays = res.monteCarloStats.meanDays;
              const p5 = res.monteCarloStats.p5Days;
              const p95 = res.monteCarloStats.p95Days;
              const isVisible = visibleScenarios[scenario.id] !== false;

              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 p-5 relative overflow-hidden flex flex-col justify-between ${
                    isVisible 
                      ? 'bg-white border-slate-200/90 shadow-xs' 
                      : 'bg-slate-50/70 border-dashed border-slate-300 opacity-40 grayscale-[35%]'
                  }`}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5 transition-opacity"
                    style={{ backgroundColor: scenario.color, opacity: isVisible ? 1 : 0.3 }}
                  ></div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`w-3 h-3 rounded-full shrink-0 transition-opacity ${isVisible ? 'opacity-100' : 'opacity-40'}`} 
                          style={{ backgroundColor: scenario.color }}
                        ></span>
                        <span className={`font-black text-base ${isVisible ? 'text-slate-950' : 'text-slate-500'}`}>
                          {scenario.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold">
                          {scenario.numEquipments} Equipos
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleScenario(scenario.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isVisible 
                              ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' 
                              : 'text-slate-500 hover:text-slate-700 bg-slate-200/70'
                          }`}
                          title={isVisible ? `Desactivar ${scenario.name}` : `Activar ${scenario.name}`}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isStable ? (
                      <div className="mt-2">
                        {/* Métrica Principal: Días para llegar a 0 pozos en cartera */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
                          <Target className="w-4 h-4 text-[#1877F2]" />
                          <span>Días para llegar a 0 pozos:</span>
                        </div>
                        
                        <div className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight flex items-baseline gap-2 mt-2">
                          {meanDays ? Math.ceil(meanDays) : '—'}
                          <span className="text-xs font-bold text-emerald-700 tracking-normal">días estimados</span>
                        </div>

                        {/* Rango estimado dinámico según nivel de confianza */}
                        <div className="text-xs text-slate-700 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-slate-500 font-medium">
                              Rango IC {(confidenceLevel * 100).toFixed(0)}%:
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              P{(((1 - confidenceLevel) / 2) * 100).toFixed(1)}% - P{((1 - (1 - confidenceLevel) / 2) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <strong className="text-slate-950 font-black">
                              {res.monteCarloStats.lowerDays !== null ? Math.ceil(res.monteCarloStats.lowerDays) : (p5 ? Math.ceil(p5) : 0)} a{' '}
                              {res.monteCarloStats.upperDays !== null ? Math.ceil(res.monteCarloStats.upperDays) : (p95 ? Math.ceil(p95) : 0)} días
                            </strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Días para llegar a 0 pozos:</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-rose-700 mt-2">
                          No alcanzable
                        </div>
                        <p className="text-xs text-slate-600 mt-2 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200/60 leading-snug font-medium">
                          La demanda diaria supera la capacidad total del parque de equipos instalados.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pie de tarjeta con reducción y tasa */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Reducción neta:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {((scenario.numEquipments / globalParams.serviceRateDays) - scenario.arrivalRate).toFixed(2)} pozos/día
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico Central con Trazado Continuo y Título Destacado */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col flex-1 min-h-[480px]">
            
            {/* Header del Gráfico con Gran Presencia */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <span>Reducción de Cartera de Pozos en el Tiempo</span>
                  <span className="text-xs font-semibold text-slate-500">
                    (Análisis estocástico)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Análisis estocástico
                </p>
              </div>

              {/* Controles de Confianza Estadística y Reproducción */}
              {results && (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Selector de Nivel de Confianza (90%, 95%, 99%) y Toggle */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 px-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span>Nivel IC:</span>
                    </span>

                    <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                      {[0.90, 0.95, 0.99].map((lvl) => {
                        const isSelected = confidenceLevel === lvl;
                        const label = `${Math.round(lvl * 100)}%`;
                        return (
                          <button
                            key={lvl}
                            onClick={() => handleConfidenceChange(lvl)}
                            className={`px-2.5 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-950 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                            }`}
                            title={`Nivel de confianza ${label} (Intervalo percentiles: ${(((1 - lvl) / 2) * 100).toFixed(1)}% a ${((1 - (1 - lvl) / 2) * 100).toFixed(1)}%)`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

                    {/* Toggle de Líneas Punteadas */}
                    <button
                      onClick={() => setShowConfidenceBands(!showConfidenceBands)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        showConfidenceBands
                          ? 'bg-blue-50 text-[#1877F2] border border-blue-200 font-black'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title={showConfidenceBands ? 'Ocultar líneas punteadas de intervalo IC' : 'Mostrar líneas punteadas de intervalo IC'}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
                      <span>Líneas IC</span>
                    </button>
                  </div>

                  {/* Controles de Reproducción (Play/Pause, Reiniciar, Ver Todo y Contador) */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setIsPlayingTrace(!isPlayingTrace)}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer"
                      title={isPlayingTrace ? 'Pausar trazado' : 'Reproducir trazado continuo'}
                    >
                      {isPlayingTrace ? <Pause className="w-4 h-4 text-orange-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setIsPlayingTrace(false);
                        setCurrentFrameIndex(0);
                      }}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Reiniciar trazado al Día 0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsPlayingTrace(false);
                        setCurrentFrameIndex(results.fullMergedData.length - 1);
                      }}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Mostrar curva completa directamente"
                    >
                      <FastForward className="w-4 h-4 text-slate-700" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1"></div>

                    <span className="text-xs text-slate-950 font-bold px-1 tabular-nums">
                      Día {currentSimDay} <span className="text-slate-500 font-medium">/ {totalDays}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de progreso de trazado interactiva */}
            {results && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-pulse"></span>
                    Evolución temporal del parque de equipos
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">{progressRatio}% proyectado</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1877F2] via-emerald-500 to-slate-900 transition-all duration-75"
                    style={{ width: `${progressRatio}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Botones Interactivos tipo Chip para Activar/Desactivar cada Escenario */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Escenarios:
                </span>
                {scenarios.map((scenario) => {
                  const isVisible = visibleScenarios[scenario.id] !== false;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => toggleScenario(scenario.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                        isVisible
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-300 hover:border-slate-400'
                          : 'bg-slate-200/60 text-slate-400 border border-dashed border-slate-300 hover:bg-slate-200 line-through'
                      }`}
                      title={isVisible ? `Desactivar curva de ${scenario.name}` : `Activar curva de ${scenario.name}`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-opacity ${
                          isVisible ? 'opacity-100' : 'opacity-30'
                        }`}
                        style={{ backgroundColor: scenario.color }}
                      />
                      <span>{scenario.name}</span>
                      {isVisible ? (
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const anyOff = Object.values(visibleScenarios).some(v => !v);
                    setAllScenarios(anyOff);
                  }}
                  className="text-[11px] font-bold text-[#1877F2] hover:text-blue-700 hover:underline px-1.5 py-1 ml-1 cursor-pointer"
                >
                  {Object.values(visibleScenarios).some(v => !v) ? 'Mostrar todos' : 'Ocultar todos'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {showConfidenceBands && (
                  <div className="flex items-center gap-1.5 font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="w-3.5 border-b-2 border-dashed border-slate-500"></span>
                    <span>Límites IC {Math.round(confidenceLevel * 100)}%</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70">
                  <span className="w-3.5 border-b-2 border-dashed border-emerald-600"></span>
                  <span>Meta: 0 pozos</span>
                </div>
              </div>
            </div>

            {/* Lienzo Recharts (Fondo Blanco, Ejes Definidos y Tipografía Inter Sans-serif) */}
            <div className="flex-1 w-full min-h-[380px]">
              {results && visibleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={visibleData} 
                    margin={{ top: 20, right: 35, left: 15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" strokeOpacity={0.8} />
                    
                    {/* Eje X con título, ticks y línea visible */}
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#334155', fontSize: 11, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }} 
                      tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                      tickFormatter={(val) => `Día ${val}`}
                      domain={[0, results.maxSimulationDay]}
                      type="number"
                      label={{ 
                        value: 'Días de operación / simulación', 
                        position: 'insideBottom', 
                        offset: -14,
                        style: { textAnchor: 'middle', fill: '#0f172a', fontSize: 12, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" } 
                      }}
                    />
                    
                    {/* Eje Y con título vertical, ticks y línea visible */}
                    <YAxis 
                      tick={{ fill: '#334155', fontSize: 11, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }} 
                      tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                      domain={[0, 'auto']}
                      label={{ 
                        value: 'Pozos en cartera', 
                        angle: -90, 
                        position: 'insideLeft', 
                        offset: -5,
                        style: { textAnchor: 'middle', fill: '#0f172a', fontSize: 12, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" } 
                      }}
                    />

                    {/* Línea objetivo meta: Cero pozos en cartera (ubicada a la derecha para no chocar con Día 0) */}
                    <ReferenceLine 
                      y={0} 
                      stroke="#10b981" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                      label={{ 
                        value: 'Meta: 0 pozos en cartera', 
                        fill: '#047857', 
                        fontSize: 11, 
                        position: 'insideTopRight',
                        offset: 8,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 700
                      }} 
                    />

                    <Tooltip 
                      content={(props: any) => (
                        <CustomChartTooltip 
                          {...props} 
                          scenarios={scenarios} 
                          initialBacklog={globalParams.initialBacklog} 
                          confidenceLevel={confidenceLevel}
                          showConfidenceBands={showConfidenceBands}
                          visibleScenarios={visibleScenarios}
                        />
                      )}
                      cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      isAnimationActive={false}
                    />

                    {/* Escenario 1: Azul Facebook */}
                    {visibleScenarios[scenarios[0].id] !== false && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="s1_mean" 
                          name="Escenario 1 (Media)"
                          stroke={scenarios[0].color} 
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 5, fill: scenarios[0].color, stroke: '#ffffff', strokeWidth: 2 }}
                          isAnimationActive={false}
                        />
                        {showConfidenceBands && (
                          <>
                            <Line 
                              type="monotone" 
                              dataKey="s1_upper" 
                              name="Escenario 1 (Límite Superior)"
                              stroke={scenarios[0].color} 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              strokeOpacity={0.75}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="s1_lower" 
                              name="Escenario 1 (Límite Inferior)"
                              stroke={scenarios[0].color} 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              strokeOpacity={0.75}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </>
                        )}
                      </>
                    )}

                    {/* Escenario 2: Verde */}
                    {visibleScenarios[scenarios[1].id] !== false && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="s2_mean" 
                          name="Escenario 2 (Media)"
                          stroke={scenarios[1].color} 
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 5, fill: scenarios[1].color, stroke: '#ffffff', strokeWidth: 2 }}
                          isAnimationActive={false}
                        />
                        {showConfidenceBands && (
                          <>
                            <Line 
                              type="monotone" 
                              dataKey="s2_upper" 
                              name="Escenario 2 (Límite Superior)"
                              stroke={scenarios[1].color} 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              strokeOpacity={0.75}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="s2_lower" 
                              name="Escenario 2 (Límite Inferior)"
                              stroke={scenarios[1].color} 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              strokeOpacity={0.75}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </>
                        )}
                      </>
                    )}

                    {/* Escenario 3: Rojo */}
                    {visibleScenarios[scenarios[2].id] !== false && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="s3_mean" 
                          name="Escenario 3 (Media)"
                          stroke={scenarios[2].color} 
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 5, fill: scenarios[2].color, stroke: '#ffffff', strokeWidth: 2 }}
                          isAnimationActive={false}
                        />
                        {showConfidenceBands && (
                          <>
                            <Line 
                              type="monotone" 
                              dataKey="s3_upper" 
                              name="Escenario 3 (Límite Superior)"
                              stroke={scenarios[2].color} 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              strokeOpacity={0.75}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="s3_lower" 
                              name="Escenario 3 (Límite Inferior)"
                              stroke={scenarios[2].color} 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              strokeOpacity={0.75}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </>
                        )}
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                  <BarChart3 className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                  <span>Esperando corrida estocástica...</span>
                </div>
              )}
            </div>

            {/* Leyenda Técnica al Pie del Gráfico: Escenario 1, 2, 3 e Intervalos */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => toggleScenario(scenarios[0].id)}
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                    visibleScenarios[scenarios[0].id] !== false ? 'opacity-100' : 'opacity-40 line-through'
                  }`}
                  title={visibleScenarios[scenarios[0].id] !== false ? `Desactivar ${scenarios[0].name}` : `Activar ${scenarios[0].name}`}
                >
                  <span className="w-3 h-1.5 rounded-full bg-[#1877F2]"></span>
                  <span className="text-slate-900 font-bold">{scenarios[0].name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleScenario(scenarios[1].id)}
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                    visibleScenarios[scenarios[1].id] !== false ? 'opacity-100' : 'opacity-40 line-through'
                  }`}
                  title={visibleScenarios[scenarios[1].id] !== false ? `Desactivar ${scenarios[1].name}` : `Activar ${scenarios[1].name}`}
                >
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-900 font-bold">{scenarios[1].name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleScenario(scenarios[2].id)}
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                    visibleScenarios[scenarios[2].id] !== false ? 'opacity-100' : 'opacity-40 line-through'
                  }`}
                  title={visibleScenarios[scenarios[2].id] !== false ? `Desactivar ${scenarios[2].name}` : `Activar ${scenarios[2].name}`}
                >
                  <span className="w-3 h-1.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-900 font-bold">{scenarios[2].name}</span>
                </button>

                {showConfidenceBands && (
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-4 border-b-2 border-dashed border-slate-500"></span>
                    <span>Líneas punteadas: Límites IC {Math.round(confidenceLevel * 100)}%</span>
                  </div>
                )}
              </div>

              <div className="text-slate-500 text-[11px] flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tiempo discreto con arribos y servicios Poisson diarios</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer Minimalista Sans-serif ── */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Simulador de Capacidad de Pulling · Modelo Estocástico de Teoría de Colas M/M/c y Monte Carlo
      </footer>
    </div>
  );
}
