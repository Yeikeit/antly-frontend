# Antly Frontend - Estructura de Carpetas MVP

## Objetivo de este documento
Este documento define la estructura recomendada del frontend para el MVP de Antly, con foco en claridad, mantenibilidad y complejidad controlada. La idea principal es separar por dominio funcional y evitar lógica de negocio compleja dentro de las paginas.

## Principios de organizacion
- Mantener la aplicacion simple y orientada a casos de uso reales del MVP.
- Separar navegacion (app), presentacion (components), integracion tecnica (lib/api) y tipado/estado (types, hooks, store).
- Reutilizar formularios y validaciones para acelerar desarrollo y evitar duplicaciones.
- Evitar crear capas innecesarias si aun no hay un problema real que resolver.

## Estructura base

```txt
antly-frontend/
├─ app/
│  ├─ (auth)/
│  │  ├─ login/
│  │  └─ register/
│  ├─ dashboard/
│  ├─ budget/
│  │  ├─ new/
│  │  ├─ [budgetId]/
│  │  └─ edit/
│  ├─ categories/
│  ├─ incomes/
│  ├─ transactions/
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ ui/
│  ├─ forms/
│  ├─ budget/
│  ├─ category/
│  ├─ income/
│  ├─ transaction/
│  └─ dashboard/
├─ lib/
│  ├─ api/
│  ├─ validations/
│  ├─ utils/
│  └─ constants/
├─ hooks/
├─ types/
├─ services/
├─ store/
├─ styles/
├─ public/
└─ docs/
```

## Detalle por carpeta

### app/
Responsabilidad: definir rutas y composicion por pantalla usando App Router.

Debe contener:
- Paginas y layouts por ruta.
- Estructura de navegacion del producto.
- Coordinacion de componentes y hooks.

No debe contener:
- Logica de negocio compleja.
- Acceso HTTP directo disperso por toda la app.
- Validaciones grandes embebidas en cada pagina.

#### app/(auth)/
Responsabilidad: pantallas publicas de autenticacion.

Subcarpetas:
- login/: formulario de inicio de sesion.
- register/: formulario de registro de usuario.

Buenas practicas MVP:
- Reusar componentes de formulario.
- Validar con Zod por esquema dedicado.
- Mantener mensajes de error claros y simples.

#### app/dashboard/
Responsabilidad: vista de resumen mensual.

Debe mostrar:
- Saldos generales.
- Indicadores basicos del mes.
- Resumen por categoria/subcategoria (si aplica en la fase actual).

#### app/budget/
Responsabilidad: flujo de presupuesto mensual.

Subcarpetas:
- new/: crear presupuesto del mes.
- [budgetId]/: visualizar detalle de presupuesto.
- edit/: editar presupuesto existente.

Reglas clave:
- La pagina orquesta, no calcula todo.
- Los componentes de asignaciones viven en components/budget.

#### app/categories/
Responsabilidad: gestion de categorias y subcategorias.

Debe cubrir:
- Listado.
- Alta/edicion/eliminacion.
- Jerarquia de dos niveles.

#### app/incomes/
Responsabilidad: registro y consulta de ingresos del periodo.

Debe cubrir:
- Alta de ingresos.
- Filtros simples por mes/anio.

#### app/transactions/
Responsabilidad: registro de gastos y su historial.

Debe cubrir:
- Crear, editar, eliminar gasto.
- Visualizar impacto simple en el presupuesto.

### components/
Responsabilidad: piezas visuales reutilizables.

#### components/ui/
Componentes base agnosticos al dominio.
Ejemplos: Button, Input, Select, Card, Modal, Badge.

#### components/forms/
Bloques de formularios reutilizables.
Ejemplos: campos monetarios, selectores de fecha, wrappers con React Hook Form.

#### components/budget/
Presentacion especifica de presupuesto.
Ejemplos: tabla de asignaciones, resumen de saldo restante, alerta de sobreconsumo.

#### components/category/
UI para jerarquia de categorias.
Ejemplos: arbol simple, item padre/hijo, formulario de subcategoria.

#### components/income/
UI para fuentes y movimientos de ingreso.

#### components/transaction/
UI para gastos diarios.

#### components/dashboard/
Widgets de resumen mensual.

### lib/
Responsabilidad: codigo tecnico compartido.

#### lib/api/
Responsabilidad: centralizar llamadas HTTP.

Debe contener:
- Cliente base (headers, token, manejo de errores comunes).
- Archivos por recurso (auth, budgets, categories, incomes, transactions).

Beneficio:
- Evita llamadas duplicadas en paginas y componentes.

#### lib/validations/
Responsabilidad: esquemas Zod por caso de uso.

Debe contener:
- Esquemas de login/registro.
- Esquemas de presupuesto, categorias, ingresos y gastos.

Regla MVP:
- Un esquema por formulario relevante.
- Mensajes de validacion directos y en lenguaje simple.

#### lib/utils/
Responsabilidad: funciones puras y pequenas.
Ejemplos: formateo de moneda, parse de fechas, helpers de calculo liviano.

#### lib/constants/
Responsabilidad: constantes estables.
Ejemplos: nombres de meses, limites de paginacion, labels de estados.

### hooks/
Responsabilidad: encapsular comportamiento reutilizable de UI.

Debe contener:
- Hooks de carga de datos.
- Hooks para submit de formularios.
- Manejo de estados loading/success/error.

No debe contener:
- Efectos colaterales complejos no relacionados al caso de uso.

### types/
Responsabilidad: contratos TypeScript.

Debe contener:
- Tipos de dominio del frontend.
- Tipos de request/response alineados al backend.
- Tipos de formularios.

### services/
Responsabilidad: casos de uso del frontend cuando se necesita una capa adicional.

Uso recomendado MVP:
- Solo si debes combinar multiples llamadas API o mapear datos de varios endpoints.
- Si no aporta claridad, dejar la logica en hooks de forma simple.

### store/
Responsabilidad: estado global minimo.

Para MVP, sugerido:
- Sesion del usuario.
- Datos globales de interfaz (por ejemplo filtros globales basicos).

Evitar:
- Convertir todo estado de pantalla en global sin necesidad.

### styles/
Responsabilidad: estilos globales y tokens visuales.

Debe contener:
- Variables globales.
- Utilidades visuales compartidas.
- Ajustes de layout base.

### public/
Responsabilidad: assets estaticos.
Ejemplos: iconos, imagenes, logos.

### docs/
Responsabilidad: documentacion interna del frontend.
Este archivo debe mantenerse actualizado cuando cambie la estructura.

## Reglas de complejidad para MVP
- Priorizar legibilidad por encima de arquitectura avanzada.
- Evitar microcapas (adaptadores, factories y abstractions extras) sin necesidad real.
- Mantener un flujo claro: pagina -> componente/hook -> api/validacion.
- Medir exito por funcionalidad completa, no por cantidad de capas.

## Checklist de calidad estructural
- Cada nueva pantalla se ubica en app/ por dominio.
- Cada formulario tiene su esquema en lib/validations.
- Ninguna llamada API queda hardcodeada dentro de componentes UI.
- Los tipos del frontend reflejan contratos del backend.
- No se agregan carpetas nuevas sin justificacion de uso real.
