---
globs:
  - '**/presentation/rest/*.controller.mapper.ts'
---

# Controller Mapper

## Purpose
The controller mapper handles all translation between the HTTP layer and the
application layer. It works in both directions: inbound (request DTO → use
case Command) and outbound (domain entity/Result → response DTO). When the
DTO type satisfies the Command type directly, the controller may pass the DTO
through without involving the mapper. The mapper is needed when the shapes
diverge — for example, combining a path parameter with a body DTO into a
single Command, or projecting a domain entity into a flattened response shape.
The mapper owns structural translation only — no business logic, no async
calls, no domain decisions.

> **Related rules:**
> - @controller.mdc — the mapper is always injected and called from the controller
> - @controller-dto.mdc — the DTO shapes this mapper consumes and produces
> - @use-case.mdc — the Command/Result shapes this mapper maps to and from

---

## Non-Negotiables

- Always decorate with `@Injectable()`
- Name the class `<Resource>ControllerMapper`
- Always provide a list variant (`toResponseDTOList`) alongside the single variant
- Never add business logic or domain decisions — structural translation only
- Never call repositories, use cases, or any async operation
- Use `toCommand` for inbound mapping (DTO → Command), `toResponseDTO` for outbound

---

## Patterns

### ✅ Correct — outbound (domain entity → response DTO)

```typescript
@Injectable()
export class TruckControllerMapper {
  toResponseDTO(truck: Truck): TruckResponseDTO {
    return {
      licensePlate: truck.licensePlate,
      brand: truck.brand,
      model: truck.model,
      year: truck.year,
    };
  }

  toResponseDTOList(trucks: Truck[]): TruckResponseDTO[] {
    return trucks.map((truck) => this.toResponseDTO(truck));
  }
}
```

### ✅ Correct — inbound (DTO + param → Command)

```typescript
toUpdateCommand(id: number, dto: UpdateTruckDTO): UpdateTruckCommand {
  return { id, ...dto };
}
```

### ❌ Wrong

```typescript
export class TruckControllerMapper {  // missing @Injectable()
  toResponseDTO(truck: Truck): TruckResponseDTO {
    if (truck.year < 1980) {          // business logic — belongs in entity or use case
      return { ...truck, label: 'vintage' };
    }
    return truck;                     // returning entity directly — bypasses DTO shape
  }
}
```

---

## References
- @projects/apps/jarvis-api/src/app/modules/trucks/presentation/rest/truck.controller.mapper.ts — canonical example
- @controller-dto.mdc — the DTO types consumed and produced here
- @use-case.mdc — the Command types produced by inbound mapping
---
globs:
  - '**/application/use-cases/*.usecase.ts'
---

# Use Case

## Purpose
Use cases are the Application Business Rules layer of Clean Architecture. They
orchestrate the domain to fulfil a single, named operation. They know about
domain entities, repositories, events, and errors — nothing else. They have
zero awareness of HTTP, databases, or any delivery mechanism. A use case does
one thing: if the name of the class cannot be expressed as a single verb-noun
pair, it should be split. Every use case implements `UseCase<Command, Result>`
and is decorated with `@Injectable()` so NestJS can manage its lifetime.
Dependencies are always domain abstractions injected via constructor —
never instantiated directly.

> **Related rules:**
> - @domain/error.mdc — error hierarchy and two categories
> - @domain/event.mdc — event shape and naming rules
> - @domain/repository.mdc — the abstractions injected here

---

## Non-Negotiables

- Always declare `Command` and `Result` types at the top of the file, before the class — use `type`, never `class` or `interface`
- Always implement `UseCase<Command, Result>` — the `execute` method is the only public method
- Always decorate with `@Injectable()`
- Always name the parameter `command` in `execute`; omit it entirely when the type is `void`
- Always inject domain abstractions (`abstract class` tokens) — never concrete classes
- Never call another use case — compose at the module or handler level instead
- Never import from `presentation/` or any HTTP/transport layer
- Only inject `EventEmiiter` when the use case mutates state and emits an event

---

## Patterns

### ✅ Correct

```typescript
import { Truck } from '../../../domain/entities/truck.entity';

export type CreateTruckCommand = {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
};

export type CreateTruckResult = {
  truck: Truck;
};

@Injectable()
export class CreateTruckUseCase implements UseCase<CreateTruckCommand, CreateTruckResult> {
  constructor(
    private readonly truckRepository: TruckRepository,
    private readonly eventEmitter: EventEmiiter,
  ) {}

  async execute(command: CreateTruckCommand): Promise<CreateTruckResult> {
    try {
      const existingTruck = await this.truckRepository.findByLicensePlate(command.licensePlate);

      if (existingTruck) {
        throw new TruckAlreadyExistsError({});
      }

      const truck = await this.truckRepository.create({
        licensePlate: command.licensePlate,
        brand: command.brand,
        model: command.model,
        year: command.year,
      });

      await this.eventEmitter.emit(
        new TruckCreatedEvent({
          id: truck.id,
          licensePlate: truck.licensePlate,
          brand: truck.brand,
          model: truck.model,
          year: truck.year,
          createdAt: truck.createdAt,
          updatedAt: truck.updatedAt,
        }),
      );

      return { truck };
    } catch (error) {
      if (error instanceof TruckAlreadyExistsError) throw error;
      throw new TruckCreationFailedError({ cause: error });
    }
  }
}
```

---

## Error Handling — the only accepted pattern

```typescript
async execute(command: XxxCommand): Promise<XxxResult> {
  try {
    // orchestration logic
  } catch (error) {
    if (error instanceof KnownDomainError) throw error; // re-throw, preserve type
    throw new XxxOperationFailedError({ cause: error }); // wrap unknown failures
  }
}
```

Re-throw every domain error that callers or filters need to handle by type.
Wrap every unknown error in an operation-failed error with `cause` — never
swallow it and never let raw infrastructure errors escape the use case boundary.

---

## Event Emission — order matters

