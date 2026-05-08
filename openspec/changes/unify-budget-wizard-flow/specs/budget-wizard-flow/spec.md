## ADDED Requirements

### Requirement: Estado del wizard persiste entre pasos
El sistema SHALL mantener el estado completo del wizard (ingresos y categorías) mientras el usuario navega entre los pasos 1, 2 y 3 sin perder datos.

#### Scenario: Navegar de paso 1 a paso 2 conserva ingresos
- **WHEN** el usuario agrega fuentes de ingreso en el paso 1 y pulsa "Continuar"
- **THEN** los datos de ingresos están disponibles en el paso 2 y en el paso 3

#### Scenario: Navegar de paso 2 a paso 3 conserva categorías
- **WHEN** el usuario configura categorías y asignaciones en el paso 2 y pulsa "Continuar"
- **THEN** las categorías y asignaciones están disponibles en el paso 3

#### Scenario: Volver al paso anterior no borra el progreso
- **WHEN** el usuario está en el paso 2 y pulsa "Volver"
- **THEN** regresa al paso 1 con las fuentes de ingreso intactas

### Requirement: Step number proviene del context
El sistema SHALL obtener el número de paso actual desde `BudgetFlowContext`, no como valor hardcodeado en cada componente.

#### Scenario: ProgressBar refleja el paso del context
- **WHEN** el usuario está en la página del paso 2
- **THEN** la ProgressBar muestra "2 de 3" según el valor del context

### Requirement: Un único provider engloba todas las páginas del wizard
El sistema SHALL proveer `BudgetFlowContext` mediante un layout de route group que envuelva todas las páginas del wizard y solo esas páginas.

#### Scenario: El provider no contamina rutas fuera del wizard
- **WHEN** el usuario navega al dashboard u otras rutas
- **THEN** `BudgetFlowContext` no está en el árbol de providers de esas rutas
