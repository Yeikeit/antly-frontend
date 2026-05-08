## 1. Leer archivos clave antes de tocar nada

- [x] 1.1 Leer `store/BudgetStepContext.tsx` e `store/incomeStepContex.tsx` completos
- [x] 1.2 Leer `hooks/income/useIncomeSources.ts` y `hooks/budget/useBudget.ts`
- [x] 1.3 Leer `components/income/screen/IncomeScreen.tsx` y `components/budget/screens/BudgetScreen.tsx`
- [x] 1.4 Leer `app/layout.tsx`, `app/(incomes)/settingIncomes/page.tsx` y `app/(budget)/budgetAllocation/page.tsx`
- [x] 1.5 Leer `app/(budget)/settingBudget/page.tsx` y los componentes de UI de steps (`StepsLayout`, `ProgressBar`)

## 2. Crear el context unificado

- [x] 2.1 Crear `store/BudgetFlowContext.tsx` con tipos `IncomeSource`, `Category`, `BudgetFlowState` y el provider `BudgetFlowProvider`
- [x] 2.2 Definir en el context: `step`, `incomeSources`, `totalIncome`, `categories`, `selectedCategoryId` y sus setters
- [x] 2.3 Exportar hook `useBudgetFlow()` con guard que lanza error si se usa fuera del provider

## 3. Crear route group (wizard) y su layout

- [x] 3.1 Crear carpeta `app/(wizard)/`
- [x] 3.2 Crear `app/(wizard)/layout.tsx` que envuelva children en `BudgetFlowProvider`
- [x] 3.3 Mover `app/(budget)/settingBudget/` → `app/(wizard)/settingBudget/`
- [x] 3.4 Mover `app/(incomes)/settingIncomes/` → `app/(wizard)/settingIncomes/`
- [x] 3.5 Mover `app/(budget)/budgetAllocation/` → `app/(wizard)/budgetAllocation/`
- [x] 3.6 Verificar que las rutas URL no cambiaron (route groups no afectan URL en Next.js)

## 4. Refactorizar hooks para usar el context

- [x] 4.1 Actualizar `hooks/income/useIncomeSources.ts`: reemplazar estado local por lectura/escritura en `useBudgetFlow()` para `incomeSources`
- [x] 4.2 Actualizar `hooks/budget/useBudget.ts`: reemplazar estado local por lectura/escritura en `useBudgetFlow()` para `categories` y `selectedCategoryId`
- [x] 4.3 Actualizar `IncomeScreen` para obtener `step` del context en lugar de `const step = 1`
- [x] 4.4 Actualizar `BudgetScreen` para obtener `step` del context en lugar de `const step = 2`

## 5. Limpiar código viejo

- [x] 5.1 Eliminar `store/BudgetStepContext.tsx`
- [x] 5.2 Eliminar `store/incomeStepContex.tsx`
- [x] 5.3 Eliminar `BudgetStepsProvider` del `app/(wizard)/budgetAllocation/page.tsx` (si quedó)
- [x] 5.4 Eliminar `IncomeStepsProvider` del `app/(wizard)/settingIncomes/page.tsx` (si quedó)
- [x] 5.5 Limpiar `app/layout.tsx`: remover import y uso de `IncomeStepsProvider`

## 6. Crear paso 3 — pantalla de confirmación

- [x] 6.1 Crear `app/(wizard)/budgetConfirmation/page.tsx` que renderice `BudgetConfirmationScreen`
- [x] 6.2 Crear `components/wizard/BudgetConfirmationScreen.tsx` con layout de resumen
- [x] 6.3 Sección de ingresos: lista de `incomeSources` con nombre y monto, más total
- [x] 6.4 Sección de presupuesto: categorías con subcategorías y montos asignados, más total asignado
- [x] 6.5 Indicador visual (texto rojo o badge) cuando `totalAsignado > totalIncome`
- [x] 6.6 Botón "Crear presupuesto": llama a la API, muestra loading, maneja error
- [x] 6.7 Añadir botón "Volver" que lleva al paso 2 (`/budgetAllocation`)
- [x] 6.8 Actualizar botón "Continuar" de `BudgetScreen` para navegar a `/budgetConfirmation`

## 7. Verificación final

- [x] 7.1 Navegar el flujo completo: paso 1 → paso 2 → paso 3, verificar que los datos persisten
- [x] 7.2 Verificar que volver desde paso 2 a paso 1 no borra las fuentes de ingreso
- [x] 7.3 Verificar que la ProgressBar muestra el step correcto en cada página
- [x] 7.4 Verificar que rutas fuera del wizard (dashboard, login) no tienen `BudgetFlowContext` en el árbol
- [x] 7.5 Confirmar que no hay imports rotos de los contexts eliminados