```typescript
const entity = await this.repository.create(data); // persist first
await this.eventEmitter.emit(new EntityCreatedEvent({ ...entity })); // emit after
return { entity };
```

Always emit after a successful persistence call. The event payload must be a
value snapshot of the persisted state — spread individual fields, never pass
the entity reference directly.

---

## References
- @projects/apps/jarvis-api/src/app/modules/trucks/application/use-cases/create-truck.usecase.ts — mutation + event example
- @projects/apps/jarvis-api/src/app/modules/trucks/application/use-cases/find-truck-by-id.usecase.ts — read-only example
---
match: any
---
# Technologies

## Runtime & Language
- **Node.js** with **TypeScript** — strict mode, `target: es2022`, `moduleResolution: nodenext`
- **SWC** — used for both build (`@nx/js:swc`) and test transforms (`@swc/jest`)

## Framework
- **NestJS** — `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-fastify`
- URI versioning — default version `1`, prefix from `API_GLOBAL_PREFIX` env var
- Swagger — `@nestjs/swagger`, mounted at `/swagger`

## Database
- **PostgreSQL** via **Prisma** (`@prisma/adapter-pg`)
- Generated client output: `src/prisma/client/`, module format `cjs`
- `PrismaRepository` extends `PrismaClient`, implements `OnModuleInit` / `OnModuleDestroy`

## Event Bus
- **`@nestjs/event-emitter`** (wraps EventEmitter2)
- Domain abstraction: `EventEmiiter` abstract class in `shared/domain/services/`
- Infrastructure adapter: `NestEventEmitterService` in `shared/infrastructure/services/`

## Mail
- **`@nestjs-modules/mailer`** (SMTP)
- Domain abstraction: `Mailer` abstract class in `mail/domain/services/`
- Infrastructure adapter: `NestjsMailerService` in `mail/infrastructure/services/`
- Local dev: **Mailpit** SMTP trap on port `1025`, UI on port `8025`

## Validation
- **`class-validator`** + **`class-transformer`** — applied only on controller DTOs
- Global `ValidationPipe` with a custom `exceptionFactory` via `NestErrorFactoryService`

## Monorepo
- **NX** workspace — app at `projects/apps/truck-backend/`
- **pnpm** with `pnpm-workspace.yaml`

## Dev Infrastructure
- **Docker Compose** (`compose.yml`) — Postgres + Mailpit
- **Husky** — git hooks via `prepare` script
- NX custom targets: `dependencies:up/down`, `prisma:migrate`, `prisma:generate`, etc.
---
match: any
---
# Shared Module

## Purpose
The `shared/` module is a `@Global()` NestJS module available everywhere without
explicit imports. It owns the **global base contracts and constants** that all
feature modules depend on. Feature modules never define their own error codes,
error messages, or event types — all of these live in `shared/` as the single
source of truth for the entire application.

---

## What Lives in Shared

### Global Constants — always extended here, never elsewhere
- `shared/domain/constants/errors.constants.ts` — `ErrorCodes`, `ErrorTitles`, `ErrorMessages` enums and `ERROR_CODE_TO_HTTP_STATUS` map
- `shared/domain/constants/events.constants.ts` — `EventTypes` enum

### Base Contracts — extended by all feature modules
- `shared/domain/errors/base.error.ts` — `BaseError` abstract class
- `shared/domain/entities/base.event.ts` — `BaseEvent<T>` abstract class
- `shared/application/usecases/base.usecase.ts` — `UseCase<C, R>` interface
- `shared/domain/services/event-emitter.service.ts` — `EventEmiiter` abstract class

### Pagination Contracts — used by all paginated endpoints
- `shared/domain/entities/page.entity.ts` — `Page<T>` generic paginated result wrapper
- `shared/application/usecases/paginated.command.ts` — `OffsetPaginatedCommand`, `CursorPaginatedCommand`
- `shared/presentation/rest/dtos/pagination.dto.ts` — `PaginationDTO` response shape

### Global Infrastructure
- `NestEventEmitterService` — concrete `EventEmiiter` implementation
- `NestErrorFactoryService` — formats validation exceptions into `ErrorResponseDto`
- `DomainExceptionFilter` + `GlobalExceptionFilter` — registered in `AppModule`

---

## Non-Negotiables

- When adding a new domain error to any feature module, add its code/title/message to `shared/domain/constants/errors.constants.ts` and its HTTP mapping to `ERROR_CODE_TO_HTTP_STATUS` — never create a local constants file
- When adding a new domain event to any feature module, add its type to `shared/domain/constants/events.constants.ts` — never create a local events constants file
- Never re-declare `BaseError`, `BaseEvent<T>`, `UseCase`, `EventEmiiter`, `Page<T>`, or `PaginationDTO` — import from `shared/`
- Never inline `page` and `size` fields in a search command — extend `OffsetPaginatedCommand` or `CursorPaginatedCommand`

---

## References
- @projects/apps/truck-backend/src/app/modules/shared/domain/constants/errors.constants.ts — all error codes
- @projects/apps/truck-backend/src/app/modules/shared/domain/constants/events.constants.ts — all event types
- @projects/apps/truck-backend/src/app/modules/shared/shared.module.ts — module wiring
---
match: any
---
# Pagination

## Purpose
Pagination, filtering, and sorting are implemented as a consistent cross-cutting
pattern. The shared module owns the generic contracts (`Page<T>`,
`OffsetPaginatedCommand`, `PaginationDTO`). Each feature module owns only its
specific filter and sort shapes. The full flow is: controller query params →
mapper assembles command → use case delegates to repository → repository returns
`Page<Entity>` → mapper projects to list response DTO.

> **Related rules:**
> - @core/shared.mdc — shared contracts that must not be re-declared per feature
> - @domain/entity.mdc — filters and sort are also domain entities
> - @use-case-types.mdc — how search commands are typed

---

## Non-Negotiables

