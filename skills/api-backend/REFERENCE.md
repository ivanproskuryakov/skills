# API backend — reference

Detailed conventions for a backend on routing-controllers, Inversify and TypeORM.
File names and classes below are the shape these conventions assume; where the
project names them differently, follow the project (and its add-on).

## Package location

| Item | Typical path |
|------|------|
| Backend app | `api/` |
| Source root | `api/src/` |
| Path alias | `@` → `api/src` |
| Entry point | `api/src/server.ts` |
| TypeORM CLI config | `api/src/ormconfig.ts` (or a data-source module) |

In a monorepo, run the backend's scripts through the workspace filter
(`pnpm --filter ./api <script>`) or from its directory.

`@` resolves to `src` via `tsconfig.json` `paths`. At runtime something has to
resolve it too: `tsconfig-paths/register` in dev/test, and in production either the
same or a small alias registration loaded first by `server.ts`.

## Directory structure

```
src/
├── server.ts                    # register alias → createApp → bootstrap → start
├── ormconfig.ts                 # TypeORM CLI config
│
├── app/
│   ├── app.ts                   # Express + routing-controllers bootstrap
│   ├── app-container.ts         # Inversify container bindings
│   ├── app-config.ts            # Env detection, dotenv, IConfigParameters
│   └── app-bootstrap.ts         # createApp() / createAppTest()
│
├── connector/db-connector.ts    # TypeORM connection creation
│
├── controller/                  # HTTP controllers (@JsonController)
├── decorator/                   # @CurrentUser, @EntityFromParam, openapi/
├── entity/                      # TypeORM entities + entity/constraint/
├── exception/                   # Custom HTTP errors
├── middleware/                  # error handler, role validation, payload logger
├── model/                       # I*/E* types; model/dto/ for *Dto
├── repository/                  # base repository template + concrete repos
├── service/                     # *Manager + infra + service/auth/
├── scripts/                     # e.g. OpenAPI spec export
├── test/                        # *.test.ts
└── types/global.d.ts
```

## Core rule: no helper functions without classes

Every function that carries domain or utility logic is a **method on a class**.
Stateless utilities use `static` methods on a named class; stateful collaborators
are `@injectable()` services.

```typescript
// service/helper.ts
export class Helper {
  public static toFixedDecimals(value: number, numberDecimals: number) {
    return Number(value.toFixed(numberDecimals))
  }
}

// service/calc.ts
export class Calc {
  public static rateTotal(/* ... */) { /* ... */ }
}
```

### Documented exceptions (framework plumbing only)

| Category | Typical location | Example |
|----------|----------|---------|
| Bootstrap | `app/app-bootstrap.ts` | `createApp()`, `createAppTest()` |
| Authorization callback | `middleware/validate-roles.ts` | `export const ValidateRoles = async (action, roles) => …` |
| Decorator factories | `decorator/*.ts`, `decorator/openapi/*.ts` | `CurrentUser()`, `EntityFromParam()`, `OpenAPIExtended()` |
| OpenAPI internals | `decorator/openapi/*.ts` | private module functions |
| Low-level crypto/auth plumbing | `service/auth/*.ts` | key parsing, signature payload decoding |
| Test fixtures | `test/fixture/*.ts` | `buildAuthPayload()` |
| Type-only exports | `model/dto/*.ts` | `SORT_DIRECTIONS`, `type SortDirection` |

Anything that is domain or reusable business logic must be in a class, not a loose
function.

### Scope, not visibility

The exceptions above are about *what* the function is, never about how small or
how private it is. Dropping `export` does not make a module-scope function
acceptable: a helper that only one class calls belongs **inside** that class as
a `private` method (`private static` when it never touches `this`), declared
after the public methods.

Promote a `private` method to a `static` utility class only when a second class
needs it. Module-scope `const`s are unaffected — the rule covers functions.

## Layer responsibilities

### Controllers (`controller/`)

HTTP routing, request/response shaping, auth decorators; delegate to
managers/repositories. DI is **manual**: resolve from the container in the
constructor (not `@inject`), because routing-controllers constructs controllers.

```typescript
@Authorized([EUserRole.ROLE_USER])
@JsonController('/project')
export class ProjectController {
  protected projectManager: ProjectManager
  protected projectRepository: ProjectRepository

  constructor() {
    this.projectManager = App.container.get('ProjectManager')
    this.projectRepository = App.container.get('ProjectRepository')
  }
}
```

Registered in `app/app.ts` via `useExpressServer`, typically with
`routePrefix: '/api'`.

### Services (`service/`)

Business logic, orchestration, external integrations. `@injectable()` + property
`@inject('Token')`.

```typescript
@injectable()
export class ProjectManager {
  @inject('ProjectRepository')
  protected projectRepository: ProjectRepository
  @inject('UserRepository')
  protected userRepository: UserRepository
}
```

