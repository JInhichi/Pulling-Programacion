# Plan de Implementación: Entrada Manual de Pozos Iniciales y Parámetros del Simulador

Permitir el ingreso manual numérico interactivo directamente sincronizado con controles deslizantes para los pozos iniciales en cartera (con rango ajustado a 1-100 pozos) y habilitar una experiencia homogénea de doble entrada (numérica + deslizante) en todos los parámetros de entrada del simulador.

---

## 1. Ajustes en "Pozos Iniciales en Cartera" (Backlog)
- **Rango Numérico**: Actualizar límites a **1 a 100 pozos** (mínimo 1, máximo 100, paso 1).
- **Entrada Manual**:
  - Reemplazar la etiqueta estática de lectura por un campo numérico interactivo editable (`<input type="number" min="1" max="100" step="1" ... />`).
  - Ubicarlo junto a la etiqueta del parámetro o al lado del control deslizante con un badge de unidad (`pozos`).
  - Sincronización bidireccional instantánea: al escribir o usar los botones paso a paso, el slider se mueve automáticamente; al arrastrar el slider, el campo numérico se actualiza.
  - Validación y tolerancia de escritura: permitir vaciar el campo para reescribir y limitar entre 1 y 100 al completar la edición (`onBlur`/`onChange`).
- **Etiquetas de extremos del slider**: Actualizar a "1 pozo" y "100 pozos".

---

## 2. Ajustes en "Días por Pozo (1/μ)"
- **Entrada Manual Sincronizada**:
  - Incorporar campo numérico interactivo (`<input type="number" min="0.5" max="5.0" step="0.1" ... />`) junto al slider.
  - Sincronización bidireccional completa con el slider existente (rango 0.5 a 5.0 días/pozo).
  - Badge de unidad claro (`días`).

---

## 3. Optimización en Parámetros de los Escenarios
- **Pozos que ingresan a pulling por día (Tasa de arribos)**:
  - Optimizar el campo de entrada numérica directa (`min="0.1"`, `max="15.0"`, `step="0.1"`).
  - Incluir control deslizante compacto complementario para ajuste rápido con mouse o touch.
- **Equipos disponibles**:
  - Optimizar el campo de entrada numérica directa (`min="1"`, `max="25"`, `step="1"`).
  - Incluir control deslizante compacto complementario o botones rápidos +/-.

---

## 4. Verificación y Calidad
- Comprobar que todos los cálculos de Monte Carlo, bandas de confianza y métricas KPI respondan instantáneamente ante cambios manuales o por slider.
- Verificar consistencia estética con la paleta de diseño (bordes Slate, acento Azul `#1877F2`, tipografía nítida y badges limpios).
- Ejecutar compilación (`compile_applet`) para garantizar cero errores de tipos o sintaxis.
