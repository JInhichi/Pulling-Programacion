# Activación Dinámica de Escenarios y Simplificación de Subtítulo

Permitir al usuario encender o apagar individualmente cualquiera de los 3 escenarios de simulación (Escenario 1, 2 y 3) mediante botones interactivos tipo chip en la cabecera del gráfico, reflejando de inmediato la ocultación de sus curvas e intervalos en el gráfico, el filtrado en el tooltip comparativo y la atenuación de su tarjeta de métricas, junto con la actualización estricta del subtítulo a "Análisis estocástico".

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Decisiones de diseño y comportamiento confirmadas con el usuario:
> - **Controles de activación**: Botones interactivos tipo chip ubicados en la barra de leyenda/cabecera del gráfico para conmutar fácilmente cada escenario con un solo clic.
> - **Estado desactivado**: Se oculta la curva media y sus límites de confianza del gráfico, se filtra del tooltip flotante para no sobrecargar la lectura, y se atenúa la tarjeta comparativa correspondiente con indicación de estado inactivo y botón de reactivación.
> - **Subtítulo unificado**: El subtítulo tanto del encabezado principal como del gráfico se ajusta de forma limpia y exclusiva a `"Análisis estocástico"`.

---

## 1. Visión General y Concepto Central

- **Propósito**: Proporcionar a los tomadores de decisiones la flexibilidad de aislar o comparar libremente combinaciones de escenarios (por ejemplo, comparar solo Escenario 1 vs Escenario 3 sin interferencia visual del Escenario 2).
- **Subtítulo depurado**: Reemplazar textos largos secundarios por la etiqueta concisa y directa `"Análisis estocástico"`, respetando las directrices de diseño anti-saturación.
- **Valor agregado**: Mayor claridad visual en el análisis de curvas estocásticas densas, facilitando la exportación o presentación de escenarios específicos de pulling de pozos.

---

## 2. Experiencia de Usuario y Diseño Visual

### Controles Interactivos Tipo Chip en la Cabecera del Gráfico
- **Ubicación**: En la barra superior de referencia del gráfico Recharts.
- **Estado Activo**:
  - Borde nítido con el color distintivo de cada escenario (Azul `#1877F2`, Verde Esmeralda `#059669`, Rojo `#E11D48`).
  - Indicador circular sólido y tipografía Inter `font-black`.
  - Icono de ojo visible (`Eye`).
- **Estado Inactivo**:
  - Estilo atenuado (`opacity-50 border-dashed border-slate-300 bg-slate-100 text-slate-400`).
  - Icono de ojo tachado (`EyeOff`) o check destildado.
  - Al hacer clic, se reactiva instantáneamente el escenario sin requerir recálculo de la simulación.

### Visualización en Tarjetas Comparativas de Escenarios
- Cuando un escenario está **activo**: Se muestra con su tarjeta completa, métricas destacadas y colores vivos.
- Cuando un escenario está **desactivado**:
  - La tarjeta pasa a un estado atenuado (`opacity-45 grayscale-[30%] bg-slate-50/70`).
  - Se añade un badge sutil `"Desactivado"` en la cabecera de la tarjeta con un botón rápido para volver a encenderlo.

### Tooltip Inteligente
- `CustomChartTooltip` recibe el estado de visibilidad y muestra únicamente los escenarios que están actualmente activos, manteniendo la comparación limpia y focalizada.

### Subtítulo Unificado
- En el header principal: `"Análisis estocástico"`.
- En el subtítulo del gráfico: `"Análisis estocástico"`.

---

## 3. Arquitectura Técnica y Flujo de Datos

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Simulator Component                             │
│                                                                        │
│  State: visibleScenarios = { s1: boolean, s2: boolean, s3: boolean }   │
│  State: confidenceLevel (90% | 95% | 99%)                              │
│  State: showConfidenceBands (boolean)                                  │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
         ┌──────────▼────────────┐       ┌───────────▼───────────┐
         │ Interactive Chip Bar  │       │ Scenario Metric Cards │
         │  [● S1] [● S2] [○ S3] │       │ S1: Full  S2: Full    │
         │  (toggle on/off)      │       │ S3: Dimmed (Inactive) │
         └──────────┬────────────┘       └───────────────────────┘
                    │
         ┌──────────▼────────────────────────────────────────────┐
         │ Recharts ComposedChart                                │
         │  - If visibleScenarios.s1: <Line s1_mean>, bounds...  │
         │  - If visibleScenarios.s2: <Line s2_mean>, bounds...  │
         │  - If visibleScenarios.s3: [Hidden]                   │
         │                                                       │
         │ Tooltip: Shows filtered rows of active scenarios only │
         └───────────────────────────────────────────────────────┘
```

---

## 4. Plan de Ejecución Paso a Paso

1. **Estado de Visibilidad de Escenarios**:
   - En `src/components/Simulator.tsx`, declarar:
     ```tsx
     const [visibleScenarios, setVisibleScenarios] = useState<Record<string, boolean>>({
       s1: true,
       s2: true,
       s3: true,
     });
     ```
   - Implementar la función `toggleScenario(id: string)` garantizando que el usuario pueda alternar cualquiera de los 3.

2. **Actualización de Subtítulos**:
   - Reemplazar el subtítulo en el encabezado general por `"Análisis estocástico"`.
   - Ajustar el subtítulo del contenedor del gráfico para que declare claramente `"Análisis estocástico"`.

3. **Chips Interactivos en la Cabecera del Gráfico**:
   - Transformar los indicadores estáticos de curvas en botones interactivos accesibles (`<button onClick={() => toggleScenario(scenario.id)} ...>`).
   - Añadir iconos de estado (`Eye` / `EyeOff`), microinteracciones hover y soporte de teclado/clic.

4. **Atenuación de Tarjetas Comparativas**:
   - Condicionar la clase de opacidad y estilo en las 3 tarjetas de KPI superiores (`opacity-50 border-dashed border-slate-300` cuando no está visible).
   - Incluir control directo de activación en la tarjeta para máxima ergonomía de usuario.

5. **Filtrado en Gráfico y Tooltip**:
   - Condicionar la renderización de las líneas del gráfico (`s1_mean`, `s2_mean`, `s3_mean` y sus respectivos intervalos de confianza `s{i}_upper` y `s{i}_lower`) según `visibleScenarios[scenario.id]`.
   - Actualizar `CustomChartTooltip` para filtrar la lista de filas y mostrar exclusivamente los escenarios activos.

6. **Verificación y Compilación**:
   - Ejecutar `compile_applet` y `lint_applet` para asegurar cero errores de tipos o sintaxis.