- Always use `Page<T>` from `shared/domain/entities/page.entity.ts` — never declare a custom paginated wrapper
- Always use `OffsetPaginatedCommand` or `CursorPaginatedCommand` from `shared/application/usecases/paginated.command.ts` as the base for search commands — never inline `page` and `size` fields
- Always declare `<Resource>Filters` and `<Resource>Sort` as `type` aliases in the feature's `domain/entities/` folder
- Always use `Partial<{...}>` for filters and sort — every field is optional
- Always use `PaginationDTO` from shared for the pagination section of list response DTOs
- Default page is `0`, default size is `20` — always set via `DefaultValuePipe` in the controller

---

## Patterns

### Domain entities (feature-owned)

```typescript
// <resource>-filters.entity.ts
export type TruckFilters = Partial<{
  search: string;
}>;

// <resource>-sort.entity.ts
export type TruckSortField = 'licensePlate' | 'brand' | 'model' | 'year' | 'createdAt';
export type TruckSortOrder = 'asc' | 'desc';

export type TruckSort = Partial<{
  field: TruckSortField;
  order: TruckSortOrder;
}>;
```

### Use case types

```typescript
// search-<resource>.types.ts
import { OffsetPaginatedCommand } from '../../../../shared/application/usecases/paginated.command';

export type SearchTrucksCommand = OffsetPaginatedCommand & {
  filters: TruckFilters;
  sort: TruckSort;
};

export type SearchTrucksResult = {
  page: Page<Truck>;
};
```

### List response DTO (presentation)

```typescript
export class TruckListResponseDTO {
  @ApiProperty({ type: [TruckResponseDTO] })
  trucks: TruckResponseDTO[];

  @ApiProperty({ type: PaginationDTO })
  pagination: PaginationDTO;
}
```

### Controller — query params

```typescript
@Get()
async search(
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
  @Query('search') search?: string,
  @Query('sort-by') sortField?: TruckSortField,
  @Query('sort-order') sortOrder?: TruckSortOrder,
): Promise<TruckListResponseDTO> {
  const command = this.mapper.toSearchCommand(page, size, search, sortField, sortOrder);
  const result = await this.searchTrucksUseCase.execute(command);
  return this.mapper.toListResponseDTO(result);
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/shared/domain/entities/page.entity.ts — Page<T> shape
- @projects/apps/truck-backend/src/app/modules/shared/application/usecases/paginated.command.ts — base command types
- @projects/apps/truck-backend/src/app/modules/shared/presentation/rest/dtos/pagination.dto.ts — PaginationDTO
- @projects/apps/truck-backend/src/app/modules/trucks/application/use-cases/search-trucks/search-trucks.types.ts — feature search command example
---
match: any
---
# Nomenclature

## File Names
All files use `kebab-case` with a mandatory semantic suffix.

| Layer | Pattern | Example |
|---|---|---|
| Domain entity | `<noun>.entity.ts` | `truck.entity.ts` |
| Domain repository | `<noun>.repository.ts` | `truck.repository.ts` |
| Domain error | `<noun>-<condition>.error.ts` | `truck-not-found.error.ts` |
| Domain event | `<noun>-<past-verb>.event.ts` | `truck-created.event.ts` |
| Domain service | `<noun>.service.ts` | `event-emitter.service.ts` |
| Domain constants | `<concern>.constants.ts` | `errors.constants.ts` |
| Use case | `<verb>-<noun>.usecase.ts` | `create-truck.usecase.ts` |
| Use case types | `<verb>-<noun>.types.ts` | `create-truck.types.ts` |
| Infra repository | `prisma-<noun>.repository.ts` | `prisma-truck.repository.ts` |
| Infra service | `<lib>-<noun>.service.ts` | `nestjs-mailer.service.ts` |
| Controller | `<noun>.controller.ts` | `truck.controller.ts` |
| Controller DTO | `<noun>.controller.dto.ts` | `truck.controller.dto.ts` |
| Controller mapper | `<noun>.controller.mapper.ts` | `truck.controller.mapper.ts` |
| Event handler | `<noun>-events.handler.ts` | `truck-events.handler.ts` |
| NestJS module | `<noun>.module.ts` | `trucks.module.ts` |

---

## Class Names
All classes use `PascalCase` with a matching semantic suffix.

| Concept | Pattern | Example |
|---|---|---|
| Domain entity | `<Noun>` | `Truck` |
| Domain repository (abstract) | `<Noun>Repository` | `TruckRepository` |
| Infra repository | `Prisma<Noun>Repository` | `PrismaTruckRepository` |
| Domain service (abstract) | `<Noun>Service` | `EventEmiiter` |
| Infra service | `<Lib><Noun>Service` | `NestjsMailerService` |
| Domain error | `<Noun><Condition>Error` | `TruckNotFoundError` |
| Domain event | `<Noun><PastVerb>Event` | `TruckCreatedEvent` |
| Use case | `<Verb><Noun>UseCase` | `CreateTruckUseCase` |
| Controller | `<Noun>Controller` | `TruckController` |
| Controller mapper | `<Noun>ControllerMapper` | `TruckControllerMapper` |
| Event handler | `<Noun>EventsHandler` | `TruckEventsHandler` |
| NestJS module | `<Noun>Module` | `TrucksModule` |

---

## Type Names
Types use `PascalCase` with a semantic suffix.

| Concept | Pattern | Example |
|---|---|---|
| Use case input | `<Action><Noun>Command` | `CreateTruckCommand`, `DeleteTruckCommand` |
| Use case output | `<Action><Noun>Result` | `CreateTruckResult`, `FindTruckByIdResult` |
| Repository data | `<Action><Noun>Data` | `CreateTruckData`, `UpdateTruckData` |
| Request DTO | `<Action><Noun>DTO` | `CreateTruckDTO`, `DeleteTruckDTO` |
| Response DTO | `<Noun>ResponseDTO` | `TruckResponseDTO` |
| Error constructor props | `<Class>Props` | `TruckNotFoundErrorProps` |
| Event payload props | `<Class>Props` | `TruckCreatedEventProps` |

---

## Method Names
| Location | Method | Purpose |
|---|---|---|
| Use case | `execute(command)` | single public method |
| Infra repository | `mapToDomain(record)` | Prisma → domain entity |
| Controller mapper | `toResponseDTO(entity)` | domain entity → response DTO |
| Controller mapper | `toResponseDTOList(entities)` | list variant |
| Controller mapper | `to<Verb>Command(...)` | DTO → use case Command |
| Event handler | `handle<Noun><PastVerb>(event)` | `handleTruckCreated(event)` |

---

## Enums & Constants
- Enum names: `PascalCase` — `ErrorCodes`, `ErrorTitles`, `EventTypes`
- Enum values: `UPPER_SNAKE_CASE` — `TRUCK_NOT_FOUND`, `TRUCK_CREATED`
- Lookup tables: `UPPER_SNAKE_CASE` — `ERROR_CODE_TO_HTTP_STATUS`
- Never use inline strings where an enum value exists

---

## General Rules
- All names must be intention-revealing — never `data`, `temp`, `result`, `x`, `y`
- Use case folder names follow `<verb>-<noun>/` — verb first, kebab-case
- Event class names and file names use past tense — `Created`, not `Create`
---
match: any
---
# Event System

## Purpose
The event system decouples state-changing modules from the modules that react
to those changes. The trucks module emits a fact; the notification module
reacts to it — neither knows about the other. The entire mechanism is hidden
behind a domain abstraction so the application layer never depends on NestJS
event primitives directly.

---

## Full Flow

```
Use Case
  └─ eventEmitter.emit(new TruckCreatedEvent({...}))
        │  (EventEmiiter abstraction — domain layer)
        ▼
