import { SimulationParams, SimulationResults } from '../types';

function poissonRandomNumber(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 100);
  return Math.max(0, k - 1);
}

export function runSimulation(
  params: SimulationParams, 
  maxDaysOverride?: number, 
  confidenceLevel: number = 0.95
): SimulationResults {
  const mu = 1 / Math.max(0.1, params.serviceRateDays); // Pozos procesados por día por cada equipo
  const totalMu = Math.max(0.01, params.numEquipments * mu); // Capacidad total diaria del parque
  const utilization = params.arrivalRate / totalMu;
  const isStable = utilization < 1;
  
  const requiredEquipments = Math.max(1, Math.floor(params.arrivalRate / mu) + 1);
  
  let deterministicDaysToClear: number | null = null;
  if (isStable && totalMu > params.arrivalRate) {
    deterministicDaysToClear = params.initialBacklog / (totalMu - params.arrivalRate);
  }

  // Simulación Monte Carlo: 300 réplicas estocásticas
  const numRuns = 300;
  const baseHorizon = deterministicDaysToClear ? Math.ceil(deterministicDaysToClear * 1.8) : 365;
  const maxDays = maxDaysOverride || Math.min(Math.max(baseHorizon, 120), 1825);
  
  const runs: Array<number[]> = [];
  const daysToClearArray: number[] = [];
  
  for (let r = 0; r < numRuns; r++) {
    let backlog = params.initialBacklog;
    const runData: number[] = [backlog];
    let clearedDay: number | null = null;
    
    for (let d = 1; d <= maxDays; d++) {
      if (backlog <= 0 && clearedDay === null) {
        clearedDay = d - 1;
      }
      const arrivals = poissonRandomNumber(params.arrivalRate);
      const processed = poissonRandomNumber(totalMu);
      
      backlog = Math.max(0, backlog + arrivals - processed);
      runData.push(backlog);
    }
    
    if (clearedDay === null && backlog <= 0) {
      clearedDay = maxDays;
    }
    
    runs.push(runData);
    if (clearedDay !== null) {
      daysToClearArray.push(clearedDay);
    }
  }

  // Cuantiles según nivel de confianza (ej. 90% -> 5% y 95%; 95% -> 2.5% y 97.5%; 99% -> 0.5% y 99.5%)
  const alpha = Math.max(0.001, Math.min(0.2, 1 - confidenceLevel));
  const lowerFraction = alpha / 2;
  const upperFraction = 1 - (alpha / 2);

  const lowerIdx = Math.max(0, Math.floor(numRuns * lowerFraction));
  const upperIdx = Math.min(numRuns - 1, Math.floor(numRuns * upperFraction));

  const chartData = [];
  // Sample roughly 100-120 steps for ultra-smooth progressive line animation
  const step = Math.max(1, Math.floor(maxDays / 100));
  
  for (let d = 0; d <= maxDays; d += step) {
    const dayVals = runs.map(r => r[d] ?? 0).sort((a, b) => a - b);
    const mean = dayVals.reduce((a, b) => a + b, 0) / numRuns;
    const lowerBacklog = dayVals[lowerIdx] ?? 0;
    const upperBacklog = dayVals[upperIdx] ?? 0;
    const p5Backlog = dayVals[Math.floor(numRuns * 0.05)] ?? 0;
    const p95Backlog = dayVals[Math.floor(numRuns * 0.95)] ?? 0;

    chartData.push({
      day: d,
      meanBacklog: Math.round(mean * 10) / 10,
      lowerBacklog: Math.round(lowerBacklog * 10) / 10,
      upperBacklog: Math.round(upperBacklog * 10) / 10,
      p5Backlog: Math.round(p5Backlog * 10) / 10,
      p95Backlog: Math.round(p95Backlog * 10) / 10,
    });
  }

  daysToClearArray.sort((a, b) => a - b);
  
  let meanDays: number | null = null;
  let p5Days: number | null = null;
  let p95Days: number | null = null;
  let lowerDays: number | null = null;
  let upperDays: number | null = null;
  const successRate = (daysToClearArray.length / numRuns) * 100;
  
  if (daysToClearArray.length > 0) {
    const n = daysToClearArray.length;
    meanDays = daysToClearArray.reduce((a, b) => a + b, 0) / n;
    p5Days = daysToClearArray[Math.floor(n * 0.05)];
    p95Days = daysToClearArray[Math.min(n - 1, Math.floor(n * 0.95))];
    
    const dLowerIdx = Math.max(0, Math.floor(n * lowerFraction));
    const dUpperIdx = Math.min(n - 1, Math.floor(n * upperFraction));
    lowerDays = daysToClearArray[dLowerIdx];
    upperDays = daysToClearArray[dUpperIdx];
  }

  return {
    isStable,
    utilization,
    requiredEquipments,
    deterministicDaysToClear,
    confidenceLevel,
    monteCarloStats: {
      meanDays,
      p5Days,
      p95Days,
      lowerDays,
      upperDays,
      successRate
    },
    chartData
  };
}
