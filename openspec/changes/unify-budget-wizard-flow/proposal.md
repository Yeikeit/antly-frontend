## Why

El flujo de creación de presupuesto (settingBudget → settingIncomes → budgetAllocation) pierde el estado entre pasos porque los datos viven en hooks locales que se destruyen al navegar. Los dos contexts existentes (`BudgetStepContext`, `incomeStepContex`) están definidos pero nunca se consumen, son letra muerta.

## What Changes

- **BREAKING** Eliminar `store/BudgetStepContext.tsx` e `store/incomeStepContex.tsx`
- Crear `store/BudgetFlowContext.tsx` — único context que persiste todo el estado del wizard
- Crear route group `app/(wizard)/` con `layout.tsx` que provee `BudgetFlowContext`
- Mover páginas `settingBudget`, `settingIncomes`, `budgetAllocation` al grupo `(wizard)`
- Refactorizar `hooks/income/useIncomeSources.ts` para leer/escribir en `BudgetFlowContext`
- Refactorizar `hooks/budget/useBudget.ts` para leer/escribir en `BudgetFlowContext`
- Crear paso 3: `app/(wizard)/budgetConfirmation/page.tsx` — pantalla de resumen antes de confirmar
- Limpiar `app/layout.tsx` removiendo el `IncomeStepsProvider` global innecesario
- El número de step pasa a venir del context, no hardcodeado en cada screen

## Capabilities

### New Capabilities

- `budget-wizard-flow`: Context unificado y flujo de 3 pasos con estado persistente entre navegaciones
- `budget-confirmation-step`: Paso 3 del wizard — resumen de ingresos y asignaciones antes de crear el presupuesto

### Modified Capabilities

- (ninguna — los cambios son de implementación interna, no de comportamiento visible al usuario)

## Impact

- **Archivos eliminados**: `store/BudgetStepContext.tsx`, `store/incomeStepContex.tsx`
- **Archivos nuevos**: `store/BudgetFlowContext.tsx`, `app/(wizard)/layout.tsx`, `app/(wizard)/budgetConfirmation/page.tsx`, `components/wizard/BudgetConfirmationScreen.tsx`
- **Archivos modificados**: `app/layout.tsx`, `hooks/income/useIncomeSources.ts`, `hooks/budget/useBudget.ts`, páginas de cada step
- **Sin cambios en API**: las llamadas al backend no cambian
- **Sin cambios visuales**: los componentes UI de paso 1 y 2 mantienen su apariencia