NestEventEmitterService
  └─ eventEmitter.emitAsync(event.type, event)
        │  (EventEmitter2 — infrastructure)
        ▼
TruckEventsHandler  @OnEvent(EventTypes.TRUCK_CREATED)
  └─ sendAdminEmailUseCase.execute({...})
```

---

## Layers and Responsibilities

| Layer | File | Responsibility |
|---|---|---|
| Domain | `BaseEvent<T>` | Abstract base — auto-generates `id`, `version`, `timestamp` |
| Domain | `EventEmiiter` | Abstract emission contract injected into use cases |
| Domain | `XxxCreatedEvent` | Concrete event with typed payload snapshot |
| Shared constants | `EventTypes` | Enum of all event type strings — single source of truth |
| Infrastructure | `NestEventEmitterService` | Bridges `EventEmiiter` → `EventEmitter2.emitAsync` |
| Presentation | `XxxEventsHandler` | `@OnEvent` subscriber — delegates to a use case only |

---

## Non-Negotiables

- Use cases inject `EventEmiiter` (abstract) — never `EventEmitter2` directly
- Always emit after a successful persistence call — never before
- All event type strings live in `shared/domain/constants/events.constants.ts` — register there first
- Event handlers live in `presentation/handlers/` — they are delivery mechanisms, not logic containers
- `EventEmitterModule.forRoot()` is registered once in `AppModule` — never in feature modules

---

## Adding a New Event — Checklist

1. Add the new type to `EventTypes` in `shared/domain/constants/events.constants.ts`
2. Create the event class in `<feature>/domain/events/<noun>-<past-verb>.event.ts`
3. Emit it from the relevant use case after persistence
4. Create or extend an `*EventsHandler` in the consuming module's `presentation/handlers/`
5. Register the handler as a provider in that module's `*.module.ts`

---

## References
- @projects/apps/truck-backend/src/app/modules/shared/domain/entities/base.event.ts — BaseEvent<T>
- @projects/apps/truck-backend/src/app/modules/shared/domain/services/event-emitter.service.ts — EventEmiiter abstraction
- @projects/apps/truck-backend/src/app/modules/shared/infrastructure/services/nest-event-emitter.service.ts — NestJS adapter
- @projects/apps/truck-backend/src/app/modules/trucks/domain/events/truck-created.event.ts — concrete event example
- @projects/apps/truck-backend/src/app/modules/notification/presentation/handlers/truck-events.handler.ts — handler example
- @architecture/domain/event.mdc — event class conventions
- @architecture/presentation/event-handler.mdc — handler conventions
---
match: any
---
# Architecture

## Layer Dependencies

This project enforces Clean Architecture's Dependency Rule: source code
dependencies point inward only. The domain is the innermost layer and knows
nothing about the layers around it. Each outer layer may import from the layers
inside it, never the reverse. Violating these boundaries breaks the isolation
that makes each layer independently testable and replaceable.

## Allowed Imports Per Layer

### `domain/`
- Other files within `domain/` only
- Zero external library imports (`@nestjs/*`, `@prisma/*`, etc.)
- Exception: Node.js built-ins (`crypto`, etc.) are permitted

### `application/`
- `domain/` — entities, repositories (abstract), errors, events, services (abstract)
- `@nestjs/common` for `@Injectable()` only
- Never imports from `infrastructure/` or `presentation/`

### `infrastructure/`
- `domain/` — the abstract contracts it implements
- Framework and library packages (`@nestjs/*`, `@prisma/*`, etc.)
- Never imports from `application/` or `presentation/`

### `presentation/`
- `application/` — use cases and use case types
- `domain/` — entities (for mapper input types), errors (for filter typing)
- `@nestjs/common`, `@nestjs/swagger`, `class-validator`, `class-transformer`
- Never imports from `infrastructure/`

## Module Folder Structure

Every feature module under `src/app/modules/<name>/` follows this layout:

```
<module-name>/
├── domain/
│   ├── constants/       *.constants.ts
│   ├── entities/        *.entity.ts
│   ├── errors/          *.error.ts
│   ├── events/          *.event.ts
│   ├── repositories/    *.repository.ts     (abstract class + data types)
│   └── services/        *.service.ts        (abstract class)
├── application/
│   └── use-cases/
│       └── <verb>-<noun>/
│           ├── *.usecase.ts
│           └── *.types.ts
├── infrastructure/
│   ├── repositories/    prisma-*.repository.ts
│   └── services/        nestjs-*.service.ts
└── presentation/
    ├── rest/
    │   ├── *.controller.ts
    │   ├── *.controller.dto.ts
    │   └── *.controller.mapper.ts
    └── handlers/        *.handler.ts
```

## Violation Examples

```typescript
// ❌ domain importing infrastructure
import { PrismaClient } from '@prisma/client'; // in domain/repositories/

// ❌ application importing presentation
import { CreateTruckDTO } from '../../presentation/rest/truck.controller.dto'; // in use case

// ❌ application importing infrastructure
import { PrismaTruckRepository } from '../../infrastructure/repositories/prisma-truck.repository'; // in use case

// ❌ presentation importing infrastructure
import { PrismaRepository } from '../../prisma/infrastructure/prisma.repository'; // in controller
```

---

## References
- @core/project-overview.mdc — folder structure and module layout
- @domain/repository.mdc — why abstract class instead of interface
- @architecture/module.mdc — where abstract-to-concrete bindings live
---
globs:
  - '**/domain/entities/*.entity.ts'
---

# Domain Entity

## Purpose
Domain entities are the innermost layer of Clean Architecture — they encapsulate
enterprise-wide business rules and are the least likely to change when external
things (frameworks, databases, delivery mechanisms) change. An entity is a class
that holds state and may expose methods that enforce invariants or express
business behaviour intrinsic to that concept. They must remain importable from
any layer without pulling in NestJS, Prisma, or any other library. An entity
with no behaviour is an anemic domain model — acceptable only when no business
rules exist for that concept yet.

> **Related rules:**
> - @repository.mdc — entities are the return type of every repository method
> - @layer-dependencies.mdc — defines what the domain layer is allowed to import

---

## Non-Negotiables

- Never import from `@nestjs/*`, `@prisma/*`, or any external library
- Never add `class-validator`, `class-transformer`, or Swagger decorators — these belong in DTOs
- Methods that enforce a business rule intrinsic to the entity are allowed and encouraged
- One entity per file; file name is the entity name in `kebab-case.entity.ts`

---

## Patterns

### ✅ Correct — entity with business rule method

```typescript
export class Truck {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;

  isVintage(): boolean {
    return this.year < 1980;
  }
}
```

### ❌ Wrong

```typescript
import { ApiProperty } from '@nestjs/swagger';  // framework import in domain entity
import { IsString } from 'class-validator';      // validation belongs in DTOs

export class Truck {
  @ApiProperty()
  @IsString()
  licensePlate: string;
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/trucks/domain/entities/truck.entity.ts — canonical example
- @layer-dependencies.mdc — import boundaries for the domain layer
---
globs:
  - '**/infrastructure/repositories/*.repository.ts'
---

# Infrastructure Repository

## Purpose
Infrastructure repositories are the adapters that fulfil the domain repository
contract using Prisma. They are the only place in the codebase allowed to
import Prisma types. Their responsibility is to translate between the
persistence model and the domain model — nothing must cross this boundary in
either direction. Every Prisma result is mapped to a domain entity before
returning. Every Prisma error is caught and re-thrown as a domain persistence
error, preserving the original `cause`. Upper layers never see a Prisma type
or a raw database exception.

> **Related rules:**
> - @domain/repository.mdc — the abstract contract this class implements
> - @domain/entity.mdc — the return type of every method here
> - @domain/error.mdc — the persistence error wrapping pattern
> - @module.mdc — how this class is bound to the abstract token

---

## Non-Negotiables

- Always `implements` the domain abstract repository class — never re-declare method signatures
- Always decorate with `@Injectable()`
- Name the class `Prisma<Entity>Repository`
- Always wrap every method body in try/catch — throw a domain persistence error with `cause`
- Always map Prisma results to domain entities via a private `mapToDomain()` method
- Never return a Prisma model type — `mapToDomain` is the only exit point for persistence data
- Return `null` for not-found queries — never `undefined`

---

## Patterns

### ✅ Correct

```typescript
@Injectable()
export class PrismaTruckRepository implements TruckRepository {
  constructor(private readonly prisma: PrismaRepository) {}

  async findById(id: number): Promise<Truck | null> {
    try {
      const record = await this.prisma.truck.findUnique({
        where: { id },
        select: {
          id: true,
          licensePlate: true,
          brand: true,
          model: true,
          year: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return record ? this.mapToDomain(record) : null;
    } catch (error) {
      throw new TruckPersistenceError({ cause: error });
    }
  }

  private mapToDomain(record: {
    id: number; licensePlate: string; brand: string;
    model: string; year: number; createdAt: Date; updatedAt: Date;
  }): Truck {
    return {
      id: record.id,
      licensePlate: record.licensePlate,
      brand: record.brand,
      model: record.model,
      year: record.year,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
```

### ❌ Wrong

```typescript
async findById(id: number) {       // missing return type — Prisma type leaks out
  const truck = await this.prisma.truck.findUnique({ where: { id } });
  return truck;                     // returning Prisma model, not a domain entity
}                                   // no try/catch — Prisma errors escape the layer
```

---

## References
- @projects/apps/truck-backend/src/app/modules/trucks/infrastructure/repositories/prisma-truck.repository.ts — canonical example
- @domain/repository.mdc — the contract being implemented
---
globs:
  - '**/domain/events/*.event.ts'
---

# Domain Event

## Purpose
Domain events are immutable records of facts that already happened inside the
domain. They decouple the module that produced the state change from every
module that reacts to it — neither side knows about the other (Clean
Architecture's Dependency Rule). Events are named in **past tense** because
they describe what occurred, not what should happen. The payload must be a
**value snapshot** — a copy of the data at the moment of the event — never a
live reference to a mutable entity. Every event extends `BaseEvent<T>`, which
auto-generates `id`, `version`, and `timestamp`. Emission always goes through
the `EventEmiiter` domain abstraction; NestJS event primitives must never
appear in this layer.

> **Related rules:**
> - @core/shared.mdc — where event types must be registered
> - @use-case.mdc — when and how use cases emit events after persistence
> - @event-handler.mdc — how events are consumed in the presentation layer
> - @layer-dependencies.mdc — domain events must not import infrastructure

---

## Non-Negotiables

- Always extend `BaseEvent<T>` — never use a plain class or `EventEmitter2`
- Always declare a local `XxxEventProps` type that shapes the payload
- Always bind to `EventTypes` enum — never pass raw event name strings
- Name event classes in past tense (`TruckCreatedEvent`, not `CreateTruckEvent`)
- Payload must be a value snapshot — never pass a domain entity reference directly
- Register new event types in `shared/domain/constants/events.constants.ts` before creating the event class — never create a module-local constants file

---

## Patterns

### ✅ Correct

```typescript
import { BaseEvent } from '../../../shared/domain/entities/base.event';
import { EventTypes } from '../../../shared/domain/constants/events.constants';

type TruckCreatedEventProps = {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
};

export class TruckCreatedEvent extends BaseEvent<TruckCreatedEventProps> {
  constructor(payload: TruckCreatedEventProps) {
    super({ type: EventTypes.TRUCK_CREATED, payload });
  }
}
```

### ❌ Wrong

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter'; // infrastructure in domain

export class CreateTruckEvent {            // imperative name — events are past tense
  constructor(public truck: Truck) {}     // live entity reference, not a snapshot
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/shared/domain/entities/base.event.ts — BaseEvent contract
- @projects/apps/truck-backend/src/app/modules/shared/domain/constants/events.constants.ts — EventTypes enum
- @use-case.mdc — emission pattern after successful persistence
---
globs:
  - '**/domain/repositories/*.repository.ts'
---

# Domain Repository

## Purpose
Domain repositories are **ports** in the Ports & Adapters sense. The domain
declares what data access it needs; the infrastructure delivers it. This
inverts the dependency: the domain does not know whether data comes from
Postgres, an in-memory store, or a remote API. Repositories are declared as
`abstract class` — not `interface` — because TypeScript interfaces are erased
at runtime and cannot serve as NestJS DI tokens. Only declare methods that at
least one use case actually calls (Interface Segregation). Input data shapes
(`CreateXData`, `UpdateXData`) are co-located in this file because they are
part of the contract, not the implementation.

> **Related rules:**
> - @infrastructure/repository.mdc — how to implement this contract with Prisma
> - @module.mdc — how to bind the abstract token to the concrete class
> - @layer-dependencies.mdc — why the domain layer must not import infrastructure

---

## Non-Negotiables

- Always use `abstract class`, never `interface`
- Never import from `@nestjs/*`, `@prisma/*`, or any infrastructure library
- Always co-locate `CreateXData` and `UpdateXData` types in the same file
- All methods must be `abstract` and return domain entities, never Prisma models
- Nullable lookups must return `Entity | null`, never `Entity | undefined`
- Never declare a method that no use case calls — apply Interface Segregation

---

## Patterns

### ✅ Correct

```typescript
import { Truck } from '../entities/truck.entity';

export abstract class TruckRepository {
  abstract create(data: CreateTruckData): Promise<Truck>;
  abstract findAll(): Promise<Truck[]>;
  abstract findById(id: number): Promise<Truck | null>;
  abstract findByLicensePlate(licensePlate: string): Promise<Truck | null>;
  abstract update(id: number, data: UpdateTruckData): Promise<Truck>;
  abstract delete(id: number): Promise<void>;
}

export type CreateTruckData = {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
};

export type UpdateTruckData = {
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
};
```

### ❌ Wrong

```typescript
import { PrismaClient } from '@prisma/client'; // infrastructure leaking into domain

export interface TruckRepository {             // interface is not a valid DI token
  findById(id: number): Promise<Truck | undefined>; // use null, not undefined
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/trucks/domain/repositories/truck.repository.ts — canonical example
- @infrastructure/repository.mdc — the Prisma implementation of this contract
---
globs:
  - '**/domain/errors/*.error.ts'
---

# Domain Error

## Purpose
Errors are first-class domain citizens, not afterthoughts. Each error class
communicates a specific, named failure state — callers can branch on type
rather than parsing strings. There are two distinct categories: **business
rule** errors represent expected domain violations (e.g. not found, already
exists) and map to 4xx; **operation-failed** errors represent unexpected
infrastructure failures and always carry a `cause` to preserve the original
stack context. Both categories extend `BaseError` and bind exclusively to
`ErrorCodes`, `ErrorTitles`, and `ErrorMessages` enums. Never use inline
strings — every message must be traceable to a constant. The `cause` chain
follows Clean Code's principle of providing context with exceptions: it lets
the `DomainExceptionFilter` log the full failure chain without losing the
root cause.

> **Related rules:**
> - @core/shared.mdc — where error codes and constants must be registered
> - @use-case.mdc — re-throw vs wrap error strategy
> - @layer-dependencies.mdc — errors belong to the domain layer only

---

## Non-Negotiables

- Always extend `BaseError` — never extend `Error` directly
- Always use `ErrorCodes`, `ErrorTitles`, `ErrorMessages` enums — never inline strings
- Always declare a local `XxxErrorProps` type with `cause?` and `metadata?`
- Operation-failed errors must always be constructed with `cause` — never swallow the origin
- Business rule error constructors must default props to `= {}` (caller may omit them)
- Register codes in `shared/domain/constants/errors.constants.ts` and `ERROR_CODE_TO_HTTP_STATUS` before creating the class — never create a module-local constants file

---

## Patterns

### ✅ Correct — business rule error (expected violation, 4xx)

```typescript
type TruckNotFoundErrorProps = {
  cause?: unknown;
  metadata?: object;
};

export class TruckNotFoundError extends BaseError {
  constructor({ cause, metadata }: TruckNotFoundErrorProps = {}) {
    super({
      code: ErrorCodes.TRUCK_NOT_FOUND,
      title: ErrorTitles.TRUCK_NOT_FOUND,
      message: ErrorMessages.TRUCK_NOT_FOUND,
      cause,
      metadata,
    });
  }
}
```

### ✅ Correct — operation-failed error (infrastructure failure, 5xx)

```typescript
type TruckCreationFailedErrorProps = {
  cause?: unknown;
  metadata?: object;
};

export class TruckCreationFailedError extends BaseError {
  constructor({ cause, metadata }: TruckCreationFailedErrorProps = {}) {
    super({
      code: ErrorCodes.TRUCK_CREATION_FAILED,
      title: ErrorTitles.TRUCK_CREATION_FAILED,
      message: ErrorMessages.TRUCK_CREATION_FAILED,
      cause,
      metadata,
    });
  }
}
```

### ❌ Wrong

```typescript
export class TruckNotFoundError extends Error { // must extend BaseError
  constructor() {
    super('Truck not found'); // inline string — use ErrorMessages enum
    // no cause preserved — root context is lost
  }
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/shared/domain/errors/base.error.ts — BaseError contract
- @projects/apps/truck-backend/src/app/modules/shared/domain/constants/errors.constants.ts — enums and HTTP status map
- @use-case.mdc — re-throw vs wrap error strategy in use cases
---
globs:
  - '**/infrastructure/services/*.service.ts'
---

# Infrastructure Service

## Purpose
Infrastructure services are adapters that fulfil domain service contracts using
framework or library primitives (NestJS EventEmitter, mailer, etc.). They are
the only place where those primitives may be imported. The domain abstract class
declares what the application needs; this class delivers it. The implementation
must be deliberately thin — no business logic, no branching, no transformation
beyond what the primitive requires. If logic is needed, it belongs in a use case
or the domain, not here.

> **Related rules:**
> - @domain/entity.mdc — domain abstractions that these services implement
> - @module.mdc — how the abstract token is bound to this concrete class

---

## Non-Negotiables

- Always `implements` the domain abstract service class — never re-declare the signature
- Always decorate with `@Injectable()`
- Name the class after the library it wraps: `Nestjs<Name>Service`, `Aws<Name>Service`, etc.
- Never add business logic — delegate directly to the injected framework primitive
- Never import domain repositories or use cases — services adapt a single external capability

---

## Patterns

### ✅ Correct

```typescript
@Injectable()
export class NestEventEmitterService implements EventEmiiter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emit(event: BaseEvent<unknown>): Promise<void> {
    await this.eventEmitter.emitAsync(event.type, event);
  }
}
```

### ❌ Wrong

```typescript
@Injectable()
export class NestEventEmitterService { // missing implements — contract not enforced
  async emit(event: BaseEvent<unknown>): Promise<void> {
    if (event.type === 'truck.created') { // business logic does not belong here
      console.log('Truck created!');
    }
    this.eventEmitter.emit(event.type, event);
  }
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/shared/infrastructure/services/nest-event-emitter.service.ts — event emitter adapter example
- @projects/apps/truck-backend/src/app/modules/mail/infrastructure/services/nestjs-mailer.service.ts — mailer adapter example
---
globs:
  - '**/presentation/rest/*.controller.dto.ts'
---

# Controller DTO

## Purpose
Controller DTOs define the shape of HTTP request bodies and responses. They
are the validation and documentation boundary — the only place where
`class-validator`, `class-transformer`, and `@nestjs/swagger` decorators are
permitted. Three DTO types live together in one file per resource: the create
input, the update input, and the response shape. Update DTOs always extend
`PartialType(CreateDTO)` — never redeclare fields. Response DTOs carry only
`@ApiProperty` for documentation; they have no validation decorators since
they are never parsed from user input. DTOs must not import domain entities
or any infrastructure types — they are a delivery-layer concept only.

> **Related rules:**
> - @controller.mdc — where DTOs are consumed as method parameters
> - @controller-mapper.mdc — how domain entities are mapped into response DTOs

---

## Non-Negotiables

- Every input field must have both a `class-validator` decorator and `@ApiProperty`
- When the update shape is a partial of the create shape, extend `PartialType(CreateDTO)` — never redeclare fields that can be inherited
- Response DTOs carry only `@ApiProperty` — no validation decorators
- Never import domain entities, repositories, or use cases into a DTO file
- All three DTO classes for a resource live in the same `*.controller.dto.ts` file

---

## Patterns

### ✅ Correct

```typescript
export class CreateTruckDTO {
  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ example: 2020, minimum: 1900, maximum: 2100 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;
}

export class UpdateTruckDTO extends PartialType(CreateTruckDTO) {}

export class TruckResponseDTO {
  @ApiProperty({ example: 'ABC-1234' })
  licensePlate: string;

  @ApiProperty({ example: 2020 })
  year: number;
}
```

### ❌ Wrong

```typescript
export class UpdateTruckDTO {  // shares fields with CreateTruckDTO — extend PartialType instead
  @IsString()
  licensePlate?: string;       // response DTOs must not have validation decorators
}

export class TruckResponseDTO {
  truck: Truck;                // never expose domain entities directly in a response DTO
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/trucks/presentation/rest/truck.controller.dto.ts — canonical example
- @controller-mapper.mdc — how domain entities are projected into response DTOs
---
globs:
  - '**/presentation/rest/*.controller.ts'
---

# Controller

## Purpose
Controllers are the HTTP entry point of the application. Their only
responsibility is to receive a request, delegate to the appropriate use case,
and return the mapped response. They contain zero business logic and zero
domain decisions. If a controller method does anything beyond calling a use
case and mapping its result, that logic belongs elsewhere. Every public
endpoint must be fully documented with Swagger decorators — controllers are
the API contract surface.

> **Related rules:**
> - @controller-dto.mdc — input/output DTO shapes and validation
> - @controller-mapper.mdc — how domain entities become response DTOs
> - @use-case.mdc — what the controller delegates to

---

## Non-Negotiables

- Always decorate with `@ApiTags` and `@Controller`
- Every method must have `@ApiOperation` with both `summary` and `description`, and at least one `@ApiResponse` per possible HTTP status
- Always delegate to exactly one use case per method — never call two use cases in one handler
- Always delegate response mapping to the `*ControllerMapper` — never map inline
- Never import domain repositories, domain errors, or infrastructure classes
- Never add conditional logic, loops, or data transformation inside a controller method
- Always declare explicit HTTP status codes with `@HttpCode(HttpStatus.X)`when the default `200` does not apply

---

## Patterns

### ✅ Correct

```typescript
@ApiTags('trucks')
@Controller('trucks')
export class TruckController {
  constructor(
    private readonly createTruckUseCase: CreateTruckUseCase,
    private readonly mapper: TruckControllerMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new truck',
    description: 'Registers a new truck in the system. The license plate must be unique.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: TruckResponseDTO })
  @ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorResponseDto })
  async create(@Body() dto: CreateTruckDTO): Promise<TruckResponseDTO> {
    const result = await this.createTruckUseCase.execute(dto);
    return this.mapper.toResponseDTO(result.truck);
  }
}
```

### ❌ Wrong

```typescript
async create(@Body() dto: CreateTruckDTO): Promise<TruckResponseDTO> {
  const existing = await this.truckRepository.findByLicensePlate(dto.licensePlate);
  if (existing) throw new ConflictException();        // logic belongs in use case

  const result = await this.createTruckUseCase.execute(dto);
  return { licensePlate: result.truck.licensePlate }; // mapping belongs in mapper
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/trucks/presentation/rest/truck.controller.ts — canonical example
- @controller-dto.mdc — DTO validation and Swagger shape
- @controller-mapper.mdc — mapping domain entities to response DTOs
---
globs:
  - '**/presentation/handlers/*.handler.ts'
---

# Event Handler

## Purpose
Event handlers are the asynchronous equivalent of controllers — they are an
inbound delivery mechanism, not a place for logic. A handler subscribes to a
domain event and delegates the reaction to a use case. Structurally, it sits
in `presentation/handlers/` for the same reason controllers sit in
`presentation/rest/`: both are entry points into the application layer, just
through different channels (HTTP vs event bus).

> **Related rules:**
> - @use-case.mdc — the use case this handler delegates to
> - @domain/event.mdc — the event type being subscribed to

---

## Non-Negotiables

- Always decorate with `@Injectable()`
- Always use `@OnEvent(EventTypes.X)` with the enum value — never raw strings
- Every handler method must return `Promise<void>`
- Each `@OnEvent` method delegates to exactly one use case — never inline logic
- Never import domain repositories or infrastructure classes directly
- Never handle more than one resource's events in the same handler class

---

## Patterns

### ✅ Correct

```typescript
@Injectable()
export class TruckEventsHandler {
  constructor(private readonly sendAdminEmailUseCase: SendAdminEmailUseCase) {}

  @OnEvent(EventTypes.TRUCK_CREATED)
  async handleTruckCreated(event: TruckCreatedEvent): Promise<void> {
    await this.sendAdminEmailUseCase.execute({
      subject: 'New Truck Created',
      body: `License Plate: ${event.payload.licensePlate}`,
    });
  }
}
```

### ❌ Wrong

```typescript
@OnEvent('truck.created')                       // raw string — use EventTypes enum
async handleTruckCreated(event: TruckCreatedEvent) { // missing return type Promise<void>
  await this.mailerService.sendMail({ ... });    // calling infrastructure directly
  this.logger.log('Truck created');              // logic beyond delegation
}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/notification/presentation/handlers/truck-events.handler.ts — canonical example
- @domain/event.mdc — event shape and EventTypes enum
- @use-case.mdc — the use case being delegated to
---
globs:
  - '**/*.module.ts'
