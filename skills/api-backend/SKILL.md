---
name: api-backend
description: >-
  Layered backend conventions for a Node/TypeScript API built on
  routing-controllers, Inversify DI and TypeORM. Use when editing that backend:
  adding endpoints, controllers, services/managers, repositories, entities,
  models, DTOs, middleware, decorators or exceptions, or when the user mentions
  the API, backend, inversify, routing-controllers or TypeORM in such a project.
---

# API backend conventions

For a Node/TypeScript backend on routing-controllers (Express), Inversify and
TypeORM. Read `CLAUDE.md`/`AGENTS.md` and the project add-on
(`.claude/api-backend.md` or `.agents/api-backend.md`) if one exists: it names the
backend package, its base classes, custom decorators, reference implementations
and commands, and overrides the defaults below. Explicit user instructions override
both. Where the project already has its own name for something below (a base
repository, an OpenAPI decorator, a test base), use the project's; do not introduce
a missing base class in an unrelated change.

## Quick start

1. **Locate the backend**: the package whose `package.json` depends on
   `routing-controllers`, `inversify` and `typeorm` (often `api/`), its source root
   and path alias (`tsconfig` `paths`, commonly `@` → `src`), and its entry
   (`server.ts` → create app → bootstrap → start).
2. **Follow the layers:** controller → service (`*Manager`) → repository → entity.
   Controllers do HTTP only; business logic lives in `*Manager` services.
3. **There are no helper functions without classes** — every function lives inside
   a class as a method (often `static` for stateless utilities). Standalone module
   functions are reserved for the few framework-plumbing exceptions below.
4. **Wire dependencies** in the Inversify container module (e.g.
   `app/app-container.ts`); services/repositories use `@injectable()` +
   `@inject('Token')`, controllers resolve from the container in their constructor.
5. **Register endpoints** with routing-controllers decorators (`@JsonController`,
   `@Get`/`@Post`, `@Authorized`, the project's OpenAPI decorator).

Find the dev, test and build scripts in the backend's `package.json` (or the
workspace filter for it). For full conventions and code patterns, see
[REFERENCE.md](REFERENCE.md).

## Layers

```
src/
├── app/           # Express + routing-controllers bootstrap, Inversify container, config
├── connector/     # Infra bootstrapping outside DI (TypeORM connection / data source)
├── controller/    # HTTP routing only; delegate to managers/repositories
├── service/       # Business logic (*Manager), infra (Http, Mailer, RedisClient), auth/
├── repository/    # TypeORM data access; extend the project's base repository
├── entity/        # TypeORM DB models + validation + serialization groups
├── model/         # Pure TS types: I* interfaces, E* enums; dto/ for *Dto request bodies
├── middleware/    # error handler, role validation
├── decorator/     # Custom param decorators (@CurrentUser, @EntityFromParam) + openapi/
├── exception/     # Custom HTTP errors (default-exported classes)
└── test/          # *.test.ts
```

Use the directories the project has; this is the shape these conventions assume.

## Core rule: no helper functions without classes

Domain and utility logic must be a **method on a class**, not a loose module function.

```typescript
// Good — static utility class
export class Helper {
  public static toFixedDecimals(value: number, numberDecimals: number) {
    return Number(value.toFixed(numberDecimals))
  }
}

// Good — injectable service
@injectable()
export class ProjectManager {
  @inject('ProjectRepository')
  protected projectRepository: ProjectRepository
}
```

```typescript
// Avoid — standalone domain helper at module scope
export function toFixedDecimals(value: number, n: number) { /* ... */ }
```

### A helper with one caller is a `private` method on that class

The rule is about **module scope**, not about `export`. An unexported function
sitting above a class in the same file is the same violation — put it inside
the class as `private` (or `private static` when it never touches `this`).
Reach for a separate static utility class only once a second class needs it.

```typescript
// Avoid — helper at module scope next to the only class that calls it
function contactMessageText(data: ContactMessageDto): string { /* ... */ }

@injectable()
export class Mailer {
  public async sendContactMessage(data: ContactMessageDto): Promise<void> {
    /* ... */ text: contactMessageText(data)
  }
}
```

```typescript
// Good — private method, declared after the public ones
@injectable()
export class Mailer {
  public async sendContactMessage(data: ContactMessageDto): Promise<void> {
    /* ... */ text: this.contactMessageText(data)
  }

  /** Plain-text body: the header lines the sender filled in, then the message. */
  private contactMessageText(data: ContactMessageDto): string { /* ... */ }
}
```

| Who calls it | Where it goes |
|--------------|---------------|
| One class | `private` method on that class, below its public methods |
| Several classes, stateless | `public static` on a named utility class (`Helper`, `Calc`) |
| Several classes, needs collaborators | `@injectable()` service bound in the container |
| Nothing yet (new code) | Start as `private` — promote it when a second caller appears |

Module-scope constants (`const API_URL = '…'`) are fine; only functions
are covered by this rule.

**Allowed exceptions** (framework plumbing only): app bootstrap (`createApp`), the
`authorizationChecker` callback, decorator factories under `decorator/`, low-level
crypto/OpenAPI plumbing, test fixtures, and type-only exports. Everything else goes
in a class.

## Class organization by layer

| Layer | Class shape | DI |
|-------|-------------|-----|
| Controller | `@JsonController('/x')`, methods with route decorators | container `get('Token')` in constructor |
| Service / Manager | `@injectable()` class | `@inject('Token')` on `protected` props |
| Repository | extends the base repository, `protected target = Entity` | `@inject('Filter')`, etc. |
| Entity | `@Entity()` extends the base entity, implements `I*` | n/a |
| Exception | default-exported class, `extends` a routing-controllers error | n/a |
| Utility | `class` with `static` methods | n/a |

## Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Files | kebab-case | `project-controller.ts` |
| Classes | PascalCase | `ProjectController` |
| Enums | `E` prefix | `EUserRole` |
| Interfaces | `I` prefix | `IProject` |
| DTOs | `*Dto` suffix | `ProjectSearchDto` |
| Services | `*Manager` (domain) | `InvoiceManager` |
| Repositories | `*Repository` | `TimeRepository` |
| DI tokens | PascalCase class name | `'ProjectManager'` |

## Adding an endpoint

1. Entity in `entity/` with `@Expose({ groups })` + validators.
2. `I*` / `E*` types in `model/`; `*Dto` in `model/dto/` for request bodies.
3. Repository methods in `repository/*-repository.ts`.
4. Business logic in `service/*-manager.ts` (`@injectable` + `@inject`).
5. Bind any new service/repo in the container module.
6. Controller method with `@JsonController`, `@Authorized`, the OpenAPI decorator,
   `@Body`/`@CurrentUser`/`@EntityFromParam`.
7. Register new controllers in the routing-controllers `controllers` list.
8. Test in `test/controller/` extending the project's controller test base.

## Do not

- Write domain/utility logic as standalone module functions — put it in a class
- Leave a single-use helper at module scope beside its class — make it a `private` method
- Put business logic in controllers — delegate to a `*Manager`
- Add TypeORM decorators to `model/` types — entities live in `entity/`
- Inject into controllers with `@inject` — resolve from the container (services/repos use `@inject`)
- Use raw IP/socket access without normalizing through the owning service
- Add a new service/repository without binding it in the container

## Reference implementations

Before writing a new controller, manager, repository, entity, exception or test,
open the project's most complete existing one of that kind (the add-on may list
them) and match it: a search + CRUD controller, an injectable manager, a repository
using the base template, an entity with serialization groups, a custom exception,
the container bindings, the Express bootstrap and the controller test base.