Naming: `*Manager` for domain orchestration; plain names for infra (`Filter`,
`Http`, `Mailer`, `RedisClient`, `OpenApi`, `ImageResizer`). Auth services live in
`service/auth/` (`Authenticator`, `Signer`, …).

### Repositories (`repository/`)

TypeORM data access, query builders, search/pagination. Extend the base repository
template (e.g. `AbstractRepositoryTemplate<T>`), set `protected target`, inject the
shared `Filter`.

```typescript
@injectable()
export class ProjectRepository extends AbstractRepositoryTemplate<Project> {
  @inject('Filter')
  protected filter: Filter
  @inject('UserRepository')
  protected userRepository: UserRepository
  protected target = Project
}
```

The template provides `validateAndSave`, `findBy`, `saveSingle` and query-builder
helpers over `getRepository(this.target)`. `validateAndSave()` runs
class-validator and throws a constraints-validation exception.

### Entities (`entity/`)

TypeORM DB models + validation + serialization groups + OpenAPI schema metadata.
Extend the base entity, implement the matching `I*` interface.

```typescript
@Entity('project')
@Exclude()
export class Project extends AbstractBaseEntity implements IProject {
  @IsNotEmpty()
  @Expose({ groups: ['search', 'create', 'edit'] })
  @Column('text', { nullable: true })
  @IsString()
  title: string
}
```

- Base entity: `id` (UUID), `createdAt`, `updatedAt`, `deletedAt` (soft delete)
- Relations: `@ManyToOne`, `@OneToMany`, `@JoinColumn`, often `eager: true`
- Serialization: `@Exclude()` on class, `@Expose({ groups })` per field — drives
  output + OpenAPI groups
- Custom validators: `@ValidatorConstraint` classes in `entity/constraint/`

### Models (`model/`)

Pure TypeScript — **no TypeORM decorators**.

| Kind | Location | Naming | Example |
|------|----------|--------|---------|
| Enums | `model/*.ts` | `E` prefix | `EProjectState`, `EUserRole` |
| Interfaces | `model/*.ts` | `I` prefix | `IProject`, `IConfigParameters` |
| DTO classes | `model/dto/*.ts` | `*Dto` suffix | `ProjectSearchDto`, `LoginDto` |
| Type aliases | `model/dto/*.ts` | no prefix | `SortDirection` |

DTOs use class-validator + class-transformer (`@Type()`, `@ValidateNested()`).
Search DTOs extend a shared `SearchDto` and nest filter/sort sub-DTOs.

### Middleware (`middleware/`)

- `ErrorHandler` — `@Middleware({ type: 'after' })` implements
  `ExpressErrorMiddlewareInterface`; formats every error in one place.
- `ValidateRoles` — exported async function passed as `authorizationChecker`;
  resolves the user via the `Authenticator`, compares `user.roles` to
  `@Authorized([...])`. An empty roles array means any authenticated user.

```typescript
@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: unknown, _request, response, _next): void {
    const errorFormatted = ErrorFormatter.format(error)
    response.status(httpCode)
    response.send(errorFormatted)
  }
}
```

### Exceptions (`exception/`)

Default-exported classes extending routing-controllers errors. Set `static NAME`,
fix the prototype chain.

```typescript
class AccessException extends UnauthorizedError {
  public static NAME = 'UserAccessException'
  constructor(message: string = "The data can't be accessed by your user") {
    super(`Access error: ${message}`)
    Object.setPrototypeOf(this, AccessException.prototype)
    this.name = AccessException.NAME
  }
}
export default AccessException
```

| Exception | Extends | HTTP |
|-----------|---------|------|
| `AccessException` | `UnauthorizedError` | 401 |
| `AuthenticationException` | `UnauthorizedError` | 401 |
| `ConstraintsValidationException` | `HttpError` | 400 (+ `violations`) |
| `RejectedExecutionException` | `Error` | internal/bootstrap |

Import as default: `import AccessException from '@/exception/access-exception'`.

## Dependency injection (Inversify)

### Container (`app/app-container.ts`)

```typescript
public static build(parameters: IConfigParameters, env: string) {
  const container = new Container({ skipBaseClassChecks: true })
  container.bind<string>('env').toConstantValue(env)
  container.bind<IConfigParameters>('parameters').toConstantValue(parameters)
  container.bind<Http>('Http').to(Http)
  container.bind<UserRepository>('UserRepository').to(UserRepository)
  container.bind<ProjectManager>('ProjectManager').to(ProjectManager)
  container.bind<UserFixture>('UserFixture').to(UserFixture)
  return container
}
```

**Token convention:** token string = PascalCase class name. Exceptions: `'env'`,
`'parameters'`. No Symbols.