---

# NestJS Module

## Purpose
Modules are the DI wiring layer. They assemble a feature by binding abstract
domain tokens to their concrete infrastructure implementations and registering
all use cases, controllers, mappers, and handlers. A feature module owns
everything inside its folder boundary. Global modules (`@Global()`) expose
shared infrastructure to the entire application without requiring explicit
imports — they are declared once in `AppModule` and never imported elsewhere.

> **Related rules:**
> - @domain/repository.mdc — abstract class used as the DI token
> - @infrastructure/repository.mdc — concrete class bound to the token
> - @core/architecture.mdc — what each layer is allowed to import

---

## Non-Negotiables

- Abstract domain classes are always bound with `{ provide: AbstractClass, useClass: ConcreteClass }`
- Use cases, mappers, and handlers are registered directly as shorthand providers
- Only `@Global()` modules export their providers — feature modules never export
- `@Global()` modules are imported only in `AppModule` — never in feature modules
- `AppModule` registers global exception filters via `{ provide: APP_FILTER, useClass: XxxFilter }`
- Never add business logic to a module — it is wiring only

---

## Patterns

### ✅ Correct — feature module

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [TruckController],
  providers: [
    {
      provide: TruckRepository,
      useClass: PrismaTruckRepository
    },
    CreateTruckUseCase,
    FindAllTrucksUseCase,
    UpdateTruckUseCase,
    DeleteTruckUseCase,
    TruckControllerMapper,
  ],
})
export class TrucksModule {}
```

### ✅ Correct — global module

```typescript
@Global()
@Module({
  providers: [{ provide: Mailer, useClass: NestjsMailerService }],
  exports: [Mailer],
})
export class MailModule {}
```

### ❌ Wrong

```typescript
@Module({
  providers: [
    PrismaTruckRepository,           // concrete class exposed directly — use abstract token
  ],
  exports: [PrismaTruckRepository],  // feature modules never export
})
export class TrucksModule {}
```

---

## References
- @projects/apps/truck-backend/src/app/modules/trucks/trucks.module.ts — feature module example
- @projects/apps/truck-backend/src/app/modules/mail/mail.module.ts — global module example
- @projects/apps/truck-backend/src/app/app.module.ts — AppModule wiring and filter registration
