## ADDED Requirements

### Requirement: Pantalla de confirmación muestra resumen de ingresos
El sistema SHALL mostrar en el paso 3 todas las fuentes de ingreso configuradas en el paso 1 con sus montos y el total sumado.

#### Scenario: Lista de income sources visible en paso 3
- **WHEN** el usuario llega al paso 3
- **THEN** ve cada fuente de ingreso con su nombre y monto
- **THEN** ve el total de ingresos calculado

#### Scenario: Sin ingresos configurados redirige al paso 1
- **WHEN** el usuario llega al paso 3 con `incomeSources` vacío
- **THEN** es redirigido al paso 1 (settingIncomes)

### Requirement: Pantalla de confirmación muestra resumen de presupuesto
El sistema SHALL mostrar en el paso 3 todas las categorías con sus subcategorías y montos asignados, más el total asignado vs total disponible.

#### Scenario: Categorías y asignaciones visibles en paso 3
- **WHEN** el usuario llega al paso 3
- **THEN** ve cada categoría padre con sus subcategorías anidadas
- **THEN** ve el monto asignado por subcategoría
- **THEN** ve el total asignado y el total de ingresos disponible

#### Scenario: Indicador visual cuando el total asignado supera los ingresos
- **WHEN** el total asignado es mayor que el total de ingresos
- **THEN** el total asignado se muestra en rojo o con indicador de alerta

### Requirement: Botón confirmar crea el presupuesto vía API
El sistema SHALL enviar los datos del wizard a la API al pulsar "Crear presupuesto" y redirigir al dashboard tras éxito.

#### Scenario: Creación exitosa redirige al dashboard
- **WHEN** el usuario pulsa "Crear presupuesto"
- **THEN** el sistema llama a la API con los datos del wizard
- **THEN** al recibir respuesta exitosa, redirige al dashboard

#### Scenario: Error de API muestra mensaje al usuario
- **WHEN** la llamada a la API falla
- **THEN** el botón vuelve a estar habilitado
- **THEN** se muestra un mensaje de error en pantalla