| Layer | DI pattern |
|-------|------------|
| Services, repositories, fixtures | `@injectable()` + `@inject('Token')` |
| Controllers | `App.container.get('Token')` in constructor |
| Middleware (`ValidateRoles`), `@CurrentUser` | the container accessor, `.get('Token')` |

Add every new service/repository/fixture to the container or `@inject` resolution
fails at runtime.

## routing-controllers usage

### Global setup (`app/app.ts`)

```typescript
useExpressServer(this.express, {
  defaultErrorHandler: false,
  middlewares: [ErrorHandler],
  authorizationChecker: ValidateRoles,
  routePrefix: '/api',
  controllers: [HelpController, ProjectController, AuthController, /* ... */],
})
```

`app.ts` also configures `trust proxy` when behind a reverse proxy,
`bodyParser.json`, and the Swagger UI.

### Decorators

| Decorator | Usage |
|-----------|-------|
| `@JsonController('/path')` | all controllers |
| `@Get`, `@Post`, `@Put`, `@Delete` | route methods |
| `@HttpCode(200\|201)` | explicit status |
| `@Authorized([EUserRole.ROLE_USER])` | class or method level |
| `@Body({ validate: { groups }, transform: { groups } })` | validation groups |
| `@CurrentUser()` | the signed-in user |
| `@EntityFromParam({ paramName: 'id' })` | custom — load entity from route param (404 when missing) |
| `@Req()`, `@Res()`, `@Param('name')` | request params |
| `@OpenAPIExtended({ ... })` | custom OpenAPI composition, preferred where it exists |
| `@OpenAPI({ ... })` | raw `routing-controllers-openapi` |

### OpenAPI composition pattern

```typescript
@OpenAPIExtended({
  summary: 'Search projects accessible to the current user',
  searchRequestBody: {
    example: { filter: { state: 'DRAFT' }, sort: { createdAt: 'DESC' }, page: 0 },
  },
  response: {
    schema: Project,
    options: { isPagination: true, serializationGroup: 'search' },
  },
})
@Post('/search')
@HttpCode(200)
public search(@CurrentUser() user: User, @Body() search: ProjectSearchDto) {}
```

A composition decorator like this can derive the body, response, search request
body, optional authorization header and the 404 from `@EntityFromParam`, so every
endpoint documents itself the same way.

### Auth flow

`ValidateRoles` asks the `Authenticator` for the current user (or throws), then
checks the user's roles against `@Authorized([...])`.

## Config / parameters

`AppConfig` (`app/app-config.ts`) turns the environment into one typed
`IConfigParameters` object (`model/config.ts`) — host, port, database connection
and the other settings the services need — and detects the environment
(`getEnv()`, `isTest()`, `isProduction()`). The container binds it as
`'parameters'`; services take it with `@inject('parameters')` (controllers with
`App.container.get('parameters')`) instead of reading the environment themselves.

## Testing

**Location:** `src/test/`.

**Naming:** `*.test.ts`; DB integration `*.integration.test.ts`.

**Stack** (use the project's): Mocha, Chai, `@testdeck/mocha` (`@suite()`,
`@test()`, `@timeout()`), nyc coverage, nock (HTTP mocking), node-mocks-http
(middleware), and a generated API client for controller tests.

**Base classes:**
- Controller test base — boots the real app on a random port, exposes fixtures and
  an API client
- Database integration base — DB connection + container for repository tests

Fixtures (`UserFixture`, etc.) are `@injectable()` and bound in the container.

## Adding an endpoint (checklist)

1. Entity in `entity/` with `@Expose({ groups })` + class-validator.
2. `I*`/`E*` types in `model/`; `*Dto` in `model/dto/` for request bodies.
3. Repository methods in `repository/*-repository.ts`.
4. Business logic in `service/*-manager.ts` (`@injectable` + `@inject`).
5. Bind new service/repo in the container.
6. Controller method with `@JsonController`, `@Authorized`, the OpenAPI decorator,
   `@Body`/`@CurrentUser`/`@EntityFromParam`.
7. Register new controllers in the `controllers` list.
8. Test extending the controller test base in `test/controller/`.
9. If the project generates an API client from the OpenAPI spec, regenerate it.

## Do not

- Write domain/utility logic as standalone module functions — put it in a class
  (static utility or injectable service)
- Leave a single-use helper at module scope beside its class — make it a `private`
  method on that class
- Put business logic in controllers — controllers do HTTP only, delegate to a `*Manager`
- Add TypeORM decorators to `model/` types — DB models live in `entity/`
- Use `@inject` in controllers — controllers resolve from the container
- Add a service/repository without binding it in the container
- Bypass `validateAndSave` for persistence that needs validation
