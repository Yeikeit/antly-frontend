## Context

El wizard de creación de presupuesto tiene 3 pasos distribuidos en rutas separadas. El problema central es que Next.js App Router desmonta los componentes al navegar entre rutas, destruyendo el estado local de hooks como `useIncomeSources` y `useBudget`. Los contexts existentes (`BudgetStepContext`, `incomeStepContex`) se crearon con esa intención pero nunca se conectaron a los hooks.

La solución es un único React Context provisto en un layout intermedio que englobe todas las páginas del wizard. Los hooks locales existentes pasan a ser wrappers delgados que leen/escriben en ese context.

## Goals / Non-Goals

**Goals:**
- Estado del wizard persiste mientras el usuario navega entre pasos
- Un solo context con tipado fuerte que modela todo el flujo
- Paso 3 (confirmación) tiene acceso completo a datos de pasos 1 y 2
- Número de step dinámico desde el context, no hardcodeado
- Layout compartido activa/desactiva el provider exactamente donde se necesita

**Non-Goals:**
- No cambiar la UI visual de paso 1 ni paso 2
- No persistir el estado en localStorage ni en servidor (se pierde si el usuario refresca)
- No modificar los componentes de UI individuales (BudgetWrapper, IncomeCard, etc.)
- No tocar el sistema de autenticación ni otros flujos de la app

## Decisions

### 1. Provider en layout de route group `(wizard)` — no en layout raíz

**Decisión:** Crear `app/(wizard)/layout.tsx` con `BudgetFlowProvider`.

**Alternativas consideradas:**
- Layout raíz (`app/layout.tsx`): innecesario para toda la app, contamina el contexto global
- Cada página monta su propio provider: exactamente el bug actual, no soluciona nada
- `(wizard)` route group es la herramienta de Next.js App Router diseñada para este caso

### 2. Un único `BudgetFlowContext` reemplaza a los dos existentes

**Decisión:** `store/BudgetFlowContext.tsx` contiene:
```ts
type BudgetFlowState = {
  step: number
  incomeSources: IncomeSource[]
  totalIncome: number
  categories: Category[]
  selectedCategoryId: string | null
}
```

**Alternativas consideradas:**
- Mantener dos contexts coordinados: complejidad sin beneficio, el flujo es lineal
- Zustand/Jotai: dependencia externa innecesaria para un wizard puntual

### 3. Hooks locales como wrappers del context

**Decisión:** `useIncomeSources` y `useBudget` internamente llaman `useBudgetFlow()` para leer/escribir. Sus interfaces públicas (lo que consumen los screens) no cambian.

**Beneficio:** Los componentes `IncomeScreen` y `BudgetScreen` no necesitan tocar la lógica del context directamente. La refactorización es contenida.

### 4. Paso 3 como página nueva con componente propio

**Decisión:** `app/(wizard)/budgetConfirmation/page.tsx` + `components/wizard/BudgetConfirmationScreen.tsx`.

El screen lee directamente del context vía `useBudgetFlow()` y muestra:
- Lista de income sources con montos
- Total de ingresos
- Lista de categorías con subcategorías y montos asignados
- Total asignado vs total disponible
- Botón "Crear presupuesto" → llama API y redirige al dashboard

## Risks / Trade-offs

- **Recarga de página borra el wizard** → Mitigación: el flujo es corto (3 pasos), es aceptable. Se puede agregar persistencia en sessionStorage en una iteración futura si el usuario lo pide.
- **Mover páginas entre route groups puede romper rutas** → Mitigación: verificar que las rutas URL resultantes coincidan con los `href` de los botones de navegación entre pasos.
- **`(wizard)` incluye `settingIncomes` que hoy está en `(incomes)`** → Mover la página es un cambio de carpeta, no de URL (los route groups no afectan la URL en Next.js).
