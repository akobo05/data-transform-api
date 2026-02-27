# data-transform-api

API REST construida con **NestJS** que implementa un motor de transformación de datos basado en el **patrón Strategy**, orientado a pipelines ETL entre sistemas heterogéneos.

El caso de uso central es una migración de registros médicos: desde un sistema hospitalario legacy con campos crípticos hacia un esquema moderno inspirado en **OMOP CDM**.

---

## Arquitectura

```
source_db (PostgreSQL)          API NestJS               target_db (PostgreSQL)
┌─────────────────┐      ┌─────────────────────┐      ┌──────────────────────┐
│   Paciente      │─────►│  TransformRegistry  │─────►│   ClinicalRecord     │
│  (legacy)       │      │  + MIGRATION_RULES  │      │   (OMOP-inspired)    │
└─────────────────┘      └─────────────────────┘      └──────────────────────┘
```

### Patrón Strategy

Cada tipo de transformación es una estrategia independiente:

| Estrategia   | Descripción                                              | Ejemplo                            |
|---|---|---|
| `direct`     | Copia el valor de un campo a otro                        | `pac_cod` → `person_source_value`  |
| `constant`   | Asigna un valor fijo                                     | `"v1"` → `version`                |
| `computed`   | Concatena varios campos con separador                    | `nombre + " " + apellido`         |
| `conditional`| Asigna un valor si se cumple una condición               | `status == "active"` → `true`     |
| `lookup`     | Mapea un valor a otro usando un diccionario              | `"M"` → `"Male"`, `"F"` → `"Female"` |

### Esquema de transformación médica

**Source — `Paciente` (legacy)**

| Campo              | Tipo    | Ejemplo                   |
|--------------------|---------|---------------------------|
| `pac_cod`          | String  | `PAC-0001`                |
| `pac_primer_nombre`| String  | `RUBÉN`                   |
| `pac_apellido`     | String  | `LUCERO VERDUZCO`         |
| `pac_fec_nac`      | String  | `19/01/1936`              |
| `pac_genero`       | String  | `M` / `F`                 |
| `pac_dx`           | String  | `E11` (ICD-10)            |
| `pac_dx_desc`      | String  | `Diabetes mellitus tipo 2`|
| `pac_estado`       | String  | `ACTIVO` / `EGRESADO` / `FALLECIDO` |
| `pac_edad`         | Int     | `90`                      |
| `fec_registro`     | String  | `17/02/2026`              |

**Target — `ClinicalRecord` (OMOP-inspired)**

| Campo                  | Tipo     | Transformación                          |
|------------------------|----------|-----------------------------------------|
| `person_source_value`  | String   | direct ← `pac_cod`                     |
| `given_name`           | String   | direct ← `pac_primer_nombre`           |
| `family_name`          | String   | direct ← `pac_apellido`               |
| `birth_date`           | String   | direct ← `pac_fec_nac`                |
| `gender`               | String   | lookup ← `pac_genero` (M→Male, F→Female) |
| `condition_code`       | String   | direct ← `pac_dx`                     |
| `condition_description`| String   | direct ← `pac_dx_desc`                |
| `visit_status`         | String   | lookup ← `pac_estado` (ACTIVO→active, EGRESADO→discharged, FALLECIDO→deceased) |
| `age_at_visit`         | Int      | direct ← `pac_edad`                   |
| `migrated_at`          | DateTime | auto (now())                           |

---

## Endpoints

### `POST /transform` — Transformación genérica (stateless)

Acepta cualquier conjunto de registros y reglas, devuelve los datos transformados sin tocar la base de datos.

```bash
curl -X POST http://localhost:3000/transform \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      { "pac_genero": "M", "pac_estado": "ACTIVO", "pac_cod": "PAC-0001" }
    ],
    "rules": {
      "mappings": [
        { "type": "direct", "source": "pac_cod", "target": "person_source_value" },
        { "type": "lookup", "source": "pac_genero", "target": "gender", "map": { "M": "Male", "F": "Female" } },
        { "type": "lookup", "source": "pac_estado", "target": "visit_status", "map": { "ACTIVO": "active", "EGRESADO": "discharged", "FALLECIDO": "deceased" } }
      ]
    }
  }'
```

**Respuesta:**
```json
{
  "results": [
    {
      "success": true,
      "data": {
        "person_source_value": "PAC-0001",
        "gender": "Male",
        "visit_status": "active"
      }
    }
  ]
}
```

### `POST /etl/run-migration` — Migración completa (lee source_db → escribe target_db)

```bash
curl -X POST http://localhost:3000/etl/run-migration
```

**Respuesta:**
```json
{
  "status": "success",
  "records_processed": 60,
  "timestamp": "2026-02-27T14:34:27.446Z"
}
```

---

## Setup

### Requisitos

- Node.js 20+
- PostgreSQL (dos instancias: source en puerto `5434`, target en `5435`)

### Variables de entorno

Crea un archivo `.env` en la raíz:

```env
DATABASE_URL_SOURCE=postgresql://postgres:postgres@localhost:5434/source_db
DATABASE_URL_TARGET=postgresql://postgres:postgres@localhost:5435/target_db
```

### Instalación

```bash
npm install
```

### Base de datos

```bash
# Aplicar migraciones
npx prisma migrate deploy --schema=prisma/source/schema.prisma
npx prisma migrate deploy --schema=prisma/target/schema.prisma

# Regenerar clientes Prisma
npm run prisma:generate

# Insertar datos de prueba (60 pacientes)
npm run prisma:seed:source
```

### Desarrollo

```bash
npm run start:dev
```

---

## Tests

```bash
# Todos los tests
npm run test

# Con coverage
npm run test:cov

# Un archivo específico
npx jest src/strategies/concrete.strategies.spec.ts
```

---

## Estructura del proyecto

```
src/
├── strategies/
│   ├── transform.interface.ts       # Contratos: TransformationRule, TransformStrategy
│   ├── concrete.strategies.ts       # DirectStrategy, ConstantStrategy, ComputedStrategy,
│   │                                # ConditionalStrategy, LookupStrategy
│   └── concrete.strategies.spec.ts  # Tests unitarios
├── etl/
│   ├── etl.service.ts               # MIGRATION_RULES + orquestación ETL
│   ├── etl.controller.ts            # POST /etl/run-migration
│   └── etl.module.ts
├── database/
│   ├── source-prisma.service.ts     # Cliente source_db
│   └── target-prisma.service.ts     # Cliente target_db
├── transform.registry.ts            # Mapa tipo → estrategia
├── app.service.ts                   # Lógica POST /transform
└── app.controller.ts                # POST /transform
prisma/
├── source/
│   ├── schema.prisma                # Modelo Paciente
│   ├── seed.ts                      # 60 pacientes con datos ICD-10
│   └── migrations/
└── target/
    ├── schema.prisma                # Modelo ClinicalRecord
    └── migrations/
```

---

## Agregar una nueva estrategia

1. Implementar `TransformStrategy` en `src/strategies/concrete.strategies.ts`
2. Registrarla en `TransformRegistry` (`src/transform.registry.ts`)
3. Añadir el tipo al union en `TransformationRule.type` (`transform.interface.ts`)
4. Agregar un `describe` block en `concrete.strategies.spec.ts`
