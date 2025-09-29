
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserSession
 * 
 */
export type UserSession = $Result.DefaultSelection<Prisma.$UserSessionPayload>
/**
 * Model Repository
 * 
 */
export type Repository = $Result.DefaultSelection<Prisma.$RepositoryPayload>
/**
 * Model Snapshot
 * 
 */
export type Snapshot = $Result.DefaultSelection<Prisma.$SnapshotPayload>
/**
 * Model Comment
 * 
 */
export type Comment = $Result.DefaultSelection<Prisma.$CommentPayload>
/**
 * Model TimelineEvent
 * 
 */
export type TimelineEvent = $Result.DefaultSelection<Prisma.$TimelineEventPayload>
/**
 * Model Diff
 * 
 */
export type Diff = $Result.DefaultSelection<Prisma.$DiffPayload>
/**
 * Model DiffFile
 * 
 */
export type DiffFile = $Result.DefaultSelection<Prisma.$DiffFilePayload>
/**
 * Model SearchHistory
 * 
 */
export type SearchHistory = $Result.DefaultSelection<Prisma.$SearchHistoryPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const RepositoryVisibility: {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  INTERNAL: 'INTERNAL'
};

export type RepositoryVisibility = (typeof RepositoryVisibility)[keyof typeof RepositoryVisibility]


export const SnapshotStatus: {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED'
};

export type SnapshotStatus = (typeof SnapshotStatus)[keyof typeof SnapshotStatus]


export const CommentAnchorType: {
  SNAPSHOT: 'SNAPSHOT',
  COMMIT: 'COMMIT',
  FILE: 'FILE',
  LINE: 'LINE'
};

export type CommentAnchorType = (typeof CommentAnchorType)[keyof typeof CommentAnchorType]


export const CommentStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN'
};

export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus]


export const TimelineEventType: {
  REPOSITORY_CREATED: 'REPOSITORY_CREATED',
  SNAPSHOT_CREATED: 'SNAPSHOT_CREATED',
  SNAPSHOT_READY: 'SNAPSHOT_READY',
  SNAPSHOT_EXPIRED: 'SNAPSHOT_EXPIRED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_UPDATED: 'COMMENT_UPDATED',
  COMMENT_RESOLVED: 'COMMENT_RESOLVED',
  USER_JOINED: 'USER_JOINED',
  DIFF_CREATED: 'DIFF_CREATED',
  DIFF_COMPLETED: 'DIFF_COMPLETED'
};

export type TimelineEventType = (typeof TimelineEventType)[keyof typeof TimelineEventType]


export const DiffType: {
  SNAPSHOT_COMPARE: 'SNAPSHOT_COMPARE',
  COMMIT_COMPARE: 'COMMIT_COMPARE',
  BRANCH_COMPARE: 'BRANCH_COMPARE'
};

export type DiffType = (typeof DiffType)[keyof typeof DiffType]


export const DiffStatus: {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type DiffStatus = (typeof DiffStatus)[keyof typeof DiffStatus]


export const FileChangeType: {
  ADDED: 'ADDED',
  DELETED: 'DELETED',
  MODIFIED: 'MODIFIED',
  RENAMED: 'RENAMED',
  COPIED: 'COPIED'
};

export type FileChangeType = (typeof FileChangeType)[keyof typeof FileChangeType]


export const SearchType: {
  CONTENT: 'CONTENT',
  FILENAME: 'FILENAME',
  REGEX: 'REGEX'
};

export type SearchType = (typeof SearchType)[keyof typeof SearchType]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type RepositoryVisibility = $Enums.RepositoryVisibility

export const RepositoryVisibility: typeof $Enums.RepositoryVisibility

export type SnapshotStatus = $Enums.SnapshotStatus

export const SnapshotStatus: typeof $Enums.SnapshotStatus

export type CommentAnchorType = $Enums.CommentAnchorType

export const CommentAnchorType: typeof $Enums.CommentAnchorType

export type CommentStatus = $Enums.CommentStatus

export const CommentStatus: typeof $Enums.CommentStatus

export type TimelineEventType = $Enums.TimelineEventType

export const TimelineEventType: typeof $Enums.TimelineEventType

export type DiffType = $Enums.DiffType

export const DiffType: typeof $Enums.DiffType

export type DiffStatus = $Enums.DiffStatus

export const DiffStatus: typeof $Enums.DiffStatus

export type FileChangeType = $Enums.FileChangeType

export const FileChangeType: typeof $Enums.FileChangeType

export type SearchType = $Enums.SearchType

export const SearchType: typeof $Enums.SearchType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.userSession`: Exposes CRUD operations for the **UserSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserSessions
    * const userSessions = await prisma.userSession.findMany()
    * ```
    */
  get userSession(): Prisma.UserSessionDelegate<ExtArgs>;

  /**
   * `prisma.repository`: Exposes CRUD operations for the **Repository** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Repositories
    * const repositories = await prisma.repository.findMany()
    * ```
    */
  get repository(): Prisma.RepositoryDelegate<ExtArgs>;

  /**
   * `prisma.snapshot`: Exposes CRUD operations for the **Snapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Snapshots
    * const snapshots = await prisma.snapshot.findMany()
    * ```
    */
  get snapshot(): Prisma.SnapshotDelegate<ExtArgs>;

  /**
   * `prisma.comment`: Exposes CRUD operations for the **Comment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Comments
    * const comments = await prisma.comment.findMany()
    * ```
    */
  get comment(): Prisma.CommentDelegate<ExtArgs>;

  /**
   * `prisma.timelineEvent`: Exposes CRUD operations for the **TimelineEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TimelineEvents
    * const timelineEvents = await prisma.timelineEvent.findMany()
    * ```
    */
  get timelineEvent(): Prisma.TimelineEventDelegate<ExtArgs>;

  /**
   * `prisma.diff`: Exposes CRUD operations for the **Diff** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Diffs
    * const diffs = await prisma.diff.findMany()
    * ```
    */
  get diff(): Prisma.DiffDelegate<ExtArgs>;

  /**
   * `prisma.diffFile`: Exposes CRUD operations for the **DiffFile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DiffFiles
    * const diffFiles = await prisma.diffFile.findMany()
    * ```
    */
  get diffFile(): Prisma.DiffFileDelegate<ExtArgs>;

  /**
   * `prisma.searchHistory`: Exposes CRUD operations for the **SearchHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SearchHistories
    * const searchHistories = await prisma.searchHistory.findMany()
    * ```
    */
  get searchHistory(): Prisma.SearchHistoryDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    UserSession: 'UserSession',
    Repository: 'Repository',
    Snapshot: 'Snapshot',
    Comment: 'Comment',
    TimelineEvent: 'TimelineEvent',
    Diff: 'Diff',
    DiffFile: 'DiffFile',
    SearchHistory: 'SearchHistory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "userSession" | "repository" | "snapshot" | "comment" | "timelineEvent" | "diff" | "diffFile" | "searchHistory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserSession: {
        payload: Prisma.$UserSessionPayload<ExtArgs>
        fields: Prisma.UserSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>
          }
          findFirst: {
            args: Prisma.UserSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>
          }
          findMany: {
            args: Prisma.UserSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>[]
          }
          create: {
            args: Prisma.UserSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>
          }
          createMany: {
            args: Prisma.UserSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>[]
          }
          delete: {
            args: Prisma.UserSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>
          }
          update: {
            args: Prisma.UserSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>
          }
          deleteMany: {
            args: Prisma.UserSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSessionPayload>
          }
          aggregate: {
            args: Prisma.UserSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserSession>
          }
          groupBy: {
            args: Prisma.UserSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserSessionCountArgs<ExtArgs>
            result: $Utils.Optional<UserSessionCountAggregateOutputType> | number
          }
        }
      }
      Repository: {
        payload: Prisma.$RepositoryPayload<ExtArgs>
        fields: Prisma.RepositoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RepositoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RepositoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          findFirst: {
            args: Prisma.RepositoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RepositoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          findMany: {
            args: Prisma.RepositoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>[]
          }
          create: {
            args: Prisma.RepositoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          createMany: {
            args: Prisma.RepositoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RepositoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>[]
          }
          delete: {
            args: Prisma.RepositoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          update: {
            args: Prisma.RepositoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          deleteMany: {
            args: Prisma.RepositoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RepositoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RepositoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          aggregate: {
            args: Prisma.RepositoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRepository>
          }
          groupBy: {
            args: Prisma.RepositoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<RepositoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.RepositoryCountArgs<ExtArgs>
            result: $Utils.Optional<RepositoryCountAggregateOutputType> | number
          }
        }
      }
      Snapshot: {
        payload: Prisma.$SnapshotPayload<ExtArgs>
        fields: Prisma.SnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>
          }
          findFirst: {
            args: Prisma.SnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>
          }
          findMany: {
            args: Prisma.SnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>[]
          }
          create: {
            args: Prisma.SnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>
          }
          createMany: {
            args: Prisma.SnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SnapshotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>[]
          }
          delete: {
            args: Prisma.SnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>
          }
          update: {
            args: Prisma.SnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>
          }
          deleteMany: {
            args: Prisma.SnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SnapshotPayload>
          }
          aggregate: {
            args: Prisma.SnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSnapshot>
          }
          groupBy: {
            args: Prisma.SnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<SnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.SnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<SnapshotCountAggregateOutputType> | number
          }
        }
      }
      Comment: {
        payload: Prisma.$CommentPayload<ExtArgs>
        fields: Prisma.CommentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CommentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CommentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findFirst: {
            args: Prisma.CommentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CommentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findMany: {
            args: Prisma.CommentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          create: {
            args: Prisma.CommentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          createMany: {
            args: Prisma.CommentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CommentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          delete: {
            args: Prisma.CommentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          update: {
            args: Prisma.CommentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          deleteMany: {
            args: Prisma.CommentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CommentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CommentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          aggregate: {
            args: Prisma.CommentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComment>
          }
          groupBy: {
            args: Prisma.CommentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CommentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CommentCountArgs<ExtArgs>
            result: $Utils.Optional<CommentCountAggregateOutputType> | number
          }
        }
      }
      TimelineEvent: {
        payload: Prisma.$TimelineEventPayload<ExtArgs>
        fields: Prisma.TimelineEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TimelineEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TimelineEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>
          }
          findFirst: {
            args: Prisma.TimelineEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TimelineEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>
          }
          findMany: {
            args: Prisma.TimelineEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>[]
          }
          create: {
            args: Prisma.TimelineEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>
          }
          createMany: {
            args: Prisma.TimelineEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TimelineEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>[]
          }
          delete: {
            args: Prisma.TimelineEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>
          }
          update: {
            args: Prisma.TimelineEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>
          }
          deleteMany: {
            args: Prisma.TimelineEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TimelineEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TimelineEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimelineEventPayload>
          }
          aggregate: {
            args: Prisma.TimelineEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTimelineEvent>
          }
          groupBy: {
            args: Prisma.TimelineEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<TimelineEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.TimelineEventCountArgs<ExtArgs>
            result: $Utils.Optional<TimelineEventCountAggregateOutputType> | number
          }
        }
      }
      Diff: {
        payload: Prisma.$DiffPayload<ExtArgs>
        fields: Prisma.DiffFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DiffFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DiffFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          findFirst: {
            args: Prisma.DiffFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DiffFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          findMany: {
            args: Prisma.DiffFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>[]
          }
          create: {
            args: Prisma.DiffCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          createMany: {
            args: Prisma.DiffCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DiffCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>[]
          }
          delete: {
            args: Prisma.DiffDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          update: {
            args: Prisma.DiffUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          deleteMany: {
            args: Prisma.DiffDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DiffUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DiffUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          aggregate: {
            args: Prisma.DiffAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiff>
          }
          groupBy: {
            args: Prisma.DiffGroupByArgs<ExtArgs>
            result: $Utils.Optional<DiffGroupByOutputType>[]
          }
          count: {
            args: Prisma.DiffCountArgs<ExtArgs>
            result: $Utils.Optional<DiffCountAggregateOutputType> | number
          }
        }
      }
      DiffFile: {
        payload: Prisma.$DiffFilePayload<ExtArgs>
        fields: Prisma.DiffFileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DiffFileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DiffFileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>
          }
          findFirst: {
            args: Prisma.DiffFileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DiffFileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>
          }
          findMany: {
            args: Prisma.DiffFileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>[]
          }
          create: {
            args: Prisma.DiffFileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>
          }
          createMany: {
            args: Prisma.DiffFileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DiffFileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>[]
          }
          delete: {
            args: Prisma.DiffFileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>
          }
          update: {
            args: Prisma.DiffFileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>
          }
          deleteMany: {
            args: Prisma.DiffFileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DiffFileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DiffFileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffFilePayload>
          }
          aggregate: {
            args: Prisma.DiffFileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiffFile>
          }
          groupBy: {
            args: Prisma.DiffFileGroupByArgs<ExtArgs>
            result: $Utils.Optional<DiffFileGroupByOutputType>[]
          }
          count: {
            args: Prisma.DiffFileCountArgs<ExtArgs>
            result: $Utils.Optional<DiffFileCountAggregateOutputType> | number
          }
        }
      }
      SearchHistory: {
        payload: Prisma.$SearchHistoryPayload<ExtArgs>
        fields: Prisma.SearchHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SearchHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SearchHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>
          }
          findFirst: {
            args: Prisma.SearchHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SearchHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>
          }
          findMany: {
            args: Prisma.SearchHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>[]
          }
          create: {
            args: Prisma.SearchHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>
          }
          createMany: {
            args: Prisma.SearchHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SearchHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>[]
          }
          delete: {
            args: Prisma.SearchHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>
          }
          update: {
            args: Prisma.SearchHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>
          }
          deleteMany: {
            args: Prisma.SearchHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SearchHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SearchHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SearchHistoryPayload>
          }
          aggregate: {
            args: Prisma.SearchHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSearchHistory>
          }
          groupBy: {
            args: Prisma.SearchHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<SearchHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.SearchHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<SearchHistoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    ownedRepositories: number
    snapshots: number
    comments: number
    timelineEvents: number
    sessions: number
    diffs: number
    searchHistory: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedRepositories?: boolean | UserCountOutputTypeCountOwnedRepositoriesArgs
    snapshots?: boolean | UserCountOutputTypeCountSnapshotsArgs
    comments?: boolean | UserCountOutputTypeCountCommentsArgs
    timelineEvents?: boolean | UserCountOutputTypeCountTimelineEventsArgs
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    diffs?: boolean | UserCountOutputTypeCountDiffsArgs
    searchHistory?: boolean | UserCountOutputTypeCountSearchHistoryArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOwnedRepositoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RepositoryWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSnapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SnapshotWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTimelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimelineEventWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDiffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiffWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSearchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SearchHistoryWhereInput
  }


  /**
   * Count Type RepositoryCountOutputType
   */

  export type RepositoryCountOutputType = {
    snapshots: number
    timelineEvents: number
    diffs: number
    searchHistory: number
  }

  export type RepositoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    snapshots?: boolean | RepositoryCountOutputTypeCountSnapshotsArgs
    timelineEvents?: boolean | RepositoryCountOutputTypeCountTimelineEventsArgs
    diffs?: boolean | RepositoryCountOutputTypeCountDiffsArgs
    searchHistory?: boolean | RepositoryCountOutputTypeCountSearchHistoryArgs
  }

  // Custom InputTypes
  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RepositoryCountOutputType
     */
    select?: RepositoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountSnapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SnapshotWhereInput
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountTimelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimelineEventWhereInput
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountDiffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiffWhereInput
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountSearchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SearchHistoryWhereInput
  }


  /**
   * Count Type SnapshotCountOutputType
   */

  export type SnapshotCountOutputType = {
    comments: number
    timelineEvents: number
    searchHistory: number
  }

  export type SnapshotCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    comments?: boolean | SnapshotCountOutputTypeCountCommentsArgs
    timelineEvents?: boolean | SnapshotCountOutputTypeCountTimelineEventsArgs
    searchHistory?: boolean | SnapshotCountOutputTypeCountSearchHistoryArgs
  }

  // Custom InputTypes
  /**
   * SnapshotCountOutputType without action
   */
  export type SnapshotCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SnapshotCountOutputType
     */
    select?: SnapshotCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SnapshotCountOutputType without action
   */
  export type SnapshotCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * SnapshotCountOutputType without action
   */
  export type SnapshotCountOutputTypeCountTimelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimelineEventWhereInput
  }

  /**
   * SnapshotCountOutputType without action
   */
  export type SnapshotCountOutputTypeCountSearchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SearchHistoryWhereInput
  }


  /**
   * Count Type CommentCountOutputType
   */

  export type CommentCountOutputType = {
    replies: number
    timelineEvents: number
  }

  export type CommentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    replies?: boolean | CommentCountOutputTypeCountRepliesArgs
    timelineEvents?: boolean | CommentCountOutputTypeCountTimelineEventsArgs
  }

  // Custom InputTypes
  /**
   * CommentCountOutputType without action
   */
  export type CommentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentCountOutputType
     */
    select?: CommentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CommentCountOutputType without action
   */
  export type CommentCountOutputTypeCountRepliesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * CommentCountOutputType without action
   */
  export type CommentCountOutputTypeCountTimelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimelineEventWhereInput
  }


  /**
   * Count Type DiffCountOutputType
   */

  export type DiffCountOutputType = {
    files: number
  }

  export type DiffCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    files?: boolean | DiffCountOutputTypeCountFilesArgs
  }

  // Custom InputTypes
  /**
   * DiffCountOutputType without action
   */
  export type DiffCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffCountOutputType
     */
    select?: DiffCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DiffCountOutputType without action
   */
  export type DiffCountOutputTypeCountFilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiffFileWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    password: string | null
    avatar: string | null
    role: $Enums.UserRole | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    password: string | null
    avatar: string | null
    role: $Enums.UserRole | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    username: number
    password: number
    avatar: number
    role: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    avatar?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    avatar?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    avatar?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    username: string
    password: string
    avatar: string | null
    role: $Enums.UserRole
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownedRepositories?: boolean | User$ownedRepositoriesArgs<ExtArgs>
    snapshots?: boolean | User$snapshotsArgs<ExtArgs>
    comments?: boolean | User$commentsArgs<ExtArgs>
    timelineEvents?: boolean | User$timelineEventsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    diffs?: boolean | User$diffsArgs<ExtArgs>
    searchHistory?: boolean | User$searchHistoryArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedRepositories?: boolean | User$ownedRepositoriesArgs<ExtArgs>
    snapshots?: boolean | User$snapshotsArgs<ExtArgs>
    comments?: boolean | User$commentsArgs<ExtArgs>
    timelineEvents?: boolean | User$timelineEventsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    diffs?: boolean | User$diffsArgs<ExtArgs>
    searchHistory?: boolean | User$searchHistoryArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      ownedRepositories: Prisma.$RepositoryPayload<ExtArgs>[]
      snapshots: Prisma.$SnapshotPayload<ExtArgs>[]
      comments: Prisma.$CommentPayload<ExtArgs>[]
      timelineEvents: Prisma.$TimelineEventPayload<ExtArgs>[]
      sessions: Prisma.$UserSessionPayload<ExtArgs>[]
      diffs: Prisma.$DiffPayload<ExtArgs>[]
      searchHistory: Prisma.$SearchHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      username: string
      password: string
      avatar: string | null
      role: $Enums.UserRole
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ownedRepositories<T extends User$ownedRepositoriesArgs<ExtArgs> = {}>(args?: Subset<T, User$ownedRepositoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findMany"> | Null>
    snapshots<T extends User$snapshotsArgs<ExtArgs> = {}>(args?: Subset<T, User$snapshotsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findMany"> | Null>
    comments<T extends User$commentsArgs<ExtArgs> = {}>(args?: Subset<T, User$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany"> | Null>
    timelineEvents<T extends User$timelineEventsArgs<ExtArgs> = {}>(args?: Subset<T, User$timelineEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findMany"> | Null>
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "findMany"> | Null>
    diffs<T extends User$diffsArgs<ExtArgs> = {}>(args?: Subset<T, User$diffsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findMany"> | Null>
    searchHistory<T extends User$searchHistoryArgs<ExtArgs> = {}>(args?: Subset<T, User$searchHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly avatar: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.ownedRepositories
   */
  export type User$ownedRepositoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    where?: RepositoryWhereInput
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    cursor?: RepositoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * User.snapshots
   */
  export type User$snapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    where?: SnapshotWhereInput
    orderBy?: SnapshotOrderByWithRelationInput | SnapshotOrderByWithRelationInput[]
    cursor?: SnapshotWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SnapshotScalarFieldEnum | SnapshotScalarFieldEnum[]
  }

  /**
   * User.comments
   */
  export type User$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * User.timelineEvents
   */
  export type User$timelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    where?: TimelineEventWhereInput
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    cursor?: TimelineEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    where?: UserSessionWhereInput
    orderBy?: UserSessionOrderByWithRelationInput | UserSessionOrderByWithRelationInput[]
    cursor?: UserSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserSessionScalarFieldEnum | UserSessionScalarFieldEnum[]
  }

  /**
   * User.diffs
   */
  export type User$diffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    where?: DiffWhereInput
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    cursor?: DiffWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * User.searchHistory
   */
  export type User$searchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    where?: SearchHistoryWhereInput
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    cursor?: SearchHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SearchHistoryScalarFieldEnum | SearchHistoryScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserSession
   */

  export type AggregateUserSession = {
    _count: UserSessionCountAggregateOutputType | null
    _min: UserSessionMinAggregateOutputType | null
    _max: UserSessionMaxAggregateOutputType | null
  }

  export type UserSessionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type UserSessionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type UserSessionCountAggregateOutputType = {
    id: number
    userId: number
    token: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type UserSessionMinAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    createdAt?: true
  }

  export type UserSessionMaxAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    createdAt?: true
  }

  export type UserSessionCountAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type UserSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSession to aggregate.
     */
    where?: UserSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSessions to fetch.
     */
    orderBy?: UserSessionOrderByWithRelationInput | UserSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserSessions
    **/
    _count?: true | UserSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserSessionMaxAggregateInputType
  }

  export type GetUserSessionAggregateType<T extends UserSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateUserSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSession[P]>
      : GetScalarType<T[P], AggregateUserSession[P]>
  }




  export type UserSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSessionWhereInput
    orderBy?: UserSessionOrderByWithAggregationInput | UserSessionOrderByWithAggregationInput[]
    by: UserSessionScalarFieldEnum[] | UserSessionScalarFieldEnum
    having?: UserSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserSessionCountAggregateInputType | true
    _min?: UserSessionMinAggregateInputType
    _max?: UserSessionMaxAggregateInputType
  }

  export type UserSessionGroupByOutputType = {
    id: string
    userId: string
    token: string
    expiresAt: Date
    createdAt: Date
    _count: UserSessionCountAggregateOutputType | null
    _min: UserSessionMinAggregateOutputType | null
    _max: UserSessionMaxAggregateOutputType | null
  }

  type GetUserSessionGroupByPayload<T extends UserSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSessionGroupByOutputType[P]>
            : GetScalarType<T[P], UserSessionGroupByOutputType[P]>
        }
      >
    >


  export type UserSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userSession"]>

  export type UserSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userSession"]>

  export type UserSessionSelectScalar = {
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type UserSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSession"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      token: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["userSession"]>
    composites: {}
  }

  type UserSessionGetPayload<S extends boolean | null | undefined | UserSessionDefaultArgs> = $Result.GetResult<Prisma.$UserSessionPayload, S>

  type UserSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserSessionCountAggregateInputType | true
    }

  export interface UserSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserSession'], meta: { name: 'UserSession' } }
    /**
     * Find zero or one UserSession that matches the filter.
     * @param {UserSessionFindUniqueArgs} args - Arguments to find a UserSession
     * @example
     * // Get one UserSession
     * const userSession = await prisma.userSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSessionFindUniqueArgs>(args: SelectSubset<T, UserSessionFindUniqueArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserSessionFindUniqueOrThrowArgs} args - Arguments to find a UserSession
     * @example
     * // Get one UserSession
     * const userSession = await prisma.userSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, UserSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionFindFirstArgs} args - Arguments to find a UserSession
     * @example
     * // Get one UserSession
     * const userSession = await prisma.userSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSessionFindFirstArgs>(args?: SelectSubset<T, UserSessionFindFirstArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionFindFirstOrThrowArgs} args - Arguments to find a UserSession
     * @example
     * // Get one UserSession
     * const userSession = await prisma.userSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, UserSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSessions
     * const userSessions = await prisma.userSession.findMany()
     * 
     * // Get first 10 UserSessions
     * const userSessions = await prisma.userSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userSessionWithIdOnly = await prisma.userSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserSessionFindManyArgs>(args?: SelectSubset<T, UserSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserSession.
     * @param {UserSessionCreateArgs} args - Arguments to create a UserSession.
     * @example
     * // Create one UserSession
     * const UserSession = await prisma.userSession.create({
     *   data: {
     *     // ... data to create a UserSession
     *   }
     * })
     * 
     */
    create<T extends UserSessionCreateArgs>(args: SelectSubset<T, UserSessionCreateArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserSessions.
     * @param {UserSessionCreateManyArgs} args - Arguments to create many UserSessions.
     * @example
     * // Create many UserSessions
     * const userSession = await prisma.userSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserSessionCreateManyArgs>(args?: SelectSubset<T, UserSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserSessions and returns the data saved in the database.
     * @param {UserSessionCreateManyAndReturnArgs} args - Arguments to create many UserSessions.
     * @example
     * // Create many UserSessions
     * const userSession = await prisma.userSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserSessions and only return the `id`
     * const userSessionWithIdOnly = await prisma.userSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, UserSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserSession.
     * @param {UserSessionDeleteArgs} args - Arguments to delete one UserSession.
     * @example
     * // Delete one UserSession
     * const UserSession = await prisma.userSession.delete({
     *   where: {
     *     // ... filter to delete one UserSession
     *   }
     * })
     * 
     */
    delete<T extends UserSessionDeleteArgs>(args: SelectSubset<T, UserSessionDeleteArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserSession.
     * @param {UserSessionUpdateArgs} args - Arguments to update one UserSession.
     * @example
     * // Update one UserSession
     * const userSession = await prisma.userSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserSessionUpdateArgs>(args: SelectSubset<T, UserSessionUpdateArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserSessions.
     * @param {UserSessionDeleteManyArgs} args - Arguments to filter UserSessions to delete.
     * @example
     * // Delete a few UserSessions
     * const { count } = await prisma.userSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserSessionDeleteManyArgs>(args?: SelectSubset<T, UserSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSessions
     * const userSession = await prisma.userSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserSessionUpdateManyArgs>(args: SelectSubset<T, UserSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserSession.
     * @param {UserSessionUpsertArgs} args - Arguments to update or create a UserSession.
     * @example
     * // Update or create a UserSession
     * const userSession = await prisma.userSession.upsert({
     *   create: {
     *     // ... data to create a UserSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSession we want to update
     *   }
     * })
     */
    upsert<T extends UserSessionUpsertArgs>(args: SelectSubset<T, UserSessionUpsertArgs<ExtArgs>>): Prisma__UserSessionClient<$Result.GetResult<Prisma.$UserSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionCountArgs} args - Arguments to filter UserSessions to count.
     * @example
     * // Count the number of UserSessions
     * const count = await prisma.userSession.count({
     *   where: {
     *     // ... the filter for the UserSessions we want to count
     *   }
     * })
    **/
    count<T extends UserSessionCountArgs>(
      args?: Subset<T, UserSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserSessionAggregateArgs>(args: Subset<T, UserSessionAggregateArgs>): Prisma.PrismaPromise<GetUserSessionAggregateType<T>>

    /**
     * Group by UserSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSessionGroupByArgs['orderBy'] }
        : { orderBy?: UserSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserSession model
   */
  readonly fields: UserSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserSession model
   */ 
  interface UserSessionFieldRefs {
    readonly id: FieldRef<"UserSession", 'String'>
    readonly userId: FieldRef<"UserSession", 'String'>
    readonly token: FieldRef<"UserSession", 'String'>
    readonly expiresAt: FieldRef<"UserSession", 'DateTime'>
    readonly createdAt: FieldRef<"UserSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserSession findUnique
   */
  export type UserSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * Filter, which UserSession to fetch.
     */
    where: UserSessionWhereUniqueInput
  }

  /**
   * UserSession findUniqueOrThrow
   */
  export type UserSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * Filter, which UserSession to fetch.
     */
    where: UserSessionWhereUniqueInput
  }

  /**
   * UserSession findFirst
   */
  export type UserSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * Filter, which UserSession to fetch.
     */
    where?: UserSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSessions to fetch.
     */
    orderBy?: UserSessionOrderByWithRelationInput | UserSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSessions.
     */
    cursor?: UserSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSessions.
     */
    distinct?: UserSessionScalarFieldEnum | UserSessionScalarFieldEnum[]
  }

  /**
   * UserSession findFirstOrThrow
   */
  export type UserSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * Filter, which UserSession to fetch.
     */
    where?: UserSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSessions to fetch.
     */
    orderBy?: UserSessionOrderByWithRelationInput | UserSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSessions.
     */
    cursor?: UserSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSessions.
     */
    distinct?: UserSessionScalarFieldEnum | UserSessionScalarFieldEnum[]
  }

  /**
   * UserSession findMany
   */
  export type UserSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * Filter, which UserSessions to fetch.
     */
    where?: UserSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSessions to fetch.
     */
    orderBy?: UserSessionOrderByWithRelationInput | UserSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserSessions.
     */
    cursor?: UserSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSessions.
     */
    skip?: number
    distinct?: UserSessionScalarFieldEnum | UserSessionScalarFieldEnum[]
  }

  /**
   * UserSession create
   */
  export type UserSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a UserSession.
     */
    data: XOR<UserSessionCreateInput, UserSessionUncheckedCreateInput>
  }

  /**
   * UserSession createMany
   */
  export type UserSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSessions.
     */
    data: UserSessionCreateManyInput | UserSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserSession createManyAndReturn
   */
  export type UserSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserSessions.
     */
    data: UserSessionCreateManyInput | UserSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserSession update
   */
  export type UserSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a UserSession.
     */
    data: XOR<UserSessionUpdateInput, UserSessionUncheckedUpdateInput>
    /**
     * Choose, which UserSession to update.
     */
    where: UserSessionWhereUniqueInput
  }

  /**
   * UserSession updateMany
   */
  export type UserSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSessions.
     */
    data: XOR<UserSessionUpdateManyMutationInput, UserSessionUncheckedUpdateManyInput>
    /**
     * Filter which UserSessions to update
     */
    where?: UserSessionWhereInput
  }

  /**
   * UserSession upsert
   */
  export type UserSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the UserSession to update in case it exists.
     */
    where: UserSessionWhereUniqueInput
    /**
     * In case the UserSession found by the `where` argument doesn't exist, create a new UserSession with this data.
     */
    create: XOR<UserSessionCreateInput, UserSessionUncheckedCreateInput>
    /**
     * In case the UserSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSessionUpdateInput, UserSessionUncheckedUpdateInput>
  }

  /**
   * UserSession delete
   */
  export type UserSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
    /**
     * Filter which UserSession to delete.
     */
    where: UserSessionWhereUniqueInput
  }

  /**
   * UserSession deleteMany
   */
  export type UserSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSessions to delete
     */
    where?: UserSessionWhereInput
  }

  /**
   * UserSession without action
   */
  export type UserSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSession
     */
    select?: UserSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSessionInclude<ExtArgs> | null
  }


  /**
   * Model Repository
   */

  export type AggregateRepository = {
    _count: RepositoryCountAggregateOutputType | null
    _min: RepositoryMinAggregateOutputType | null
    _max: RepositoryMaxAggregateOutputType | null
  }

  export type RepositoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    gitUrl: string | null
    ownerId: string | null
    defaultBranch: string | null
    visibility: $Enums.RepositoryVisibility | null
    description: string | null
    isActive: boolean | null
    lastSyncAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RepositoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    gitUrl: string | null
    ownerId: string | null
    defaultBranch: string | null
    visibility: $Enums.RepositoryVisibility | null
    description: string | null
    isActive: boolean | null
    lastSyncAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RepositoryCountAggregateOutputType = {
    id: number
    name: number
    gitUrl: number
    ownerId: number
    defaultBranch: number
    visibility: number
    description: number
    isActive: number
    lastSyncAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RepositoryMinAggregateInputType = {
    id?: true
    name?: true
    gitUrl?: true
    ownerId?: true
    defaultBranch?: true
    visibility?: true
    description?: true
    isActive?: true
    lastSyncAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RepositoryMaxAggregateInputType = {
    id?: true
    name?: true
    gitUrl?: true
    ownerId?: true
    defaultBranch?: true
    visibility?: true
    description?: true
    isActive?: true
    lastSyncAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RepositoryCountAggregateInputType = {
    id?: true
    name?: true
    gitUrl?: true
    ownerId?: true
    defaultBranch?: true
    visibility?: true
    description?: true
    isActive?: true
    lastSyncAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RepositoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Repository to aggregate.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Repositories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Repositories
    **/
    _count?: true | RepositoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RepositoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RepositoryMaxAggregateInputType
  }

  export type GetRepositoryAggregateType<T extends RepositoryAggregateArgs> = {
        [P in keyof T & keyof AggregateRepository]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRepository[P]>
      : GetScalarType<T[P], AggregateRepository[P]>
  }




  export type RepositoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RepositoryWhereInput
    orderBy?: RepositoryOrderByWithAggregationInput | RepositoryOrderByWithAggregationInput[]
    by: RepositoryScalarFieldEnum[] | RepositoryScalarFieldEnum
    having?: RepositoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RepositoryCountAggregateInputType | true
    _min?: RepositoryMinAggregateInputType
    _max?: RepositoryMaxAggregateInputType
  }

  export type RepositoryGroupByOutputType = {
    id: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch: string
    visibility: $Enums.RepositoryVisibility
    description: string | null
    isActive: boolean
    lastSyncAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: RepositoryCountAggregateOutputType | null
    _min: RepositoryMinAggregateOutputType | null
    _max: RepositoryMaxAggregateOutputType | null
  }

  type GetRepositoryGroupByPayload<T extends RepositoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RepositoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RepositoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RepositoryGroupByOutputType[P]>
            : GetScalarType<T[P], RepositoryGroupByOutputType[P]>
        }
      >
    >


  export type RepositorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    gitUrl?: boolean
    ownerId?: boolean
    defaultBranch?: boolean
    visibility?: boolean
    description?: boolean
    isActive?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
    snapshots?: boolean | Repository$snapshotsArgs<ExtArgs>
    timelineEvents?: boolean | Repository$timelineEventsArgs<ExtArgs>
    diffs?: boolean | Repository$diffsArgs<ExtArgs>
    searchHistory?: boolean | Repository$searchHistoryArgs<ExtArgs>
    _count?: boolean | RepositoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["repository"]>

  export type RepositorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    gitUrl?: boolean
    ownerId?: boolean
    defaultBranch?: boolean
    visibility?: boolean
    description?: boolean
    isActive?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["repository"]>

  export type RepositorySelectScalar = {
    id?: boolean
    name?: boolean
    gitUrl?: boolean
    ownerId?: boolean
    defaultBranch?: boolean
    visibility?: boolean
    description?: boolean
    isActive?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RepositoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    snapshots?: boolean | Repository$snapshotsArgs<ExtArgs>
    timelineEvents?: boolean | Repository$timelineEventsArgs<ExtArgs>
    diffs?: boolean | Repository$diffsArgs<ExtArgs>
    searchHistory?: boolean | Repository$searchHistoryArgs<ExtArgs>
    _count?: boolean | RepositoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RepositoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RepositoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Repository"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs>
      snapshots: Prisma.$SnapshotPayload<ExtArgs>[]
      timelineEvents: Prisma.$TimelineEventPayload<ExtArgs>[]
      diffs: Prisma.$DiffPayload<ExtArgs>[]
      searchHistory: Prisma.$SearchHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      gitUrl: string
      ownerId: string
      defaultBranch: string
      visibility: $Enums.RepositoryVisibility
      description: string | null
      isActive: boolean
      lastSyncAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["repository"]>
    composites: {}
  }

  type RepositoryGetPayload<S extends boolean | null | undefined | RepositoryDefaultArgs> = $Result.GetResult<Prisma.$RepositoryPayload, S>

  type RepositoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RepositoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RepositoryCountAggregateInputType | true
    }

  export interface RepositoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Repository'], meta: { name: 'Repository' } }
    /**
     * Find zero or one Repository that matches the filter.
     * @param {RepositoryFindUniqueArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RepositoryFindUniqueArgs>(args: SelectSubset<T, RepositoryFindUniqueArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Repository that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RepositoryFindUniqueOrThrowArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RepositoryFindUniqueOrThrowArgs>(args: SelectSubset<T, RepositoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Repository that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryFindFirstArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RepositoryFindFirstArgs>(args?: SelectSubset<T, RepositoryFindFirstArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Repository that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryFindFirstOrThrowArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RepositoryFindFirstOrThrowArgs>(args?: SelectSubset<T, RepositoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Repositories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Repositories
     * const repositories = await prisma.repository.findMany()
     * 
     * // Get first 10 Repositories
     * const repositories = await prisma.repository.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const repositoryWithIdOnly = await prisma.repository.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RepositoryFindManyArgs>(args?: SelectSubset<T, RepositoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Repository.
     * @param {RepositoryCreateArgs} args - Arguments to create a Repository.
     * @example
     * // Create one Repository
     * const Repository = await prisma.repository.create({
     *   data: {
     *     // ... data to create a Repository
     *   }
     * })
     * 
     */
    create<T extends RepositoryCreateArgs>(args: SelectSubset<T, RepositoryCreateArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Repositories.
     * @param {RepositoryCreateManyArgs} args - Arguments to create many Repositories.
     * @example
     * // Create many Repositories
     * const repository = await prisma.repository.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RepositoryCreateManyArgs>(args?: SelectSubset<T, RepositoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Repositories and returns the data saved in the database.
     * @param {RepositoryCreateManyAndReturnArgs} args - Arguments to create many Repositories.
     * @example
     * // Create many Repositories
     * const repository = await prisma.repository.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Repositories and only return the `id`
     * const repositoryWithIdOnly = await prisma.repository.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RepositoryCreateManyAndReturnArgs>(args?: SelectSubset<T, RepositoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Repository.
     * @param {RepositoryDeleteArgs} args - Arguments to delete one Repository.
     * @example
     * // Delete one Repository
     * const Repository = await prisma.repository.delete({
     *   where: {
     *     // ... filter to delete one Repository
     *   }
     * })
     * 
     */
    delete<T extends RepositoryDeleteArgs>(args: SelectSubset<T, RepositoryDeleteArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Repository.
     * @param {RepositoryUpdateArgs} args - Arguments to update one Repository.
     * @example
     * // Update one Repository
     * const repository = await prisma.repository.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RepositoryUpdateArgs>(args: SelectSubset<T, RepositoryUpdateArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Repositories.
     * @param {RepositoryDeleteManyArgs} args - Arguments to filter Repositories to delete.
     * @example
     * // Delete a few Repositories
     * const { count } = await prisma.repository.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RepositoryDeleteManyArgs>(args?: SelectSubset<T, RepositoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Repositories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Repositories
     * const repository = await prisma.repository.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RepositoryUpdateManyArgs>(args: SelectSubset<T, RepositoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Repository.
     * @param {RepositoryUpsertArgs} args - Arguments to update or create a Repository.
     * @example
     * // Update or create a Repository
     * const repository = await prisma.repository.upsert({
     *   create: {
     *     // ... data to create a Repository
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Repository we want to update
     *   }
     * })
     */
    upsert<T extends RepositoryUpsertArgs>(args: SelectSubset<T, RepositoryUpsertArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Repositories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryCountArgs} args - Arguments to filter Repositories to count.
     * @example
     * // Count the number of Repositories
     * const count = await prisma.repository.count({
     *   where: {
     *     // ... the filter for the Repositories we want to count
     *   }
     * })
    **/
    count<T extends RepositoryCountArgs>(
      args?: Subset<T, RepositoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RepositoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Repository.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RepositoryAggregateArgs>(args: Subset<T, RepositoryAggregateArgs>): Prisma.PrismaPromise<GetRepositoryAggregateType<T>>

    /**
     * Group by Repository.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RepositoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RepositoryGroupByArgs['orderBy'] }
        : { orderBy?: RepositoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RepositoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRepositoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Repository model
   */
  readonly fields: RepositoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Repository.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RepositoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    snapshots<T extends Repository$snapshotsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$snapshotsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findMany"> | Null>
    timelineEvents<T extends Repository$timelineEventsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$timelineEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findMany"> | Null>
    diffs<T extends Repository$diffsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$diffsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findMany"> | Null>
    searchHistory<T extends Repository$searchHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Repository$searchHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Repository model
   */ 
  interface RepositoryFieldRefs {
    readonly id: FieldRef<"Repository", 'String'>
    readonly name: FieldRef<"Repository", 'String'>
    readonly gitUrl: FieldRef<"Repository", 'String'>
    readonly ownerId: FieldRef<"Repository", 'String'>
    readonly defaultBranch: FieldRef<"Repository", 'String'>
    readonly visibility: FieldRef<"Repository", 'RepositoryVisibility'>
    readonly description: FieldRef<"Repository", 'String'>
    readonly isActive: FieldRef<"Repository", 'Boolean'>
    readonly lastSyncAt: FieldRef<"Repository", 'DateTime'>
    readonly createdAt: FieldRef<"Repository", 'DateTime'>
    readonly updatedAt: FieldRef<"Repository", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Repository findUnique
   */
  export type RepositoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository findUniqueOrThrow
   */
  export type RepositoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository findFirst
   */
  export type RepositoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Repositories.
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Repositories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Repositories.
     */
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Repository findFirstOrThrow
   */
  export type RepositoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Repositories.
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Repositories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Repositories.
     */
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Repository findMany
   */
  export type RepositoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repositories to fetch.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Repositories.
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Repositories.
     */
    skip?: number
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Repository create
   */
  export type RepositoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Repository.
     */
    data: XOR<RepositoryCreateInput, RepositoryUncheckedCreateInput>
  }

  /**
   * Repository createMany
   */
  export type RepositoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Repositories.
     */
    data: RepositoryCreateManyInput | RepositoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Repository createManyAndReturn
   */
  export type RepositoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Repositories.
     */
    data: RepositoryCreateManyInput | RepositoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Repository update
   */
  export type RepositoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Repository.
     */
    data: XOR<RepositoryUpdateInput, RepositoryUncheckedUpdateInput>
    /**
     * Choose, which Repository to update.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository updateMany
   */
  export type RepositoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Repositories.
     */
    data: XOR<RepositoryUpdateManyMutationInput, RepositoryUncheckedUpdateManyInput>
    /**
     * Filter which Repositories to update
     */
    where?: RepositoryWhereInput
  }

  /**
   * Repository upsert
   */
  export type RepositoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Repository to update in case it exists.
     */
    where: RepositoryWhereUniqueInput
    /**
     * In case the Repository found by the `where` argument doesn't exist, create a new Repository with this data.
     */
    create: XOR<RepositoryCreateInput, RepositoryUncheckedCreateInput>
    /**
     * In case the Repository was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RepositoryUpdateInput, RepositoryUncheckedUpdateInput>
  }

  /**
   * Repository delete
   */
  export type RepositoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter which Repository to delete.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository deleteMany
   */
  export type RepositoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Repositories to delete
     */
    where?: RepositoryWhereInput
  }

  /**
   * Repository.snapshots
   */
  export type Repository$snapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    where?: SnapshotWhereInput
    orderBy?: SnapshotOrderByWithRelationInput | SnapshotOrderByWithRelationInput[]
    cursor?: SnapshotWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SnapshotScalarFieldEnum | SnapshotScalarFieldEnum[]
  }

  /**
   * Repository.timelineEvents
   */
  export type Repository$timelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    where?: TimelineEventWhereInput
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    cursor?: TimelineEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * Repository.diffs
   */
  export type Repository$diffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    where?: DiffWhereInput
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    cursor?: DiffWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Repository.searchHistory
   */
  export type Repository$searchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    where?: SearchHistoryWhereInput
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    cursor?: SearchHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SearchHistoryScalarFieldEnum | SearchHistoryScalarFieldEnum[]
  }

  /**
   * Repository without action
   */
  export type RepositoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
  }


  /**
   * Model Snapshot
   */

  export type AggregateSnapshot = {
    _count: SnapshotCountAggregateOutputType | null
    _min: SnapshotMinAggregateOutputType | null
    _max: SnapshotMaxAggregateOutputType | null
  }

  export type SnapshotMinAggregateOutputType = {
    id: string | null
    repoId: string | null
    ownerId: string | null
    commitSha: string | null
    branchName: string | null
    worktreePath: string | null
    bundlePath: string | null
    status: $Enums.SnapshotStatus | null
    title: string | null
    description: string | null
    expiresAt: Date | null
    processedAt: Date | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SnapshotMaxAggregateOutputType = {
    id: string | null
    repoId: string | null
    ownerId: string | null
    commitSha: string | null
    branchName: string | null
    worktreePath: string | null
    bundlePath: string | null
    status: $Enums.SnapshotStatus | null
    title: string | null
    description: string | null
    expiresAt: Date | null
    processedAt: Date | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SnapshotCountAggregateOutputType = {
    id: number
    repoId: number
    ownerId: number
    commitSha: number
    branchName: number
    worktreePath: number
    bundlePath: number
    status: number
    title: number
    description: number
    expiresAt: number
    processedAt: number
    errorMessage: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SnapshotMinAggregateInputType = {
    id?: true
    repoId?: true
    ownerId?: true
    commitSha?: true
    branchName?: true
    worktreePath?: true
    bundlePath?: true
    status?: true
    title?: true
    description?: true
    expiresAt?: true
    processedAt?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SnapshotMaxAggregateInputType = {
    id?: true
    repoId?: true
    ownerId?: true
    commitSha?: true
    branchName?: true
    worktreePath?: true
    bundlePath?: true
    status?: true
    title?: true
    description?: true
    expiresAt?: true
    processedAt?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SnapshotCountAggregateInputType = {
    id?: true
    repoId?: true
    ownerId?: true
    commitSha?: true
    branchName?: true
    worktreePath?: true
    bundlePath?: true
    status?: true
    title?: true
    description?: true
    expiresAt?: true
    processedAt?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Snapshot to aggregate.
     */
    where?: SnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Snapshots to fetch.
     */
    orderBy?: SnapshotOrderByWithRelationInput | SnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Snapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Snapshots
    **/
    _count?: true | SnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SnapshotMaxAggregateInputType
  }

  export type GetSnapshotAggregateType<T extends SnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSnapshot[P]>
      : GetScalarType<T[P], AggregateSnapshot[P]>
  }




  export type SnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SnapshotWhereInput
    orderBy?: SnapshotOrderByWithAggregationInput | SnapshotOrderByWithAggregationInput[]
    by: SnapshotScalarFieldEnum[] | SnapshotScalarFieldEnum
    having?: SnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SnapshotCountAggregateInputType | true
    _min?: SnapshotMinAggregateInputType
    _max?: SnapshotMaxAggregateInputType
  }

  export type SnapshotGroupByOutputType = {
    id: string
    repoId: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath: string | null
    bundlePath: string | null
    status: $Enums.SnapshotStatus
    title: string | null
    description: string | null
    expiresAt: Date
    processedAt: Date | null
    errorMessage: string | null
    createdAt: Date
    updatedAt: Date
    _count: SnapshotCountAggregateOutputType | null
    _min: SnapshotMinAggregateOutputType | null
    _max: SnapshotMaxAggregateOutputType | null
  }

  type GetSnapshotGroupByPayload<T extends SnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], SnapshotGroupByOutputType[P]>
        }
      >
    >


  export type SnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repoId?: boolean
    ownerId?: boolean
    commitSha?: boolean
    branchName?: boolean
    worktreePath?: boolean
    bundlePath?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    expiresAt?: boolean
    processedAt?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
    comments?: boolean | Snapshot$commentsArgs<ExtArgs>
    timelineEvents?: boolean | Snapshot$timelineEventsArgs<ExtArgs>
    searchHistory?: boolean | Snapshot$searchHistoryArgs<ExtArgs>
    _count?: boolean | SnapshotCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["snapshot"]>

  export type SnapshotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repoId?: boolean
    ownerId?: boolean
    commitSha?: boolean
    branchName?: boolean
    worktreePath?: boolean
    bundlePath?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    expiresAt?: boolean
    processedAt?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["snapshot"]>

  export type SnapshotSelectScalar = {
    id?: boolean
    repoId?: boolean
    ownerId?: boolean
    commitSha?: boolean
    branchName?: boolean
    worktreePath?: boolean
    bundlePath?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    expiresAt?: boolean
    processedAt?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SnapshotInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
    comments?: boolean | Snapshot$commentsArgs<ExtArgs>
    timelineEvents?: boolean | Snapshot$timelineEventsArgs<ExtArgs>
    searchHistory?: boolean | Snapshot$searchHistoryArgs<ExtArgs>
    _count?: boolean | SnapshotCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SnapshotIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Snapshot"
    objects: {
      repository: Prisma.$RepositoryPayload<ExtArgs>
      owner: Prisma.$UserPayload<ExtArgs>
      comments: Prisma.$CommentPayload<ExtArgs>[]
      timelineEvents: Prisma.$TimelineEventPayload<ExtArgs>[]
      searchHistory: Prisma.$SearchHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      repoId: string
      ownerId: string
      commitSha: string
      branchName: string
      worktreePath: string | null
      bundlePath: string | null
      status: $Enums.SnapshotStatus
      title: string | null
      description: string | null
      expiresAt: Date
      processedAt: Date | null
      errorMessage: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["snapshot"]>
    composites: {}
  }

  type SnapshotGetPayload<S extends boolean | null | undefined | SnapshotDefaultArgs> = $Result.GetResult<Prisma.$SnapshotPayload, S>

  type SnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SnapshotFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SnapshotCountAggregateInputType | true
    }

  export interface SnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Snapshot'], meta: { name: 'Snapshot' } }
    /**
     * Find zero or one Snapshot that matches the filter.
     * @param {SnapshotFindUniqueArgs} args - Arguments to find a Snapshot
     * @example
     * // Get one Snapshot
     * const snapshot = await prisma.snapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SnapshotFindUniqueArgs>(args: SelectSubset<T, SnapshotFindUniqueArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Snapshot that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SnapshotFindUniqueOrThrowArgs} args - Arguments to find a Snapshot
     * @example
     * // Get one Snapshot
     * const snapshot = await prisma.snapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, SnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Snapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotFindFirstArgs} args - Arguments to find a Snapshot
     * @example
     * // Get one Snapshot
     * const snapshot = await prisma.snapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SnapshotFindFirstArgs>(args?: SelectSubset<T, SnapshotFindFirstArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Snapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotFindFirstOrThrowArgs} args - Arguments to find a Snapshot
     * @example
     * // Get one Snapshot
     * const snapshot = await prisma.snapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, SnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Snapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Snapshots
     * const snapshots = await prisma.snapshot.findMany()
     * 
     * // Get first 10 Snapshots
     * const snapshots = await prisma.snapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const snapshotWithIdOnly = await prisma.snapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SnapshotFindManyArgs>(args?: SelectSubset<T, SnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Snapshot.
     * @param {SnapshotCreateArgs} args - Arguments to create a Snapshot.
     * @example
     * // Create one Snapshot
     * const Snapshot = await prisma.snapshot.create({
     *   data: {
     *     // ... data to create a Snapshot
     *   }
     * })
     * 
     */
    create<T extends SnapshotCreateArgs>(args: SelectSubset<T, SnapshotCreateArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Snapshots.
     * @param {SnapshotCreateManyArgs} args - Arguments to create many Snapshots.
     * @example
     * // Create many Snapshots
     * const snapshot = await prisma.snapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SnapshotCreateManyArgs>(args?: SelectSubset<T, SnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Snapshots and returns the data saved in the database.
     * @param {SnapshotCreateManyAndReturnArgs} args - Arguments to create many Snapshots.
     * @example
     * // Create many Snapshots
     * const snapshot = await prisma.snapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Snapshots and only return the `id`
     * const snapshotWithIdOnly = await prisma.snapshot.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SnapshotCreateManyAndReturnArgs>(args?: SelectSubset<T, SnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Snapshot.
     * @param {SnapshotDeleteArgs} args - Arguments to delete one Snapshot.
     * @example
     * // Delete one Snapshot
     * const Snapshot = await prisma.snapshot.delete({
     *   where: {
     *     // ... filter to delete one Snapshot
     *   }
     * })
     * 
     */
    delete<T extends SnapshotDeleteArgs>(args: SelectSubset<T, SnapshotDeleteArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Snapshot.
     * @param {SnapshotUpdateArgs} args - Arguments to update one Snapshot.
     * @example
     * // Update one Snapshot
     * const snapshot = await prisma.snapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SnapshotUpdateArgs>(args: SelectSubset<T, SnapshotUpdateArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Snapshots.
     * @param {SnapshotDeleteManyArgs} args - Arguments to filter Snapshots to delete.
     * @example
     * // Delete a few Snapshots
     * const { count } = await prisma.snapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SnapshotDeleteManyArgs>(args?: SelectSubset<T, SnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Snapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Snapshots
     * const snapshot = await prisma.snapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SnapshotUpdateManyArgs>(args: SelectSubset<T, SnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Snapshot.
     * @param {SnapshotUpsertArgs} args - Arguments to update or create a Snapshot.
     * @example
     * // Update or create a Snapshot
     * const snapshot = await prisma.snapshot.upsert({
     *   create: {
     *     // ... data to create a Snapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Snapshot we want to update
     *   }
     * })
     */
    upsert<T extends SnapshotUpsertArgs>(args: SelectSubset<T, SnapshotUpsertArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Snapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotCountArgs} args - Arguments to filter Snapshots to count.
     * @example
     * // Count the number of Snapshots
     * const count = await prisma.snapshot.count({
     *   where: {
     *     // ... the filter for the Snapshots we want to count
     *   }
     * })
    **/
    count<T extends SnapshotCountArgs>(
      args?: Subset<T, SnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Snapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SnapshotAggregateArgs>(args: Subset<T, SnapshotAggregateArgs>): Prisma.PrismaPromise<GetSnapshotAggregateType<T>>

    /**
     * Group by Snapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SnapshotGroupByArgs['orderBy'] }
        : { orderBy?: SnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Snapshot model
   */
  readonly fields: SnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Snapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    comments<T extends Snapshot$commentsArgs<ExtArgs> = {}>(args?: Subset<T, Snapshot$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany"> | Null>
    timelineEvents<T extends Snapshot$timelineEventsArgs<ExtArgs> = {}>(args?: Subset<T, Snapshot$timelineEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findMany"> | Null>
    searchHistory<T extends Snapshot$searchHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Snapshot$searchHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Snapshot model
   */ 
  interface SnapshotFieldRefs {
    readonly id: FieldRef<"Snapshot", 'String'>
    readonly repoId: FieldRef<"Snapshot", 'String'>
    readonly ownerId: FieldRef<"Snapshot", 'String'>
    readonly commitSha: FieldRef<"Snapshot", 'String'>
    readonly branchName: FieldRef<"Snapshot", 'String'>
    readonly worktreePath: FieldRef<"Snapshot", 'String'>
    readonly bundlePath: FieldRef<"Snapshot", 'String'>
    readonly status: FieldRef<"Snapshot", 'SnapshotStatus'>
    readonly title: FieldRef<"Snapshot", 'String'>
    readonly description: FieldRef<"Snapshot", 'String'>
    readonly expiresAt: FieldRef<"Snapshot", 'DateTime'>
    readonly processedAt: FieldRef<"Snapshot", 'DateTime'>
    readonly errorMessage: FieldRef<"Snapshot", 'String'>
    readonly createdAt: FieldRef<"Snapshot", 'DateTime'>
    readonly updatedAt: FieldRef<"Snapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Snapshot findUnique
   */
  export type SnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * Filter, which Snapshot to fetch.
     */
    where: SnapshotWhereUniqueInput
  }

  /**
   * Snapshot findUniqueOrThrow
   */
  export type SnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * Filter, which Snapshot to fetch.
     */
    where: SnapshotWhereUniqueInput
  }

  /**
   * Snapshot findFirst
   */
  export type SnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * Filter, which Snapshot to fetch.
     */
    where?: SnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Snapshots to fetch.
     */
    orderBy?: SnapshotOrderByWithRelationInput | SnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Snapshots.
     */
    cursor?: SnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Snapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Snapshots.
     */
    distinct?: SnapshotScalarFieldEnum | SnapshotScalarFieldEnum[]
  }

  /**
   * Snapshot findFirstOrThrow
   */
  export type SnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * Filter, which Snapshot to fetch.
     */
    where?: SnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Snapshots to fetch.
     */
    orderBy?: SnapshotOrderByWithRelationInput | SnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Snapshots.
     */
    cursor?: SnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Snapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Snapshots.
     */
    distinct?: SnapshotScalarFieldEnum | SnapshotScalarFieldEnum[]
  }

  /**
   * Snapshot findMany
   */
  export type SnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * Filter, which Snapshots to fetch.
     */
    where?: SnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Snapshots to fetch.
     */
    orderBy?: SnapshotOrderByWithRelationInput | SnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Snapshots.
     */
    cursor?: SnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Snapshots.
     */
    skip?: number
    distinct?: SnapshotScalarFieldEnum | SnapshotScalarFieldEnum[]
  }

  /**
   * Snapshot create
   */
  export type SnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * The data needed to create a Snapshot.
     */
    data: XOR<SnapshotCreateInput, SnapshotUncheckedCreateInput>
  }

  /**
   * Snapshot createMany
   */
  export type SnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Snapshots.
     */
    data: SnapshotCreateManyInput | SnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Snapshot createManyAndReturn
   */
  export type SnapshotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Snapshots.
     */
    data: SnapshotCreateManyInput | SnapshotCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Snapshot update
   */
  export type SnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * The data needed to update a Snapshot.
     */
    data: XOR<SnapshotUpdateInput, SnapshotUncheckedUpdateInput>
    /**
     * Choose, which Snapshot to update.
     */
    where: SnapshotWhereUniqueInput
  }

  /**
   * Snapshot updateMany
   */
  export type SnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Snapshots.
     */
    data: XOR<SnapshotUpdateManyMutationInput, SnapshotUncheckedUpdateManyInput>
    /**
     * Filter which Snapshots to update
     */
    where?: SnapshotWhereInput
  }

  /**
   * Snapshot upsert
   */
  export type SnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * The filter to search for the Snapshot to update in case it exists.
     */
    where: SnapshotWhereUniqueInput
    /**
     * In case the Snapshot found by the `where` argument doesn't exist, create a new Snapshot with this data.
     */
    create: XOR<SnapshotCreateInput, SnapshotUncheckedCreateInput>
    /**
     * In case the Snapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SnapshotUpdateInput, SnapshotUncheckedUpdateInput>
  }

  /**
   * Snapshot delete
   */
  export type SnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    /**
     * Filter which Snapshot to delete.
     */
    where: SnapshotWhereUniqueInput
  }

  /**
   * Snapshot deleteMany
   */
  export type SnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Snapshots to delete
     */
    where?: SnapshotWhereInput
  }

  /**
   * Snapshot.comments
   */
  export type Snapshot$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Snapshot.timelineEvents
   */
  export type Snapshot$timelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    where?: TimelineEventWhereInput
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    cursor?: TimelineEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * Snapshot.searchHistory
   */
  export type Snapshot$searchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    where?: SearchHistoryWhereInput
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    cursor?: SearchHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SearchHistoryScalarFieldEnum | SearchHistoryScalarFieldEnum[]
  }

  /**
   * Snapshot without action
   */
  export type SnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
  }


  /**
   * Model Comment
   */

  export type AggregateComment = {
    _count: CommentCountAggregateOutputType | null
    _avg: CommentAvgAggregateOutputType | null
    _sum: CommentSumAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  export type CommentAvgAggregateOutputType = {
    lineStart: number | null
    lineEnd: number | null
  }

  export type CommentSumAggregateOutputType = {
    lineStart: number | null
    lineEnd: number | null
  }

  export type CommentMinAggregateOutputType = {
    id: string | null
    snapshotId: string | null
    authorId: string | null
    content: string | null
    anchorType: $Enums.CommentAnchorType | null
    commitSha: string | null
    filePath: string | null
    lineStart: number | null
    lineEnd: number | null
    status: $Enums.CommentStatus | null
    parentId: string | null
    isResolved: boolean | null
    resolvedAt: Date | null
    resolvedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CommentMaxAggregateOutputType = {
    id: string | null
    snapshotId: string | null
    authorId: string | null
    content: string | null
    anchorType: $Enums.CommentAnchorType | null
    commitSha: string | null
    filePath: string | null
    lineStart: number | null
    lineEnd: number | null
    status: $Enums.CommentStatus | null
    parentId: string | null
    isResolved: boolean | null
    resolvedAt: Date | null
    resolvedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CommentCountAggregateOutputType = {
    id: number
    snapshotId: number
    authorId: number
    content: number
    anchorType: number
    commitSha: number
    filePath: number
    lineStart: number
    lineEnd: number
    status: number
    parentId: number
    isResolved: number
    resolvedAt: number
    resolvedBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CommentAvgAggregateInputType = {
    lineStart?: true
    lineEnd?: true
  }

  export type CommentSumAggregateInputType = {
    lineStart?: true
    lineEnd?: true
  }

  export type CommentMinAggregateInputType = {
    id?: true
    snapshotId?: true
    authorId?: true
    content?: true
    anchorType?: true
    commitSha?: true
    filePath?: true
    lineStart?: true
    lineEnd?: true
    status?: true
    parentId?: true
    isResolved?: true
    resolvedAt?: true
    resolvedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CommentMaxAggregateInputType = {
    id?: true
    snapshotId?: true
    authorId?: true
    content?: true
    anchorType?: true
    commitSha?: true
    filePath?: true
    lineStart?: true
    lineEnd?: true
    status?: true
    parentId?: true
    isResolved?: true
    resolvedAt?: true
    resolvedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CommentCountAggregateInputType = {
    id?: true
    snapshotId?: true
    authorId?: true
    content?: true
    anchorType?: true
    commitSha?: true
    filePath?: true
    lineStart?: true
    lineEnd?: true
    status?: true
    parentId?: true
    isResolved?: true
    resolvedAt?: true
    resolvedBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CommentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comment to aggregate.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Comments
    **/
    _count?: true | CommentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CommentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CommentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CommentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CommentMaxAggregateInputType
  }

  export type GetCommentAggregateType<T extends CommentAggregateArgs> = {
        [P in keyof T & keyof AggregateComment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComment[P]>
      : GetScalarType<T[P], AggregateComment[P]>
  }




  export type CommentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithAggregationInput | CommentOrderByWithAggregationInput[]
    by: CommentScalarFieldEnum[] | CommentScalarFieldEnum
    having?: CommentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CommentCountAggregateInputType | true
    _avg?: CommentAvgAggregateInputType
    _sum?: CommentSumAggregateInputType
    _min?: CommentMinAggregateInputType
    _max?: CommentMaxAggregateInputType
  }

  export type CommentGroupByOutputType = {
    id: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha: string | null
    filePath: string | null
    lineStart: number | null
    lineEnd: number | null
    status: $Enums.CommentStatus
    parentId: string | null
    isResolved: boolean
    resolvedAt: Date | null
    resolvedBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: CommentCountAggregateOutputType | null
    _avg: CommentAvgAggregateOutputType | null
    _sum: CommentSumAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  type GetCommentGroupByPayload<T extends CommentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CommentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CommentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CommentGroupByOutputType[P]>
            : GetScalarType<T[P], CommentGroupByOutputType[P]>
        }
      >
    >


  export type CommentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    snapshotId?: boolean
    authorId?: boolean
    content?: boolean
    anchorType?: boolean
    commitSha?: boolean
    filePath?: boolean
    lineStart?: boolean
    lineEnd?: boolean
    status?: boolean
    parentId?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    snapshot?: boolean | SnapshotDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Comment$parentArgs<ExtArgs>
    replies?: boolean | Comment$repliesArgs<ExtArgs>
    timelineEvents?: boolean | Comment$timelineEventsArgs<ExtArgs>
    _count?: boolean | CommentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    snapshotId?: boolean
    authorId?: boolean
    content?: boolean
    anchorType?: boolean
    commitSha?: boolean
    filePath?: boolean
    lineStart?: boolean
    lineEnd?: boolean
    status?: boolean
    parentId?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    snapshot?: boolean | SnapshotDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Comment$parentArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectScalar = {
    id?: boolean
    snapshotId?: boolean
    authorId?: boolean
    content?: boolean
    anchorType?: boolean
    commitSha?: boolean
    filePath?: boolean
    lineStart?: boolean
    lineEnd?: boolean
    status?: boolean
    parentId?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CommentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    snapshot?: boolean | SnapshotDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Comment$parentArgs<ExtArgs>
    replies?: boolean | Comment$repliesArgs<ExtArgs>
    timelineEvents?: boolean | Comment$timelineEventsArgs<ExtArgs>
    _count?: boolean | CommentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CommentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    snapshot?: boolean | SnapshotDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    parent?: boolean | Comment$parentArgs<ExtArgs>
  }

  export type $CommentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Comment"
    objects: {
      snapshot: Prisma.$SnapshotPayload<ExtArgs>
      author: Prisma.$UserPayload<ExtArgs>
      parent: Prisma.$CommentPayload<ExtArgs> | null
      replies: Prisma.$CommentPayload<ExtArgs>[]
      timelineEvents: Prisma.$TimelineEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      snapshotId: string
      authorId: string
      content: string
      anchorType: $Enums.CommentAnchorType
      commitSha: string | null
      filePath: string | null
      lineStart: number | null
      lineEnd: number | null
      status: $Enums.CommentStatus
      parentId: string | null
      isResolved: boolean
      resolvedAt: Date | null
      resolvedBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["comment"]>
    composites: {}
  }

  type CommentGetPayload<S extends boolean | null | undefined | CommentDefaultArgs> = $Result.GetResult<Prisma.$CommentPayload, S>

  type CommentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CommentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CommentCountAggregateInputType | true
    }

  export interface CommentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Comment'], meta: { name: 'Comment' } }
    /**
     * Find zero or one Comment that matches the filter.
     * @param {CommentFindUniqueArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommentFindUniqueArgs>(args: SelectSubset<T, CommentFindUniqueArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Comment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CommentFindUniqueOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommentFindUniqueOrThrowArgs>(args: SelectSubset<T, CommentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Comment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommentFindFirstArgs>(args?: SelectSubset<T, CommentFindFirstArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Comment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommentFindFirstOrThrowArgs>(args?: SelectSubset<T, CommentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Comments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Comments
     * const comments = await prisma.comment.findMany()
     * 
     * // Get first 10 Comments
     * const comments = await prisma.comment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const commentWithIdOnly = await prisma.comment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CommentFindManyArgs>(args?: SelectSubset<T, CommentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Comment.
     * @param {CommentCreateArgs} args - Arguments to create a Comment.
     * @example
     * // Create one Comment
     * const Comment = await prisma.comment.create({
     *   data: {
     *     // ... data to create a Comment
     *   }
     * })
     * 
     */
    create<T extends CommentCreateArgs>(args: SelectSubset<T, CommentCreateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Comments.
     * @param {CommentCreateManyArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CommentCreateManyArgs>(args?: SelectSubset<T, CommentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Comments and returns the data saved in the database.
     * @param {CommentCreateManyAndReturnArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Comments and only return the `id`
     * const commentWithIdOnly = await prisma.comment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CommentCreateManyAndReturnArgs>(args?: SelectSubset<T, CommentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Comment.
     * @param {CommentDeleteArgs} args - Arguments to delete one Comment.
     * @example
     * // Delete one Comment
     * const Comment = await prisma.comment.delete({
     *   where: {
     *     // ... filter to delete one Comment
     *   }
     * })
     * 
     */
    delete<T extends CommentDeleteArgs>(args: SelectSubset<T, CommentDeleteArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Comment.
     * @param {CommentUpdateArgs} args - Arguments to update one Comment.
     * @example
     * // Update one Comment
     * const comment = await prisma.comment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CommentUpdateArgs>(args: SelectSubset<T, CommentUpdateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Comments.
     * @param {CommentDeleteManyArgs} args - Arguments to filter Comments to delete.
     * @example
     * // Delete a few Comments
     * const { count } = await prisma.comment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CommentDeleteManyArgs>(args?: SelectSubset<T, CommentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CommentUpdateManyArgs>(args: SelectSubset<T, CommentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Comment.
     * @param {CommentUpsertArgs} args - Arguments to update or create a Comment.
     * @example
     * // Update or create a Comment
     * const comment = await prisma.comment.upsert({
     *   create: {
     *     // ... data to create a Comment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Comment we want to update
     *   }
     * })
     */
    upsert<T extends CommentUpsertArgs>(args: SelectSubset<T, CommentUpsertArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentCountArgs} args - Arguments to filter Comments to count.
     * @example
     * // Count the number of Comments
     * const count = await prisma.comment.count({
     *   where: {
     *     // ... the filter for the Comments we want to count
     *   }
     * })
    **/
    count<T extends CommentCountArgs>(
      args?: Subset<T, CommentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CommentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommentAggregateArgs>(args: Subset<T, CommentAggregateArgs>): Prisma.PrismaPromise<GetCommentAggregateType<T>>

    /**
     * Group by Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CommentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CommentGroupByArgs['orderBy'] }
        : { orderBy?: CommentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CommentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Comment model
   */
  readonly fields: CommentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Comment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CommentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    snapshot<T extends SnapshotDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SnapshotDefaultArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    author<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    parent<T extends Comment$parentArgs<ExtArgs> = {}>(args?: Subset<T, Comment$parentArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    replies<T extends Comment$repliesArgs<ExtArgs> = {}>(args?: Subset<T, Comment$repliesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany"> | Null>
    timelineEvents<T extends Comment$timelineEventsArgs<ExtArgs> = {}>(args?: Subset<T, Comment$timelineEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Comment model
   */ 
  interface CommentFieldRefs {
    readonly id: FieldRef<"Comment", 'String'>
    readonly snapshotId: FieldRef<"Comment", 'String'>
    readonly authorId: FieldRef<"Comment", 'String'>
    readonly content: FieldRef<"Comment", 'String'>
    readonly anchorType: FieldRef<"Comment", 'CommentAnchorType'>
    readonly commitSha: FieldRef<"Comment", 'String'>
    readonly filePath: FieldRef<"Comment", 'String'>
    readonly lineStart: FieldRef<"Comment", 'Int'>
    readonly lineEnd: FieldRef<"Comment", 'Int'>
    readonly status: FieldRef<"Comment", 'CommentStatus'>
    readonly parentId: FieldRef<"Comment", 'String'>
    readonly isResolved: FieldRef<"Comment", 'Boolean'>
    readonly resolvedAt: FieldRef<"Comment", 'DateTime'>
    readonly resolvedBy: FieldRef<"Comment", 'String'>
    readonly createdAt: FieldRef<"Comment", 'DateTime'>
    readonly updatedAt: FieldRef<"Comment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Comment findUnique
   */
  export type CommentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findUniqueOrThrow
   */
  export type CommentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findFirst
   */
  export type CommentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findFirstOrThrow
   */
  export type CommentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findMany
   */
  export type CommentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comments to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment create
   */
  export type CommentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to create a Comment.
     */
    data: XOR<CommentCreateInput, CommentUncheckedCreateInput>
  }

  /**
   * Comment createMany
   */
  export type CommentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Comment createManyAndReturn
   */
  export type CommentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Comment update
   */
  export type CommentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to update a Comment.
     */
    data: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
    /**
     * Choose, which Comment to update.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment updateMany
   */
  export type CommentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
  }

  /**
   * Comment upsert
   */
  export type CommentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The filter to search for the Comment to update in case it exists.
     */
    where: CommentWhereUniqueInput
    /**
     * In case the Comment found by the `where` argument doesn't exist, create a new Comment with this data.
     */
    create: XOR<CommentCreateInput, CommentUncheckedCreateInput>
    /**
     * In case the Comment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
  }

  /**
   * Comment delete
   */
  export type CommentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter which Comment to delete.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment deleteMany
   */
  export type CommentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comments to delete
     */
    where?: CommentWhereInput
  }

  /**
   * Comment.parent
   */
  export type Comment$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
  }

  /**
   * Comment.replies
   */
  export type Comment$repliesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment.timelineEvents
   */
  export type Comment$timelineEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    where?: TimelineEventWhereInput
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    cursor?: TimelineEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * Comment without action
   */
  export type CommentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
  }


  /**
   * Model TimelineEvent
   */

  export type AggregateTimelineEvent = {
    _count: TimelineEventCountAggregateOutputType | null
    _min: TimelineEventMinAggregateOutputType | null
    _max: TimelineEventMaxAggregateOutputType | null
  }

  export type TimelineEventMinAggregateOutputType = {
    id: string | null
    repoId: string | null
    type: $Enums.TimelineEventType | null
    actorId: string | null
    snapshotId: string | null
    commentId: string | null
    createdAt: Date | null
  }

  export type TimelineEventMaxAggregateOutputType = {
    id: string | null
    repoId: string | null
    type: $Enums.TimelineEventType | null
    actorId: string | null
    snapshotId: string | null
    commentId: string | null
    createdAt: Date | null
  }

  export type TimelineEventCountAggregateOutputType = {
    id: number
    repoId: number
    type: number
    actorId: number
    snapshotId: number
    commentId: number
    payload: number
    createdAt: number
    _all: number
  }


  export type TimelineEventMinAggregateInputType = {
    id?: true
    repoId?: true
    type?: true
    actorId?: true
    snapshotId?: true
    commentId?: true
    createdAt?: true
  }

  export type TimelineEventMaxAggregateInputType = {
    id?: true
    repoId?: true
    type?: true
    actorId?: true
    snapshotId?: true
    commentId?: true
    createdAt?: true
  }

  export type TimelineEventCountAggregateInputType = {
    id?: true
    repoId?: true
    type?: true
    actorId?: true
    snapshotId?: true
    commentId?: true
    payload?: true
    createdAt?: true
    _all?: true
  }

  export type TimelineEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TimelineEvent to aggregate.
     */
    where?: TimelineEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimelineEvents to fetch.
     */
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TimelineEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimelineEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimelineEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TimelineEvents
    **/
    _count?: true | TimelineEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TimelineEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TimelineEventMaxAggregateInputType
  }

  export type GetTimelineEventAggregateType<T extends TimelineEventAggregateArgs> = {
        [P in keyof T & keyof AggregateTimelineEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTimelineEvent[P]>
      : GetScalarType<T[P], AggregateTimelineEvent[P]>
  }




  export type TimelineEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimelineEventWhereInput
    orderBy?: TimelineEventOrderByWithAggregationInput | TimelineEventOrderByWithAggregationInput[]
    by: TimelineEventScalarFieldEnum[] | TimelineEventScalarFieldEnum
    having?: TimelineEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TimelineEventCountAggregateInputType | true
    _min?: TimelineEventMinAggregateInputType
    _max?: TimelineEventMaxAggregateInputType
  }

  export type TimelineEventGroupByOutputType = {
    id: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId: string | null
    commentId: string | null
    payload: JsonValue
    createdAt: Date
    _count: TimelineEventCountAggregateOutputType | null
    _min: TimelineEventMinAggregateOutputType | null
    _max: TimelineEventMaxAggregateOutputType | null
  }

  type GetTimelineEventGroupByPayload<T extends TimelineEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TimelineEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TimelineEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TimelineEventGroupByOutputType[P]>
            : GetScalarType<T[P], TimelineEventGroupByOutputType[P]>
        }
      >
    >


  export type TimelineEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repoId?: boolean
    type?: boolean
    actorId?: boolean
    snapshotId?: boolean
    commentId?: boolean
    payload?: boolean
    createdAt?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    actor?: boolean | UserDefaultArgs<ExtArgs>
    snapshot?: boolean | TimelineEvent$snapshotArgs<ExtArgs>
    comment?: boolean | TimelineEvent$commentArgs<ExtArgs>
  }, ExtArgs["result"]["timelineEvent"]>

  export type TimelineEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repoId?: boolean
    type?: boolean
    actorId?: boolean
    snapshotId?: boolean
    commentId?: boolean
    payload?: boolean
    createdAt?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    actor?: boolean | UserDefaultArgs<ExtArgs>
    snapshot?: boolean | TimelineEvent$snapshotArgs<ExtArgs>
    comment?: boolean | TimelineEvent$commentArgs<ExtArgs>
  }, ExtArgs["result"]["timelineEvent"]>

  export type TimelineEventSelectScalar = {
    id?: boolean
    repoId?: boolean
    type?: boolean
    actorId?: boolean
    snapshotId?: boolean
    commentId?: boolean
    payload?: boolean
    createdAt?: boolean
  }

  export type TimelineEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    actor?: boolean | UserDefaultArgs<ExtArgs>
    snapshot?: boolean | TimelineEvent$snapshotArgs<ExtArgs>
    comment?: boolean | TimelineEvent$commentArgs<ExtArgs>
  }
  export type TimelineEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    actor?: boolean | UserDefaultArgs<ExtArgs>
    snapshot?: boolean | TimelineEvent$snapshotArgs<ExtArgs>
    comment?: boolean | TimelineEvent$commentArgs<ExtArgs>
  }

  export type $TimelineEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TimelineEvent"
    objects: {
      repository: Prisma.$RepositoryPayload<ExtArgs>
      actor: Prisma.$UserPayload<ExtArgs>
      snapshot: Prisma.$SnapshotPayload<ExtArgs> | null
      comment: Prisma.$CommentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      repoId: string
      type: $Enums.TimelineEventType
      actorId: string
      snapshotId: string | null
      commentId: string | null
      payload: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["timelineEvent"]>
    composites: {}
  }

  type TimelineEventGetPayload<S extends boolean | null | undefined | TimelineEventDefaultArgs> = $Result.GetResult<Prisma.$TimelineEventPayload, S>

  type TimelineEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TimelineEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TimelineEventCountAggregateInputType | true
    }

  export interface TimelineEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TimelineEvent'], meta: { name: 'TimelineEvent' } }
    /**
     * Find zero or one TimelineEvent that matches the filter.
     * @param {TimelineEventFindUniqueArgs} args - Arguments to find a TimelineEvent
     * @example
     * // Get one TimelineEvent
     * const timelineEvent = await prisma.timelineEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TimelineEventFindUniqueArgs>(args: SelectSubset<T, TimelineEventFindUniqueArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TimelineEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TimelineEventFindUniqueOrThrowArgs} args - Arguments to find a TimelineEvent
     * @example
     * // Get one TimelineEvent
     * const timelineEvent = await prisma.timelineEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TimelineEventFindUniqueOrThrowArgs>(args: SelectSubset<T, TimelineEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TimelineEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventFindFirstArgs} args - Arguments to find a TimelineEvent
     * @example
     * // Get one TimelineEvent
     * const timelineEvent = await prisma.timelineEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TimelineEventFindFirstArgs>(args?: SelectSubset<T, TimelineEventFindFirstArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TimelineEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventFindFirstOrThrowArgs} args - Arguments to find a TimelineEvent
     * @example
     * // Get one TimelineEvent
     * const timelineEvent = await prisma.timelineEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TimelineEventFindFirstOrThrowArgs>(args?: SelectSubset<T, TimelineEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TimelineEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TimelineEvents
     * const timelineEvents = await prisma.timelineEvent.findMany()
     * 
     * // Get first 10 TimelineEvents
     * const timelineEvents = await prisma.timelineEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const timelineEventWithIdOnly = await prisma.timelineEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TimelineEventFindManyArgs>(args?: SelectSubset<T, TimelineEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TimelineEvent.
     * @param {TimelineEventCreateArgs} args - Arguments to create a TimelineEvent.
     * @example
     * // Create one TimelineEvent
     * const TimelineEvent = await prisma.timelineEvent.create({
     *   data: {
     *     // ... data to create a TimelineEvent
     *   }
     * })
     * 
     */
    create<T extends TimelineEventCreateArgs>(args: SelectSubset<T, TimelineEventCreateArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TimelineEvents.
     * @param {TimelineEventCreateManyArgs} args - Arguments to create many TimelineEvents.
     * @example
     * // Create many TimelineEvents
     * const timelineEvent = await prisma.timelineEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TimelineEventCreateManyArgs>(args?: SelectSubset<T, TimelineEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TimelineEvents and returns the data saved in the database.
     * @param {TimelineEventCreateManyAndReturnArgs} args - Arguments to create many TimelineEvents.
     * @example
     * // Create many TimelineEvents
     * const timelineEvent = await prisma.timelineEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TimelineEvents and only return the `id`
     * const timelineEventWithIdOnly = await prisma.timelineEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TimelineEventCreateManyAndReturnArgs>(args?: SelectSubset<T, TimelineEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TimelineEvent.
     * @param {TimelineEventDeleteArgs} args - Arguments to delete one TimelineEvent.
     * @example
     * // Delete one TimelineEvent
     * const TimelineEvent = await prisma.timelineEvent.delete({
     *   where: {
     *     // ... filter to delete one TimelineEvent
     *   }
     * })
     * 
     */
    delete<T extends TimelineEventDeleteArgs>(args: SelectSubset<T, TimelineEventDeleteArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TimelineEvent.
     * @param {TimelineEventUpdateArgs} args - Arguments to update one TimelineEvent.
     * @example
     * // Update one TimelineEvent
     * const timelineEvent = await prisma.timelineEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TimelineEventUpdateArgs>(args: SelectSubset<T, TimelineEventUpdateArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TimelineEvents.
     * @param {TimelineEventDeleteManyArgs} args - Arguments to filter TimelineEvents to delete.
     * @example
     * // Delete a few TimelineEvents
     * const { count } = await prisma.timelineEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TimelineEventDeleteManyArgs>(args?: SelectSubset<T, TimelineEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TimelineEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TimelineEvents
     * const timelineEvent = await prisma.timelineEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TimelineEventUpdateManyArgs>(args: SelectSubset<T, TimelineEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TimelineEvent.
     * @param {TimelineEventUpsertArgs} args - Arguments to update or create a TimelineEvent.
     * @example
     * // Update or create a TimelineEvent
     * const timelineEvent = await prisma.timelineEvent.upsert({
     *   create: {
     *     // ... data to create a TimelineEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TimelineEvent we want to update
     *   }
     * })
     */
    upsert<T extends TimelineEventUpsertArgs>(args: SelectSubset<T, TimelineEventUpsertArgs<ExtArgs>>): Prisma__TimelineEventClient<$Result.GetResult<Prisma.$TimelineEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TimelineEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventCountArgs} args - Arguments to filter TimelineEvents to count.
     * @example
     * // Count the number of TimelineEvents
     * const count = await prisma.timelineEvent.count({
     *   where: {
     *     // ... the filter for the TimelineEvents we want to count
     *   }
     * })
    **/
    count<T extends TimelineEventCountArgs>(
      args?: Subset<T, TimelineEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TimelineEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TimelineEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TimelineEventAggregateArgs>(args: Subset<T, TimelineEventAggregateArgs>): Prisma.PrismaPromise<GetTimelineEventAggregateType<T>>

    /**
     * Group by TimelineEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TimelineEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TimelineEventGroupByArgs['orderBy'] }
        : { orderBy?: TimelineEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TimelineEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTimelineEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TimelineEvent model
   */
  readonly fields: TimelineEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TimelineEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TimelineEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    actor<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    snapshot<T extends TimelineEvent$snapshotArgs<ExtArgs> = {}>(args?: Subset<T, TimelineEvent$snapshotArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    comment<T extends TimelineEvent$commentArgs<ExtArgs> = {}>(args?: Subset<T, TimelineEvent$commentArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TimelineEvent model
   */ 
  interface TimelineEventFieldRefs {
    readonly id: FieldRef<"TimelineEvent", 'String'>
    readonly repoId: FieldRef<"TimelineEvent", 'String'>
    readonly type: FieldRef<"TimelineEvent", 'TimelineEventType'>
    readonly actorId: FieldRef<"TimelineEvent", 'String'>
    readonly snapshotId: FieldRef<"TimelineEvent", 'String'>
    readonly commentId: FieldRef<"TimelineEvent", 'String'>
    readonly payload: FieldRef<"TimelineEvent", 'Json'>
    readonly createdAt: FieldRef<"TimelineEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TimelineEvent findUnique
   */
  export type TimelineEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * Filter, which TimelineEvent to fetch.
     */
    where: TimelineEventWhereUniqueInput
  }

  /**
   * TimelineEvent findUniqueOrThrow
   */
  export type TimelineEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * Filter, which TimelineEvent to fetch.
     */
    where: TimelineEventWhereUniqueInput
  }

  /**
   * TimelineEvent findFirst
   */
  export type TimelineEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * Filter, which TimelineEvent to fetch.
     */
    where?: TimelineEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimelineEvents to fetch.
     */
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TimelineEvents.
     */
    cursor?: TimelineEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimelineEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimelineEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TimelineEvents.
     */
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * TimelineEvent findFirstOrThrow
   */
  export type TimelineEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * Filter, which TimelineEvent to fetch.
     */
    where?: TimelineEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimelineEvents to fetch.
     */
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TimelineEvents.
     */
    cursor?: TimelineEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimelineEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimelineEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TimelineEvents.
     */
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * TimelineEvent findMany
   */
  export type TimelineEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * Filter, which TimelineEvents to fetch.
     */
    where?: TimelineEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimelineEvents to fetch.
     */
    orderBy?: TimelineEventOrderByWithRelationInput | TimelineEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TimelineEvents.
     */
    cursor?: TimelineEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimelineEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimelineEvents.
     */
    skip?: number
    distinct?: TimelineEventScalarFieldEnum | TimelineEventScalarFieldEnum[]
  }

  /**
   * TimelineEvent create
   */
  export type TimelineEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * The data needed to create a TimelineEvent.
     */
    data: XOR<TimelineEventCreateInput, TimelineEventUncheckedCreateInput>
  }

  /**
   * TimelineEvent createMany
   */
  export type TimelineEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TimelineEvents.
     */
    data: TimelineEventCreateManyInput | TimelineEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TimelineEvent createManyAndReturn
   */
  export type TimelineEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TimelineEvents.
     */
    data: TimelineEventCreateManyInput | TimelineEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TimelineEvent update
   */
  export type TimelineEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * The data needed to update a TimelineEvent.
     */
    data: XOR<TimelineEventUpdateInput, TimelineEventUncheckedUpdateInput>
    /**
     * Choose, which TimelineEvent to update.
     */
    where: TimelineEventWhereUniqueInput
  }

  /**
   * TimelineEvent updateMany
   */
  export type TimelineEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TimelineEvents.
     */
    data: XOR<TimelineEventUpdateManyMutationInput, TimelineEventUncheckedUpdateManyInput>
    /**
     * Filter which TimelineEvents to update
     */
    where?: TimelineEventWhereInput
  }

  /**
   * TimelineEvent upsert
   */
  export type TimelineEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * The filter to search for the TimelineEvent to update in case it exists.
     */
    where: TimelineEventWhereUniqueInput
    /**
     * In case the TimelineEvent found by the `where` argument doesn't exist, create a new TimelineEvent with this data.
     */
    create: XOR<TimelineEventCreateInput, TimelineEventUncheckedCreateInput>
    /**
     * In case the TimelineEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TimelineEventUpdateInput, TimelineEventUncheckedUpdateInput>
  }

  /**
   * TimelineEvent delete
   */
  export type TimelineEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
    /**
     * Filter which TimelineEvent to delete.
     */
    where: TimelineEventWhereUniqueInput
  }

  /**
   * TimelineEvent deleteMany
   */
  export type TimelineEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TimelineEvents to delete
     */
    where?: TimelineEventWhereInput
  }

  /**
   * TimelineEvent.snapshot
   */
  export type TimelineEvent$snapshotArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    where?: SnapshotWhereInput
  }

  /**
   * TimelineEvent.comment
   */
  export type TimelineEvent$commentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
  }

  /**
   * TimelineEvent without action
   */
  export type TimelineEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimelineEvent
     */
    select?: TimelineEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineEventInclude<ExtArgs> | null
  }


  /**
   * Model Diff
   */

  export type AggregateDiff = {
    _count: DiffCountAggregateOutputType | null
    _avg: DiffAvgAggregateOutputType | null
    _sum: DiffSumAggregateOutputType | null
    _min: DiffMinAggregateOutputType | null
    _max: DiffMaxAggregateOutputType | null
  }

  export type DiffAvgAggregateOutputType = {
    filesCount: number | null
    additionsCount: number | null
    deletionsCount: number | null
  }

  export type DiffSumAggregateOutputType = {
    filesCount: number | null
    additionsCount: number | null
    deletionsCount: number | null
  }

  export type DiffMinAggregateOutputType = {
    id: string | null
    type: $Enums.DiffType | null
    sourceId: string | null
    targetId: string | null
    repositoryId: string | null
    ownerId: string | null
    status: $Enums.DiffStatus | null
    filesCount: number | null
    additionsCount: number | null
    deletionsCount: number | null
    contentHash: string | null
    title: string | null
    description: string | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DiffMaxAggregateOutputType = {
    id: string | null
    type: $Enums.DiffType | null
    sourceId: string | null
    targetId: string | null
    repositoryId: string | null
    ownerId: string | null
    status: $Enums.DiffStatus | null
    filesCount: number | null
    additionsCount: number | null
    deletionsCount: number | null
    contentHash: string | null
    title: string | null
    description: string | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DiffCountAggregateOutputType = {
    id: number
    type: number
    sourceId: number
    targetId: number
    repositoryId: number
    ownerId: number
    status: number
    filesCount: number
    additionsCount: number
    deletionsCount: number
    contentHash: number
    title: number
    description: number
    errorMessage: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DiffAvgAggregateInputType = {
    filesCount?: true
    additionsCount?: true
    deletionsCount?: true
  }

  export type DiffSumAggregateInputType = {
    filesCount?: true
    additionsCount?: true
    deletionsCount?: true
  }

  export type DiffMinAggregateInputType = {
    id?: true
    type?: true
    sourceId?: true
    targetId?: true
    repositoryId?: true
    ownerId?: true
    status?: true
    filesCount?: true
    additionsCount?: true
    deletionsCount?: true
    contentHash?: true
    title?: true
    description?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DiffMaxAggregateInputType = {
    id?: true
    type?: true
    sourceId?: true
    targetId?: true
    repositoryId?: true
    ownerId?: true
    status?: true
    filesCount?: true
    additionsCount?: true
    deletionsCount?: true
    contentHash?: true
    title?: true
    description?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DiffCountAggregateInputType = {
    id?: true
    type?: true
    sourceId?: true
    targetId?: true
    repositoryId?: true
    ownerId?: true
    status?: true
    filesCount?: true
    additionsCount?: true
    deletionsCount?: true
    contentHash?: true
    title?: true
    description?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DiffAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Diff to aggregate.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Diffs
    **/
    _count?: true | DiffCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DiffAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DiffSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DiffMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DiffMaxAggregateInputType
  }

  export type GetDiffAggregateType<T extends DiffAggregateArgs> = {
        [P in keyof T & keyof AggregateDiff]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiff[P]>
      : GetScalarType<T[P], AggregateDiff[P]>
  }




  export type DiffGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiffWhereInput
    orderBy?: DiffOrderByWithAggregationInput | DiffOrderByWithAggregationInput[]
    by: DiffScalarFieldEnum[] | DiffScalarFieldEnum
    having?: DiffScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DiffCountAggregateInputType | true
    _avg?: DiffAvgAggregateInputType
    _sum?: DiffSumAggregateInputType
    _min?: DiffMinAggregateInputType
    _max?: DiffMaxAggregateInputType
  }

  export type DiffGroupByOutputType = {
    id: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    repositoryId: string
    ownerId: string
    status: $Enums.DiffStatus
    filesCount: number
    additionsCount: number
    deletionsCount: number
    contentHash: string | null
    title: string | null
    description: string | null
    errorMessage: string | null
    createdAt: Date
    updatedAt: Date
    _count: DiffCountAggregateOutputType | null
    _avg: DiffAvgAggregateOutputType | null
    _sum: DiffSumAggregateOutputType | null
    _min: DiffMinAggregateOutputType | null
    _max: DiffMaxAggregateOutputType | null
  }

  type GetDiffGroupByPayload<T extends DiffGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DiffGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DiffGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DiffGroupByOutputType[P]>
            : GetScalarType<T[P], DiffGroupByOutputType[P]>
        }
      >
    >


  export type DiffSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    sourceId?: boolean
    targetId?: boolean
    repositoryId?: boolean
    ownerId?: boolean
    status?: boolean
    filesCount?: boolean
    additionsCount?: boolean
    deletionsCount?: boolean
    contentHash?: boolean
    title?: boolean
    description?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
    files?: boolean | Diff$filesArgs<ExtArgs>
    _count?: boolean | DiffCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diff"]>

  export type DiffSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    sourceId?: boolean
    targetId?: boolean
    repositoryId?: boolean
    ownerId?: boolean
    status?: boolean
    filesCount?: boolean
    additionsCount?: boolean
    deletionsCount?: boolean
    contentHash?: boolean
    title?: boolean
    description?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diff"]>

  export type DiffSelectScalar = {
    id?: boolean
    type?: boolean
    sourceId?: boolean
    targetId?: boolean
    repositoryId?: boolean
    ownerId?: boolean
    status?: boolean
    filesCount?: boolean
    additionsCount?: boolean
    deletionsCount?: boolean
    contentHash?: boolean
    title?: boolean
    description?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DiffInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
    files?: boolean | Diff$filesArgs<ExtArgs>
    _count?: boolean | DiffCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DiffIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DiffPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Diff"
    objects: {
      repository: Prisma.$RepositoryPayload<ExtArgs>
      owner: Prisma.$UserPayload<ExtArgs>
      files: Prisma.$DiffFilePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.DiffType
      sourceId: string
      targetId: string
      repositoryId: string
      ownerId: string
      status: $Enums.DiffStatus
      filesCount: number
      additionsCount: number
      deletionsCount: number
      contentHash: string | null
      title: string | null
      description: string | null
      errorMessage: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["diff"]>
    composites: {}
  }

  type DiffGetPayload<S extends boolean | null | undefined | DiffDefaultArgs> = $Result.GetResult<Prisma.$DiffPayload, S>

  type DiffCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DiffFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DiffCountAggregateInputType | true
    }

  export interface DiffDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Diff'], meta: { name: 'Diff' } }
    /**
     * Find zero or one Diff that matches the filter.
     * @param {DiffFindUniqueArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiffFindUniqueArgs>(args: SelectSubset<T, DiffFindUniqueArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Diff that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DiffFindUniqueOrThrowArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiffFindUniqueOrThrowArgs>(args: SelectSubset<T, DiffFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Diff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFindFirstArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiffFindFirstArgs>(args?: SelectSubset<T, DiffFindFirstArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Diff that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFindFirstOrThrowArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiffFindFirstOrThrowArgs>(args?: SelectSubset<T, DiffFindFirstOrThrowArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Diffs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Diffs
     * const diffs = await prisma.diff.findMany()
     * 
     * // Get first 10 Diffs
     * const diffs = await prisma.diff.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const diffWithIdOnly = await prisma.diff.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DiffFindManyArgs>(args?: SelectSubset<T, DiffFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Diff.
     * @param {DiffCreateArgs} args - Arguments to create a Diff.
     * @example
     * // Create one Diff
     * const Diff = await prisma.diff.create({
     *   data: {
     *     // ... data to create a Diff
     *   }
     * })
     * 
     */
    create<T extends DiffCreateArgs>(args: SelectSubset<T, DiffCreateArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Diffs.
     * @param {DiffCreateManyArgs} args - Arguments to create many Diffs.
     * @example
     * // Create many Diffs
     * const diff = await prisma.diff.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DiffCreateManyArgs>(args?: SelectSubset<T, DiffCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Diffs and returns the data saved in the database.
     * @param {DiffCreateManyAndReturnArgs} args - Arguments to create many Diffs.
     * @example
     * // Create many Diffs
     * const diff = await prisma.diff.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Diffs and only return the `id`
     * const diffWithIdOnly = await prisma.diff.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DiffCreateManyAndReturnArgs>(args?: SelectSubset<T, DiffCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Diff.
     * @param {DiffDeleteArgs} args - Arguments to delete one Diff.
     * @example
     * // Delete one Diff
     * const Diff = await prisma.diff.delete({
     *   where: {
     *     // ... filter to delete one Diff
     *   }
     * })
     * 
     */
    delete<T extends DiffDeleteArgs>(args: SelectSubset<T, DiffDeleteArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Diff.
     * @param {DiffUpdateArgs} args - Arguments to update one Diff.
     * @example
     * // Update one Diff
     * const diff = await prisma.diff.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DiffUpdateArgs>(args: SelectSubset<T, DiffUpdateArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Diffs.
     * @param {DiffDeleteManyArgs} args - Arguments to filter Diffs to delete.
     * @example
     * // Delete a few Diffs
     * const { count } = await prisma.diff.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DiffDeleteManyArgs>(args?: SelectSubset<T, DiffDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Diffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Diffs
     * const diff = await prisma.diff.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DiffUpdateManyArgs>(args: SelectSubset<T, DiffUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Diff.
     * @param {DiffUpsertArgs} args - Arguments to update or create a Diff.
     * @example
     * // Update or create a Diff
     * const diff = await prisma.diff.upsert({
     *   create: {
     *     // ... data to create a Diff
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Diff we want to update
     *   }
     * })
     */
    upsert<T extends DiffUpsertArgs>(args: SelectSubset<T, DiffUpsertArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Diffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffCountArgs} args - Arguments to filter Diffs to count.
     * @example
     * // Count the number of Diffs
     * const count = await prisma.diff.count({
     *   where: {
     *     // ... the filter for the Diffs we want to count
     *   }
     * })
    **/
    count<T extends DiffCountArgs>(
      args?: Subset<T, DiffCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DiffCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Diff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DiffAggregateArgs>(args: Subset<T, DiffAggregateArgs>): Prisma.PrismaPromise<GetDiffAggregateType<T>>

    /**
     * Group by Diff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DiffGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DiffGroupByArgs['orderBy'] }
        : { orderBy?: DiffGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DiffGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiffGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Diff model
   */
  readonly fields: DiffFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Diff.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DiffClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    files<T extends Diff$filesArgs<ExtArgs> = {}>(args?: Subset<T, Diff$filesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Diff model
   */ 
  interface DiffFieldRefs {
    readonly id: FieldRef<"Diff", 'String'>
    readonly type: FieldRef<"Diff", 'DiffType'>
    readonly sourceId: FieldRef<"Diff", 'String'>
    readonly targetId: FieldRef<"Diff", 'String'>
    readonly repositoryId: FieldRef<"Diff", 'String'>
    readonly ownerId: FieldRef<"Diff", 'String'>
    readonly status: FieldRef<"Diff", 'DiffStatus'>
    readonly filesCount: FieldRef<"Diff", 'Int'>
    readonly additionsCount: FieldRef<"Diff", 'Int'>
    readonly deletionsCount: FieldRef<"Diff", 'Int'>
    readonly contentHash: FieldRef<"Diff", 'String'>
    readonly title: FieldRef<"Diff", 'String'>
    readonly description: FieldRef<"Diff", 'String'>
    readonly errorMessage: FieldRef<"Diff", 'String'>
    readonly createdAt: FieldRef<"Diff", 'DateTime'>
    readonly updatedAt: FieldRef<"Diff", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Diff findUnique
   */
  export type DiffFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff findUniqueOrThrow
   */
  export type DiffFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff findFirst
   */
  export type DiffFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Diffs.
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Diffs.
     */
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Diff findFirstOrThrow
   */
  export type DiffFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Diffs.
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Diffs.
     */
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Diff findMany
   */
  export type DiffFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * Filter, which Diffs to fetch.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Diffs.
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Diff create
   */
  export type DiffCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * The data needed to create a Diff.
     */
    data: XOR<DiffCreateInput, DiffUncheckedCreateInput>
  }

  /**
   * Diff createMany
   */
  export type DiffCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Diffs.
     */
    data: DiffCreateManyInput | DiffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Diff createManyAndReturn
   */
  export type DiffCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Diffs.
     */
    data: DiffCreateManyInput | DiffCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Diff update
   */
  export type DiffUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * The data needed to update a Diff.
     */
    data: XOR<DiffUpdateInput, DiffUncheckedUpdateInput>
    /**
     * Choose, which Diff to update.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff updateMany
   */
  export type DiffUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Diffs.
     */
    data: XOR<DiffUpdateManyMutationInput, DiffUncheckedUpdateManyInput>
    /**
     * Filter which Diffs to update
     */
    where?: DiffWhereInput
  }

  /**
   * Diff upsert
   */
  export type DiffUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * The filter to search for the Diff to update in case it exists.
     */
    where: DiffWhereUniqueInput
    /**
     * In case the Diff found by the `where` argument doesn't exist, create a new Diff with this data.
     */
    create: XOR<DiffCreateInput, DiffUncheckedCreateInput>
    /**
     * In case the Diff was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DiffUpdateInput, DiffUncheckedUpdateInput>
  }

  /**
   * Diff delete
   */
  export type DiffDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
    /**
     * Filter which Diff to delete.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff deleteMany
   */
  export type DiffDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Diffs to delete
     */
    where?: DiffWhereInput
  }

  /**
   * Diff.files
   */
  export type Diff$filesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    where?: DiffFileWhereInput
    orderBy?: DiffFileOrderByWithRelationInput | DiffFileOrderByWithRelationInput[]
    cursor?: DiffFileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DiffFileScalarFieldEnum | DiffFileScalarFieldEnum[]
  }

  /**
   * Diff without action
   */
  export type DiffDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffInclude<ExtArgs> | null
  }


  /**
   * Model DiffFile
   */

  export type AggregateDiffFile = {
    _count: DiffFileCountAggregateOutputType | null
    _avg: DiffFileAvgAggregateOutputType | null
    _sum: DiffFileSumAggregateOutputType | null
    _min: DiffFileMinAggregateOutputType | null
    _max: DiffFileMaxAggregateOutputType | null
  }

  export type DiffFileAvgAggregateOutputType = {
    additions: number | null
    deletions: number | null
    contentSize: number | null
  }

  export type DiffFileSumAggregateOutputType = {
    additions: number | null
    deletions: number | null
    contentSize: number | null
  }

  export type DiffFileMinAggregateOutputType = {
    id: string | null
    diffId: string | null
    filePath: string | null
    changeType: $Enums.FileChangeType | null
    additions: number | null
    deletions: number | null
    contentSize: number | null
    oldFilePath: string | null
    isBinary: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DiffFileMaxAggregateOutputType = {
    id: string | null
    diffId: string | null
    filePath: string | null
    changeType: $Enums.FileChangeType | null
    additions: number | null
    deletions: number | null
    contentSize: number | null
    oldFilePath: string | null
    isBinary: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DiffFileCountAggregateOutputType = {
    id: number
    diffId: number
    filePath: number
    changeType: number
    additions: number
    deletions: number
    content: number
    contentSize: number
    oldFilePath: number
    isBinary: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DiffFileAvgAggregateInputType = {
    additions?: true
    deletions?: true
    contentSize?: true
  }

  export type DiffFileSumAggregateInputType = {
    additions?: true
    deletions?: true
    contentSize?: true
  }

  export type DiffFileMinAggregateInputType = {
    id?: true
    diffId?: true
    filePath?: true
    changeType?: true
    additions?: true
    deletions?: true
    contentSize?: true
    oldFilePath?: true
    isBinary?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DiffFileMaxAggregateInputType = {
    id?: true
    diffId?: true
    filePath?: true
    changeType?: true
    additions?: true
    deletions?: true
    contentSize?: true
    oldFilePath?: true
    isBinary?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DiffFileCountAggregateInputType = {
    id?: true
    diffId?: true
    filePath?: true
    changeType?: true
    additions?: true
    deletions?: true
    content?: true
    contentSize?: true
    oldFilePath?: true
    isBinary?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DiffFileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DiffFile to aggregate.
     */
    where?: DiffFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiffFiles to fetch.
     */
    orderBy?: DiffFileOrderByWithRelationInput | DiffFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DiffFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiffFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiffFiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DiffFiles
    **/
    _count?: true | DiffFileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DiffFileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DiffFileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DiffFileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DiffFileMaxAggregateInputType
  }

  export type GetDiffFileAggregateType<T extends DiffFileAggregateArgs> = {
        [P in keyof T & keyof AggregateDiffFile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiffFile[P]>
      : GetScalarType<T[P], AggregateDiffFile[P]>
  }




  export type DiffFileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiffFileWhereInput
    orderBy?: DiffFileOrderByWithAggregationInput | DiffFileOrderByWithAggregationInput[]
    by: DiffFileScalarFieldEnum[] | DiffFileScalarFieldEnum
    having?: DiffFileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DiffFileCountAggregateInputType | true
    _avg?: DiffFileAvgAggregateInputType
    _sum?: DiffFileSumAggregateInputType
    _min?: DiffFileMinAggregateInputType
    _max?: DiffFileMaxAggregateInputType
  }

  export type DiffFileGroupByOutputType = {
    id: string
    diffId: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions: number
    deletions: number
    content: JsonValue | null
    contentSize: number
    oldFilePath: string | null
    isBinary: boolean
    createdAt: Date
    updatedAt: Date
    _count: DiffFileCountAggregateOutputType | null
    _avg: DiffFileAvgAggregateOutputType | null
    _sum: DiffFileSumAggregateOutputType | null
    _min: DiffFileMinAggregateOutputType | null
    _max: DiffFileMaxAggregateOutputType | null
  }

  type GetDiffFileGroupByPayload<T extends DiffFileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DiffFileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DiffFileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DiffFileGroupByOutputType[P]>
            : GetScalarType<T[P], DiffFileGroupByOutputType[P]>
        }
      >
    >


  export type DiffFileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    diffId?: boolean
    filePath?: boolean
    changeType?: boolean
    additions?: boolean
    deletions?: boolean
    content?: boolean
    contentSize?: boolean
    oldFilePath?: boolean
    isBinary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    diff?: boolean | DiffDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diffFile"]>

  export type DiffFileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    diffId?: boolean
    filePath?: boolean
    changeType?: boolean
    additions?: boolean
    deletions?: boolean
    content?: boolean
    contentSize?: boolean
    oldFilePath?: boolean
    isBinary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    diff?: boolean | DiffDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diffFile"]>

  export type DiffFileSelectScalar = {
    id?: boolean
    diffId?: boolean
    filePath?: boolean
    changeType?: boolean
    additions?: boolean
    deletions?: boolean
    content?: boolean
    contentSize?: boolean
    oldFilePath?: boolean
    isBinary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DiffFileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    diff?: boolean | DiffDefaultArgs<ExtArgs>
  }
  export type DiffFileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    diff?: boolean | DiffDefaultArgs<ExtArgs>
  }

  export type $DiffFilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DiffFile"
    objects: {
      diff: Prisma.$DiffPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      diffId: string
      filePath: string
      changeType: $Enums.FileChangeType
      additions: number
      deletions: number
      content: Prisma.JsonValue | null
      contentSize: number
      oldFilePath: string | null
      isBinary: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["diffFile"]>
    composites: {}
  }

  type DiffFileGetPayload<S extends boolean | null | undefined | DiffFileDefaultArgs> = $Result.GetResult<Prisma.$DiffFilePayload, S>

  type DiffFileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DiffFileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DiffFileCountAggregateInputType | true
    }

  export interface DiffFileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DiffFile'], meta: { name: 'DiffFile' } }
    /**
     * Find zero or one DiffFile that matches the filter.
     * @param {DiffFileFindUniqueArgs} args - Arguments to find a DiffFile
     * @example
     * // Get one DiffFile
     * const diffFile = await prisma.diffFile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiffFileFindUniqueArgs>(args: SelectSubset<T, DiffFileFindUniqueArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DiffFile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DiffFileFindUniqueOrThrowArgs} args - Arguments to find a DiffFile
     * @example
     * // Get one DiffFile
     * const diffFile = await prisma.diffFile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiffFileFindUniqueOrThrowArgs>(args: SelectSubset<T, DiffFileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DiffFile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileFindFirstArgs} args - Arguments to find a DiffFile
     * @example
     * // Get one DiffFile
     * const diffFile = await prisma.diffFile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiffFileFindFirstArgs>(args?: SelectSubset<T, DiffFileFindFirstArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DiffFile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileFindFirstOrThrowArgs} args - Arguments to find a DiffFile
     * @example
     * // Get one DiffFile
     * const diffFile = await prisma.diffFile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiffFileFindFirstOrThrowArgs>(args?: SelectSubset<T, DiffFileFindFirstOrThrowArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DiffFiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DiffFiles
     * const diffFiles = await prisma.diffFile.findMany()
     * 
     * // Get first 10 DiffFiles
     * const diffFiles = await prisma.diffFile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const diffFileWithIdOnly = await prisma.diffFile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DiffFileFindManyArgs>(args?: SelectSubset<T, DiffFileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DiffFile.
     * @param {DiffFileCreateArgs} args - Arguments to create a DiffFile.
     * @example
     * // Create one DiffFile
     * const DiffFile = await prisma.diffFile.create({
     *   data: {
     *     // ... data to create a DiffFile
     *   }
     * })
     * 
     */
    create<T extends DiffFileCreateArgs>(args: SelectSubset<T, DiffFileCreateArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DiffFiles.
     * @param {DiffFileCreateManyArgs} args - Arguments to create many DiffFiles.
     * @example
     * // Create many DiffFiles
     * const diffFile = await prisma.diffFile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DiffFileCreateManyArgs>(args?: SelectSubset<T, DiffFileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DiffFiles and returns the data saved in the database.
     * @param {DiffFileCreateManyAndReturnArgs} args - Arguments to create many DiffFiles.
     * @example
     * // Create many DiffFiles
     * const diffFile = await prisma.diffFile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DiffFiles and only return the `id`
     * const diffFileWithIdOnly = await prisma.diffFile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DiffFileCreateManyAndReturnArgs>(args?: SelectSubset<T, DiffFileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DiffFile.
     * @param {DiffFileDeleteArgs} args - Arguments to delete one DiffFile.
     * @example
     * // Delete one DiffFile
     * const DiffFile = await prisma.diffFile.delete({
     *   where: {
     *     // ... filter to delete one DiffFile
     *   }
     * })
     * 
     */
    delete<T extends DiffFileDeleteArgs>(args: SelectSubset<T, DiffFileDeleteArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DiffFile.
     * @param {DiffFileUpdateArgs} args - Arguments to update one DiffFile.
     * @example
     * // Update one DiffFile
     * const diffFile = await prisma.diffFile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DiffFileUpdateArgs>(args: SelectSubset<T, DiffFileUpdateArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DiffFiles.
     * @param {DiffFileDeleteManyArgs} args - Arguments to filter DiffFiles to delete.
     * @example
     * // Delete a few DiffFiles
     * const { count } = await prisma.diffFile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DiffFileDeleteManyArgs>(args?: SelectSubset<T, DiffFileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DiffFiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DiffFiles
     * const diffFile = await prisma.diffFile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DiffFileUpdateManyArgs>(args: SelectSubset<T, DiffFileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DiffFile.
     * @param {DiffFileUpsertArgs} args - Arguments to update or create a DiffFile.
     * @example
     * // Update or create a DiffFile
     * const diffFile = await prisma.diffFile.upsert({
     *   create: {
     *     // ... data to create a DiffFile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DiffFile we want to update
     *   }
     * })
     */
    upsert<T extends DiffFileUpsertArgs>(args: SelectSubset<T, DiffFileUpsertArgs<ExtArgs>>): Prisma__DiffFileClient<$Result.GetResult<Prisma.$DiffFilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DiffFiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileCountArgs} args - Arguments to filter DiffFiles to count.
     * @example
     * // Count the number of DiffFiles
     * const count = await prisma.diffFile.count({
     *   where: {
     *     // ... the filter for the DiffFiles we want to count
     *   }
     * })
    **/
    count<T extends DiffFileCountArgs>(
      args?: Subset<T, DiffFileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DiffFileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DiffFile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DiffFileAggregateArgs>(args: Subset<T, DiffFileAggregateArgs>): Prisma.PrismaPromise<GetDiffFileAggregateType<T>>

    /**
     * Group by DiffFile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DiffFileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DiffFileGroupByArgs['orderBy'] }
        : { orderBy?: DiffFileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DiffFileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiffFileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DiffFile model
   */
  readonly fields: DiffFileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DiffFile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DiffFileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    diff<T extends DiffDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DiffDefaultArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DiffFile model
   */ 
  interface DiffFileFieldRefs {
    readonly id: FieldRef<"DiffFile", 'String'>
    readonly diffId: FieldRef<"DiffFile", 'String'>
    readonly filePath: FieldRef<"DiffFile", 'String'>
    readonly changeType: FieldRef<"DiffFile", 'FileChangeType'>
    readonly additions: FieldRef<"DiffFile", 'Int'>
    readonly deletions: FieldRef<"DiffFile", 'Int'>
    readonly content: FieldRef<"DiffFile", 'Json'>
    readonly contentSize: FieldRef<"DiffFile", 'Int'>
    readonly oldFilePath: FieldRef<"DiffFile", 'String'>
    readonly isBinary: FieldRef<"DiffFile", 'Boolean'>
    readonly createdAt: FieldRef<"DiffFile", 'DateTime'>
    readonly updatedAt: FieldRef<"DiffFile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DiffFile findUnique
   */
  export type DiffFileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * Filter, which DiffFile to fetch.
     */
    where: DiffFileWhereUniqueInput
  }

  /**
   * DiffFile findUniqueOrThrow
   */
  export type DiffFileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * Filter, which DiffFile to fetch.
     */
    where: DiffFileWhereUniqueInput
  }

  /**
   * DiffFile findFirst
   */
  export type DiffFileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * Filter, which DiffFile to fetch.
     */
    where?: DiffFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiffFiles to fetch.
     */
    orderBy?: DiffFileOrderByWithRelationInput | DiffFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DiffFiles.
     */
    cursor?: DiffFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiffFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiffFiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiffFiles.
     */
    distinct?: DiffFileScalarFieldEnum | DiffFileScalarFieldEnum[]
  }

  /**
   * DiffFile findFirstOrThrow
   */
  export type DiffFileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * Filter, which DiffFile to fetch.
     */
    where?: DiffFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiffFiles to fetch.
     */
    orderBy?: DiffFileOrderByWithRelationInput | DiffFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DiffFiles.
     */
    cursor?: DiffFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiffFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiffFiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiffFiles.
     */
    distinct?: DiffFileScalarFieldEnum | DiffFileScalarFieldEnum[]
  }

  /**
   * DiffFile findMany
   */
  export type DiffFileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * Filter, which DiffFiles to fetch.
     */
    where?: DiffFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiffFiles to fetch.
     */
    orderBy?: DiffFileOrderByWithRelationInput | DiffFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DiffFiles.
     */
    cursor?: DiffFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiffFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiffFiles.
     */
    skip?: number
    distinct?: DiffFileScalarFieldEnum | DiffFileScalarFieldEnum[]
  }

  /**
   * DiffFile create
   */
  export type DiffFileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * The data needed to create a DiffFile.
     */
    data: XOR<DiffFileCreateInput, DiffFileUncheckedCreateInput>
  }

  /**
   * DiffFile createMany
   */
  export type DiffFileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DiffFiles.
     */
    data: DiffFileCreateManyInput | DiffFileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DiffFile createManyAndReturn
   */
  export type DiffFileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DiffFiles.
     */
    data: DiffFileCreateManyInput | DiffFileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DiffFile update
   */
  export type DiffFileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * The data needed to update a DiffFile.
     */
    data: XOR<DiffFileUpdateInput, DiffFileUncheckedUpdateInput>
    /**
     * Choose, which DiffFile to update.
     */
    where: DiffFileWhereUniqueInput
  }

  /**
   * DiffFile updateMany
   */
  export type DiffFileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DiffFiles.
     */
    data: XOR<DiffFileUpdateManyMutationInput, DiffFileUncheckedUpdateManyInput>
    /**
     * Filter which DiffFiles to update
     */
    where?: DiffFileWhereInput
  }

  /**
   * DiffFile upsert
   */
  export type DiffFileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * The filter to search for the DiffFile to update in case it exists.
     */
    where: DiffFileWhereUniqueInput
    /**
     * In case the DiffFile found by the `where` argument doesn't exist, create a new DiffFile with this data.
     */
    create: XOR<DiffFileCreateInput, DiffFileUncheckedCreateInput>
    /**
     * In case the DiffFile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DiffFileUpdateInput, DiffFileUncheckedUpdateInput>
  }

  /**
   * DiffFile delete
   */
  export type DiffFileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
    /**
     * Filter which DiffFile to delete.
     */
    where: DiffFileWhereUniqueInput
  }

  /**
   * DiffFile deleteMany
   */
  export type DiffFileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DiffFiles to delete
     */
    where?: DiffFileWhereInput
  }

  /**
   * DiffFile without action
   */
  export type DiffFileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiffFile
     */
    select?: DiffFileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiffFileInclude<ExtArgs> | null
  }


  /**
   * Model SearchHistory
   */

  export type AggregateSearchHistory = {
    _count: SearchHistoryCountAggregateOutputType | null
    _avg: SearchHistoryAvgAggregateOutputType | null
    _sum: SearchHistorySumAggregateOutputType | null
    _min: SearchHistoryMinAggregateOutputType | null
    _max: SearchHistoryMaxAggregateOutputType | null
  }

  export type SearchHistoryAvgAggregateOutputType = {
    resultsCount: number | null
  }

  export type SearchHistorySumAggregateOutputType = {
    resultsCount: number | null
  }

  export type SearchHistoryMinAggregateOutputType = {
    id: string | null
    userId: string | null
    repositoryId: string | null
    snapshotId: string | null
    query: string | null
    searchType: $Enums.SearchType | null
    resultsCount: number | null
    createdAt: Date | null
  }

  export type SearchHistoryMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    repositoryId: string | null
    snapshotId: string | null
    query: string | null
    searchType: $Enums.SearchType | null
    resultsCount: number | null
    createdAt: Date | null
  }

  export type SearchHistoryCountAggregateOutputType = {
    id: number
    userId: number
    repositoryId: number
    snapshotId: number
    query: number
    searchType: number
    resultsCount: number
    createdAt: number
    _all: number
  }


  export type SearchHistoryAvgAggregateInputType = {
    resultsCount?: true
  }

  export type SearchHistorySumAggregateInputType = {
    resultsCount?: true
  }

  export type SearchHistoryMinAggregateInputType = {
    id?: true
    userId?: true
    repositoryId?: true
    snapshotId?: true
    query?: true
    searchType?: true
    resultsCount?: true
    createdAt?: true
  }

  export type SearchHistoryMaxAggregateInputType = {
    id?: true
    userId?: true
    repositoryId?: true
    snapshotId?: true
    query?: true
    searchType?: true
    resultsCount?: true
    createdAt?: true
  }

  export type SearchHistoryCountAggregateInputType = {
    id?: true
    userId?: true
    repositoryId?: true
    snapshotId?: true
    query?: true
    searchType?: true
    resultsCount?: true
    createdAt?: true
    _all?: true
  }

  export type SearchHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SearchHistory to aggregate.
     */
    where?: SearchHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SearchHistories to fetch.
     */
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SearchHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SearchHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SearchHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SearchHistories
    **/
    _count?: true | SearchHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SearchHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SearchHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SearchHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SearchHistoryMaxAggregateInputType
  }

  export type GetSearchHistoryAggregateType<T extends SearchHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateSearchHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSearchHistory[P]>
      : GetScalarType<T[P], AggregateSearchHistory[P]>
  }




  export type SearchHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SearchHistoryWhereInput
    orderBy?: SearchHistoryOrderByWithAggregationInput | SearchHistoryOrderByWithAggregationInput[]
    by: SearchHistoryScalarFieldEnum[] | SearchHistoryScalarFieldEnum
    having?: SearchHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SearchHistoryCountAggregateInputType | true
    _avg?: SearchHistoryAvgAggregateInputType
    _sum?: SearchHistorySumAggregateInputType
    _min?: SearchHistoryMinAggregateInputType
    _max?: SearchHistoryMaxAggregateInputType
  }

  export type SearchHistoryGroupByOutputType = {
    id: string
    userId: string
    repositoryId: string
    snapshotId: string | null
    query: string
    searchType: $Enums.SearchType
    resultsCount: number
    createdAt: Date
    _count: SearchHistoryCountAggregateOutputType | null
    _avg: SearchHistoryAvgAggregateOutputType | null
    _sum: SearchHistorySumAggregateOutputType | null
    _min: SearchHistoryMinAggregateOutputType | null
    _max: SearchHistoryMaxAggregateOutputType | null
  }

  type GetSearchHistoryGroupByPayload<T extends SearchHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SearchHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SearchHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SearchHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], SearchHistoryGroupByOutputType[P]>
        }
      >
    >


  export type SearchHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    repositoryId?: boolean
    snapshotId?: boolean
    query?: boolean
    searchType?: boolean
    resultsCount?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    snapshot?: boolean | SearchHistory$snapshotArgs<ExtArgs>
  }, ExtArgs["result"]["searchHistory"]>

  export type SearchHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    repositoryId?: boolean
    snapshotId?: boolean
    query?: boolean
    searchType?: boolean
    resultsCount?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    snapshot?: boolean | SearchHistory$snapshotArgs<ExtArgs>
  }, ExtArgs["result"]["searchHistory"]>

  export type SearchHistorySelectScalar = {
    id?: boolean
    userId?: boolean
    repositoryId?: boolean
    snapshotId?: boolean
    query?: boolean
    searchType?: boolean
    resultsCount?: boolean
    createdAt?: boolean
  }

  export type SearchHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    snapshot?: boolean | SearchHistory$snapshotArgs<ExtArgs>
  }
  export type SearchHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    snapshot?: boolean | SearchHistory$snapshotArgs<ExtArgs>
  }

  export type $SearchHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SearchHistory"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      repository: Prisma.$RepositoryPayload<ExtArgs>
      snapshot: Prisma.$SnapshotPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      repositoryId: string
      snapshotId: string | null
      query: string
      searchType: $Enums.SearchType
      resultsCount: number
      createdAt: Date
    }, ExtArgs["result"]["searchHistory"]>
    composites: {}
  }

  type SearchHistoryGetPayload<S extends boolean | null | undefined | SearchHistoryDefaultArgs> = $Result.GetResult<Prisma.$SearchHistoryPayload, S>

  type SearchHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SearchHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SearchHistoryCountAggregateInputType | true
    }

  export interface SearchHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SearchHistory'], meta: { name: 'SearchHistory' } }
    /**
     * Find zero or one SearchHistory that matches the filter.
     * @param {SearchHistoryFindUniqueArgs} args - Arguments to find a SearchHistory
     * @example
     * // Get one SearchHistory
     * const searchHistory = await prisma.searchHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SearchHistoryFindUniqueArgs>(args: SelectSubset<T, SearchHistoryFindUniqueArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SearchHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SearchHistoryFindUniqueOrThrowArgs} args - Arguments to find a SearchHistory
     * @example
     * // Get one SearchHistory
     * const searchHistory = await prisma.searchHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SearchHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, SearchHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SearchHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryFindFirstArgs} args - Arguments to find a SearchHistory
     * @example
     * // Get one SearchHistory
     * const searchHistory = await prisma.searchHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SearchHistoryFindFirstArgs>(args?: SelectSubset<T, SearchHistoryFindFirstArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SearchHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryFindFirstOrThrowArgs} args - Arguments to find a SearchHistory
     * @example
     * // Get one SearchHistory
     * const searchHistory = await prisma.searchHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SearchHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, SearchHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SearchHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SearchHistories
     * const searchHistories = await prisma.searchHistory.findMany()
     * 
     * // Get first 10 SearchHistories
     * const searchHistories = await prisma.searchHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const searchHistoryWithIdOnly = await prisma.searchHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SearchHistoryFindManyArgs>(args?: SelectSubset<T, SearchHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SearchHistory.
     * @param {SearchHistoryCreateArgs} args - Arguments to create a SearchHistory.
     * @example
     * // Create one SearchHistory
     * const SearchHistory = await prisma.searchHistory.create({
     *   data: {
     *     // ... data to create a SearchHistory
     *   }
     * })
     * 
     */
    create<T extends SearchHistoryCreateArgs>(args: SelectSubset<T, SearchHistoryCreateArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SearchHistories.
     * @param {SearchHistoryCreateManyArgs} args - Arguments to create many SearchHistories.
     * @example
     * // Create many SearchHistories
     * const searchHistory = await prisma.searchHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SearchHistoryCreateManyArgs>(args?: SelectSubset<T, SearchHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SearchHistories and returns the data saved in the database.
     * @param {SearchHistoryCreateManyAndReturnArgs} args - Arguments to create many SearchHistories.
     * @example
     * // Create many SearchHistories
     * const searchHistory = await prisma.searchHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SearchHistories and only return the `id`
     * const searchHistoryWithIdOnly = await prisma.searchHistory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SearchHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, SearchHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SearchHistory.
     * @param {SearchHistoryDeleteArgs} args - Arguments to delete one SearchHistory.
     * @example
     * // Delete one SearchHistory
     * const SearchHistory = await prisma.searchHistory.delete({
     *   where: {
     *     // ... filter to delete one SearchHistory
     *   }
     * })
     * 
     */
    delete<T extends SearchHistoryDeleteArgs>(args: SelectSubset<T, SearchHistoryDeleteArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SearchHistory.
     * @param {SearchHistoryUpdateArgs} args - Arguments to update one SearchHistory.
     * @example
     * // Update one SearchHistory
     * const searchHistory = await prisma.searchHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SearchHistoryUpdateArgs>(args: SelectSubset<T, SearchHistoryUpdateArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SearchHistories.
     * @param {SearchHistoryDeleteManyArgs} args - Arguments to filter SearchHistories to delete.
     * @example
     * // Delete a few SearchHistories
     * const { count } = await prisma.searchHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SearchHistoryDeleteManyArgs>(args?: SelectSubset<T, SearchHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SearchHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SearchHistories
     * const searchHistory = await prisma.searchHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SearchHistoryUpdateManyArgs>(args: SelectSubset<T, SearchHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SearchHistory.
     * @param {SearchHistoryUpsertArgs} args - Arguments to update or create a SearchHistory.
     * @example
     * // Update or create a SearchHistory
     * const searchHistory = await prisma.searchHistory.upsert({
     *   create: {
     *     // ... data to create a SearchHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SearchHistory we want to update
     *   }
     * })
     */
    upsert<T extends SearchHistoryUpsertArgs>(args: SelectSubset<T, SearchHistoryUpsertArgs<ExtArgs>>): Prisma__SearchHistoryClient<$Result.GetResult<Prisma.$SearchHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SearchHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryCountArgs} args - Arguments to filter SearchHistories to count.
     * @example
     * // Count the number of SearchHistories
     * const count = await prisma.searchHistory.count({
     *   where: {
     *     // ... the filter for the SearchHistories we want to count
     *   }
     * })
    **/
    count<T extends SearchHistoryCountArgs>(
      args?: Subset<T, SearchHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SearchHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SearchHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SearchHistoryAggregateArgs>(args: Subset<T, SearchHistoryAggregateArgs>): Prisma.PrismaPromise<GetSearchHistoryAggregateType<T>>

    /**
     * Group by SearchHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SearchHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SearchHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SearchHistoryGroupByArgs['orderBy'] }
        : { orderBy?: SearchHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SearchHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSearchHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SearchHistory model
   */
  readonly fields: SearchHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SearchHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SearchHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    snapshot<T extends SearchHistory$snapshotArgs<ExtArgs> = {}>(args?: Subset<T, SearchHistory$snapshotArgs<ExtArgs>>): Prisma__SnapshotClient<$Result.GetResult<Prisma.$SnapshotPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SearchHistory model
   */ 
  interface SearchHistoryFieldRefs {
    readonly id: FieldRef<"SearchHistory", 'String'>
    readonly userId: FieldRef<"SearchHistory", 'String'>
    readonly repositoryId: FieldRef<"SearchHistory", 'String'>
    readonly snapshotId: FieldRef<"SearchHistory", 'String'>
    readonly query: FieldRef<"SearchHistory", 'String'>
    readonly searchType: FieldRef<"SearchHistory", 'SearchType'>
    readonly resultsCount: FieldRef<"SearchHistory", 'Int'>
    readonly createdAt: FieldRef<"SearchHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SearchHistory findUnique
   */
  export type SearchHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * Filter, which SearchHistory to fetch.
     */
    where: SearchHistoryWhereUniqueInput
  }

  /**
   * SearchHistory findUniqueOrThrow
   */
  export type SearchHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * Filter, which SearchHistory to fetch.
     */
    where: SearchHistoryWhereUniqueInput
  }

  /**
   * SearchHistory findFirst
   */
  export type SearchHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * Filter, which SearchHistory to fetch.
     */
    where?: SearchHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SearchHistories to fetch.
     */
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SearchHistories.
     */
    cursor?: SearchHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SearchHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SearchHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SearchHistories.
     */
    distinct?: SearchHistoryScalarFieldEnum | SearchHistoryScalarFieldEnum[]
  }

  /**
   * SearchHistory findFirstOrThrow
   */
  export type SearchHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * Filter, which SearchHistory to fetch.
     */
    where?: SearchHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SearchHistories to fetch.
     */
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SearchHistories.
     */
    cursor?: SearchHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SearchHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SearchHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SearchHistories.
     */
    distinct?: SearchHistoryScalarFieldEnum | SearchHistoryScalarFieldEnum[]
  }

  /**
   * SearchHistory findMany
   */
  export type SearchHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * Filter, which SearchHistories to fetch.
     */
    where?: SearchHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SearchHistories to fetch.
     */
    orderBy?: SearchHistoryOrderByWithRelationInput | SearchHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SearchHistories.
     */
    cursor?: SearchHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SearchHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SearchHistories.
     */
    skip?: number
    distinct?: SearchHistoryScalarFieldEnum | SearchHistoryScalarFieldEnum[]
  }

  /**
   * SearchHistory create
   */
  export type SearchHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a SearchHistory.
     */
    data: XOR<SearchHistoryCreateInput, SearchHistoryUncheckedCreateInput>
  }

  /**
   * SearchHistory createMany
   */
  export type SearchHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SearchHistories.
     */
    data: SearchHistoryCreateManyInput | SearchHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SearchHistory createManyAndReturn
   */
  export type SearchHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SearchHistories.
     */
    data: SearchHistoryCreateManyInput | SearchHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SearchHistory update
   */
  export type SearchHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a SearchHistory.
     */
    data: XOR<SearchHistoryUpdateInput, SearchHistoryUncheckedUpdateInput>
    /**
     * Choose, which SearchHistory to update.
     */
    where: SearchHistoryWhereUniqueInput
  }

  /**
   * SearchHistory updateMany
   */
  export type SearchHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SearchHistories.
     */
    data: XOR<SearchHistoryUpdateManyMutationInput, SearchHistoryUncheckedUpdateManyInput>
    /**
     * Filter which SearchHistories to update
     */
    where?: SearchHistoryWhereInput
  }

  /**
   * SearchHistory upsert
   */
  export type SearchHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the SearchHistory to update in case it exists.
     */
    where: SearchHistoryWhereUniqueInput
    /**
     * In case the SearchHistory found by the `where` argument doesn't exist, create a new SearchHistory with this data.
     */
    create: XOR<SearchHistoryCreateInput, SearchHistoryUncheckedCreateInput>
    /**
     * In case the SearchHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SearchHistoryUpdateInput, SearchHistoryUncheckedUpdateInput>
  }

  /**
   * SearchHistory delete
   */
  export type SearchHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
    /**
     * Filter which SearchHistory to delete.
     */
    where: SearchHistoryWhereUniqueInput
  }

  /**
   * SearchHistory deleteMany
   */
  export type SearchHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SearchHistories to delete
     */
    where?: SearchHistoryWhereInput
  }

  /**
   * SearchHistory.snapshot
   */
  export type SearchHistory$snapshotArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Snapshot
     */
    select?: SnapshotSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SnapshotInclude<ExtArgs> | null
    where?: SnapshotWhereInput
  }

  /**
   * SearchHistory without action
   */
  export type SearchHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SearchHistory
     */
    select?: SearchHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SearchHistoryInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    username: 'username',
    password: 'password',
    avatar: 'avatar',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserSessionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type UserSessionScalarFieldEnum = (typeof UserSessionScalarFieldEnum)[keyof typeof UserSessionScalarFieldEnum]


  export const RepositoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    gitUrl: 'gitUrl',
    ownerId: 'ownerId',
    defaultBranch: 'defaultBranch',
    visibility: 'visibility',
    description: 'description',
    isActive: 'isActive',
    lastSyncAt: 'lastSyncAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RepositoryScalarFieldEnum = (typeof RepositoryScalarFieldEnum)[keyof typeof RepositoryScalarFieldEnum]


  export const SnapshotScalarFieldEnum: {
    id: 'id',
    repoId: 'repoId',
    ownerId: 'ownerId',
    commitSha: 'commitSha',
    branchName: 'branchName',
    worktreePath: 'worktreePath',
    bundlePath: 'bundlePath',
    status: 'status',
    title: 'title',
    description: 'description',
    expiresAt: 'expiresAt',
    processedAt: 'processedAt',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SnapshotScalarFieldEnum = (typeof SnapshotScalarFieldEnum)[keyof typeof SnapshotScalarFieldEnum]


  export const CommentScalarFieldEnum: {
    id: 'id',
    snapshotId: 'snapshotId',
    authorId: 'authorId',
    content: 'content',
    anchorType: 'anchorType',
    commitSha: 'commitSha',
    filePath: 'filePath',
    lineStart: 'lineStart',
    lineEnd: 'lineEnd',
    status: 'status',
    parentId: 'parentId',
    isResolved: 'isResolved',
    resolvedAt: 'resolvedAt',
    resolvedBy: 'resolvedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CommentScalarFieldEnum = (typeof CommentScalarFieldEnum)[keyof typeof CommentScalarFieldEnum]


  export const TimelineEventScalarFieldEnum: {
    id: 'id',
    repoId: 'repoId',
    type: 'type',
    actorId: 'actorId',
    snapshotId: 'snapshotId',
    commentId: 'commentId',
    payload: 'payload',
    createdAt: 'createdAt'
  };

  export type TimelineEventScalarFieldEnum = (typeof TimelineEventScalarFieldEnum)[keyof typeof TimelineEventScalarFieldEnum]


  export const DiffScalarFieldEnum: {
    id: 'id',
    type: 'type',
    sourceId: 'sourceId',
    targetId: 'targetId',
    repositoryId: 'repositoryId',
    ownerId: 'ownerId',
    status: 'status',
    filesCount: 'filesCount',
    additionsCount: 'additionsCount',
    deletionsCount: 'deletionsCount',
    contentHash: 'contentHash',
    title: 'title',
    description: 'description',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DiffScalarFieldEnum = (typeof DiffScalarFieldEnum)[keyof typeof DiffScalarFieldEnum]


  export const DiffFileScalarFieldEnum: {
    id: 'id',
    diffId: 'diffId',
    filePath: 'filePath',
    changeType: 'changeType',
    additions: 'additions',
    deletions: 'deletions',
    content: 'content',
    contentSize: 'contentSize',
    oldFilePath: 'oldFilePath',
    isBinary: 'isBinary',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DiffFileScalarFieldEnum = (typeof DiffFileScalarFieldEnum)[keyof typeof DiffFileScalarFieldEnum]


  export const SearchHistoryScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    repositoryId: 'repositoryId',
    snapshotId: 'snapshotId',
    query: 'query',
    searchType: 'searchType',
    resultsCount: 'resultsCount',
    createdAt: 'createdAt'
  };

  export type SearchHistoryScalarFieldEnum = (typeof SearchHistoryScalarFieldEnum)[keyof typeof SearchHistoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'RepositoryVisibility'
   */
  export type EnumRepositoryVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepositoryVisibility'>
    


  /**
   * Reference to a field of type 'RepositoryVisibility[]'
   */
  export type ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepositoryVisibility[]'>
    


  /**
   * Reference to a field of type 'SnapshotStatus'
   */
  export type EnumSnapshotStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SnapshotStatus'>
    


  /**
   * Reference to a field of type 'SnapshotStatus[]'
   */
  export type ListEnumSnapshotStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SnapshotStatus[]'>
    


  /**
   * Reference to a field of type 'CommentAnchorType'
   */
  export type EnumCommentAnchorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommentAnchorType'>
    


  /**
   * Reference to a field of type 'CommentAnchorType[]'
   */
  export type ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommentAnchorType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'CommentStatus'
   */
  export type EnumCommentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommentStatus'>
    


  /**
   * Reference to a field of type 'CommentStatus[]'
   */
  export type ListEnumCommentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommentStatus[]'>
    


  /**
   * Reference to a field of type 'TimelineEventType'
   */
  export type EnumTimelineEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TimelineEventType'>
    


  /**
   * Reference to a field of type 'TimelineEventType[]'
   */
  export type ListEnumTimelineEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TimelineEventType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DiffType'
   */
  export type EnumDiffTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiffType'>
    


  /**
   * Reference to a field of type 'DiffType[]'
   */
  export type ListEnumDiffTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiffType[]'>
    


  /**
   * Reference to a field of type 'DiffStatus'
   */
  export type EnumDiffStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiffStatus'>
    


  /**
   * Reference to a field of type 'DiffStatus[]'
   */
  export type ListEnumDiffStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiffStatus[]'>
    


  /**
   * Reference to a field of type 'FileChangeType'
   */
  export type EnumFileChangeTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FileChangeType'>
    


  /**
   * Reference to a field of type 'FileChangeType[]'
   */
  export type ListEnumFileChangeTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FileChangeType[]'>
    


  /**
   * Reference to a field of type 'SearchType'
   */
  export type EnumSearchTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SearchType'>
    


  /**
   * Reference to a field of type 'SearchType[]'
   */
  export type ListEnumSearchTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SearchType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    ownedRepositories?: RepositoryListRelationFilter
    snapshots?: SnapshotListRelationFilter
    comments?: CommentListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
    sessions?: UserSessionListRelationFilter
    diffs?: DiffListRelationFilter
    searchHistory?: SearchHistoryListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    avatar?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownedRepositories?: RepositoryOrderByRelationAggregateInput
    snapshots?: SnapshotOrderByRelationAggregateInput
    comments?: CommentOrderByRelationAggregateInput
    timelineEvents?: TimelineEventOrderByRelationAggregateInput
    sessions?: UserSessionOrderByRelationAggregateInput
    diffs?: DiffOrderByRelationAggregateInput
    searchHistory?: SearchHistoryOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    ownedRepositories?: RepositoryListRelationFilter
    snapshots?: SnapshotListRelationFilter
    comments?: CommentListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
    sessions?: UserSessionListRelationFilter
    diffs?: DiffListRelationFilter
    searchHistory?: SearchHistoryListRelationFilter
  }, "id" | "email" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    avatar?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    avatar?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserSessionWhereInput = {
    AND?: UserSessionWhereInput | UserSessionWhereInput[]
    OR?: UserSessionWhereInput[]
    NOT?: UserSessionWhereInput | UserSessionWhereInput[]
    id?: StringFilter<"UserSession"> | string
    userId?: StringFilter<"UserSession"> | string
    token?: StringFilter<"UserSession"> | string
    expiresAt?: DateTimeFilter<"UserSession"> | Date | string
    createdAt?: DateTimeFilter<"UserSession"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type UserSessionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: UserSessionWhereInput | UserSessionWhereInput[]
    OR?: UserSessionWhereInput[]
    NOT?: UserSessionWhereInput | UserSessionWhereInput[]
    userId?: StringFilter<"UserSession"> | string
    expiresAt?: DateTimeFilter<"UserSession"> | Date | string
    createdAt?: DateTimeFilter<"UserSession"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type UserSessionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: UserSessionCountOrderByAggregateInput
    _max?: UserSessionMaxOrderByAggregateInput
    _min?: UserSessionMinOrderByAggregateInput
  }

  export type UserSessionScalarWhereWithAggregatesInput = {
    AND?: UserSessionScalarWhereWithAggregatesInput | UserSessionScalarWhereWithAggregatesInput[]
    OR?: UserSessionScalarWhereWithAggregatesInput[]
    NOT?: UserSessionScalarWhereWithAggregatesInput | UserSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserSession"> | string
    userId?: StringWithAggregatesFilter<"UserSession"> | string
    token?: StringWithAggregatesFilter<"UserSession"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"UserSession"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"UserSession"> | Date | string
  }

  export type RepositoryWhereInput = {
    AND?: RepositoryWhereInput | RepositoryWhereInput[]
    OR?: RepositoryWhereInput[]
    NOT?: RepositoryWhereInput | RepositoryWhereInput[]
    id?: StringFilter<"Repository"> | string
    name?: StringFilter<"Repository"> | string
    gitUrl?: StringFilter<"Repository"> | string
    ownerId?: StringFilter<"Repository"> | string
    defaultBranch?: StringFilter<"Repository"> | string
    visibility?: EnumRepositoryVisibilityFilter<"Repository"> | $Enums.RepositoryVisibility
    description?: StringNullableFilter<"Repository"> | string | null
    isActive?: BoolFilter<"Repository"> | boolean
    lastSyncAt?: DateTimeNullableFilter<"Repository"> | Date | string | null
    createdAt?: DateTimeFilter<"Repository"> | Date | string
    updatedAt?: DateTimeFilter<"Repository"> | Date | string
    owner?: XOR<UserRelationFilter, UserWhereInput>
    snapshots?: SnapshotListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
    diffs?: DiffListRelationFilter
    searchHistory?: SearchHistoryListRelationFilter
  }

  export type RepositoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    gitUrl?: SortOrder
    ownerId?: SortOrder
    defaultBranch?: SortOrder
    visibility?: SortOrder
    description?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    owner?: UserOrderByWithRelationInput
    snapshots?: SnapshotOrderByRelationAggregateInput
    timelineEvents?: TimelineEventOrderByRelationAggregateInput
    diffs?: DiffOrderByRelationAggregateInput
    searchHistory?: SearchHistoryOrderByRelationAggregateInput
  }

  export type RepositoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ownerId_name?: RepositoryOwnerIdNameCompoundUniqueInput
    AND?: RepositoryWhereInput | RepositoryWhereInput[]
    OR?: RepositoryWhereInput[]
    NOT?: RepositoryWhereInput | RepositoryWhereInput[]
    name?: StringFilter<"Repository"> | string
    gitUrl?: StringFilter<"Repository"> | string
    ownerId?: StringFilter<"Repository"> | string
    defaultBranch?: StringFilter<"Repository"> | string
    visibility?: EnumRepositoryVisibilityFilter<"Repository"> | $Enums.RepositoryVisibility
    description?: StringNullableFilter<"Repository"> | string | null
    isActive?: BoolFilter<"Repository"> | boolean
    lastSyncAt?: DateTimeNullableFilter<"Repository"> | Date | string | null
    createdAt?: DateTimeFilter<"Repository"> | Date | string
    updatedAt?: DateTimeFilter<"Repository"> | Date | string
    owner?: XOR<UserRelationFilter, UserWhereInput>
    snapshots?: SnapshotListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
    diffs?: DiffListRelationFilter
    searchHistory?: SearchHistoryListRelationFilter
  }, "id" | "ownerId_name">

  export type RepositoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    gitUrl?: SortOrder
    ownerId?: SortOrder
    defaultBranch?: SortOrder
    visibility?: SortOrder
    description?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RepositoryCountOrderByAggregateInput
    _max?: RepositoryMaxOrderByAggregateInput
    _min?: RepositoryMinOrderByAggregateInput
  }

  export type RepositoryScalarWhereWithAggregatesInput = {
    AND?: RepositoryScalarWhereWithAggregatesInput | RepositoryScalarWhereWithAggregatesInput[]
    OR?: RepositoryScalarWhereWithAggregatesInput[]
    NOT?: RepositoryScalarWhereWithAggregatesInput | RepositoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Repository"> | string
    name?: StringWithAggregatesFilter<"Repository"> | string
    gitUrl?: StringWithAggregatesFilter<"Repository"> | string
    ownerId?: StringWithAggregatesFilter<"Repository"> | string
    defaultBranch?: StringWithAggregatesFilter<"Repository"> | string
    visibility?: EnumRepositoryVisibilityWithAggregatesFilter<"Repository"> | $Enums.RepositoryVisibility
    description?: StringNullableWithAggregatesFilter<"Repository"> | string | null
    isActive?: BoolWithAggregatesFilter<"Repository"> | boolean
    lastSyncAt?: DateTimeNullableWithAggregatesFilter<"Repository"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Repository"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Repository"> | Date | string
  }

  export type SnapshotWhereInput = {
    AND?: SnapshotWhereInput | SnapshotWhereInput[]
    OR?: SnapshotWhereInput[]
    NOT?: SnapshotWhereInput | SnapshotWhereInput[]
    id?: StringFilter<"Snapshot"> | string
    repoId?: StringFilter<"Snapshot"> | string
    ownerId?: StringFilter<"Snapshot"> | string
    commitSha?: StringFilter<"Snapshot"> | string
    branchName?: StringFilter<"Snapshot"> | string
    worktreePath?: StringNullableFilter<"Snapshot"> | string | null
    bundlePath?: StringNullableFilter<"Snapshot"> | string | null
    status?: EnumSnapshotStatusFilter<"Snapshot"> | $Enums.SnapshotStatus
    title?: StringNullableFilter<"Snapshot"> | string | null
    description?: StringNullableFilter<"Snapshot"> | string | null
    expiresAt?: DateTimeFilter<"Snapshot"> | Date | string
    processedAt?: DateTimeNullableFilter<"Snapshot"> | Date | string | null
    errorMessage?: StringNullableFilter<"Snapshot"> | string | null
    createdAt?: DateTimeFilter<"Snapshot"> | Date | string
    updatedAt?: DateTimeFilter<"Snapshot"> | Date | string
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    owner?: XOR<UserRelationFilter, UserWhereInput>
    comments?: CommentListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
    searchHistory?: SearchHistoryListRelationFilter
  }

  export type SnapshotOrderByWithRelationInput = {
    id?: SortOrder
    repoId?: SortOrder
    ownerId?: SortOrder
    commitSha?: SortOrder
    branchName?: SortOrder
    worktreePath?: SortOrderInput | SortOrder
    bundlePath?: SortOrderInput | SortOrder
    status?: SortOrder
    title?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    repository?: RepositoryOrderByWithRelationInput
    owner?: UserOrderByWithRelationInput
    comments?: CommentOrderByRelationAggregateInput
    timelineEvents?: TimelineEventOrderByRelationAggregateInput
    searchHistory?: SearchHistoryOrderByRelationAggregateInput
  }

  export type SnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SnapshotWhereInput | SnapshotWhereInput[]
    OR?: SnapshotWhereInput[]
    NOT?: SnapshotWhereInput | SnapshotWhereInput[]
    repoId?: StringFilter<"Snapshot"> | string
    ownerId?: StringFilter<"Snapshot"> | string
    commitSha?: StringFilter<"Snapshot"> | string
    branchName?: StringFilter<"Snapshot"> | string
    worktreePath?: StringNullableFilter<"Snapshot"> | string | null
    bundlePath?: StringNullableFilter<"Snapshot"> | string | null
    status?: EnumSnapshotStatusFilter<"Snapshot"> | $Enums.SnapshotStatus
    title?: StringNullableFilter<"Snapshot"> | string | null
    description?: StringNullableFilter<"Snapshot"> | string | null
    expiresAt?: DateTimeFilter<"Snapshot"> | Date | string
    processedAt?: DateTimeNullableFilter<"Snapshot"> | Date | string | null
    errorMessage?: StringNullableFilter<"Snapshot"> | string | null
    createdAt?: DateTimeFilter<"Snapshot"> | Date | string
    updatedAt?: DateTimeFilter<"Snapshot"> | Date | string
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    owner?: XOR<UserRelationFilter, UserWhereInput>
    comments?: CommentListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
    searchHistory?: SearchHistoryListRelationFilter
  }, "id">

  export type SnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    repoId?: SortOrder
    ownerId?: SortOrder
    commitSha?: SortOrder
    branchName?: SortOrder
    worktreePath?: SortOrderInput | SortOrder
    bundlePath?: SortOrderInput | SortOrder
    status?: SortOrder
    title?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SnapshotCountOrderByAggregateInput
    _max?: SnapshotMaxOrderByAggregateInput
    _min?: SnapshotMinOrderByAggregateInput
  }

  export type SnapshotScalarWhereWithAggregatesInput = {
    AND?: SnapshotScalarWhereWithAggregatesInput | SnapshotScalarWhereWithAggregatesInput[]
    OR?: SnapshotScalarWhereWithAggregatesInput[]
    NOT?: SnapshotScalarWhereWithAggregatesInput | SnapshotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Snapshot"> | string
    repoId?: StringWithAggregatesFilter<"Snapshot"> | string
    ownerId?: StringWithAggregatesFilter<"Snapshot"> | string
    commitSha?: StringWithAggregatesFilter<"Snapshot"> | string
    branchName?: StringWithAggregatesFilter<"Snapshot"> | string
    worktreePath?: StringNullableWithAggregatesFilter<"Snapshot"> | string | null
    bundlePath?: StringNullableWithAggregatesFilter<"Snapshot"> | string | null
    status?: EnumSnapshotStatusWithAggregatesFilter<"Snapshot"> | $Enums.SnapshotStatus
    title?: StringNullableWithAggregatesFilter<"Snapshot"> | string | null
    description?: StringNullableWithAggregatesFilter<"Snapshot"> | string | null
    expiresAt?: DateTimeWithAggregatesFilter<"Snapshot"> | Date | string
    processedAt?: DateTimeNullableWithAggregatesFilter<"Snapshot"> | Date | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"Snapshot"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Snapshot"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Snapshot"> | Date | string
  }

  export type CommentWhereInput = {
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    id?: StringFilter<"Comment"> | string
    snapshotId?: StringFilter<"Comment"> | string
    authorId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    anchorType?: EnumCommentAnchorTypeFilter<"Comment"> | $Enums.CommentAnchorType
    commitSha?: StringNullableFilter<"Comment"> | string | null
    filePath?: StringNullableFilter<"Comment"> | string | null
    lineStart?: IntNullableFilter<"Comment"> | number | null
    lineEnd?: IntNullableFilter<"Comment"> | number | null
    status?: EnumCommentStatusFilter<"Comment"> | $Enums.CommentStatus
    parentId?: StringNullableFilter<"Comment"> | string | null
    isResolved?: BoolFilter<"Comment"> | boolean
    resolvedAt?: DateTimeNullableFilter<"Comment"> | Date | string | null
    resolvedBy?: StringNullableFilter<"Comment"> | string | null
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    snapshot?: XOR<SnapshotRelationFilter, SnapshotWhereInput>
    author?: XOR<UserRelationFilter, UserWhereInput>
    parent?: XOR<CommentNullableRelationFilter, CommentWhereInput> | null
    replies?: CommentListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
  }

  export type CommentOrderByWithRelationInput = {
    id?: SortOrder
    snapshotId?: SortOrder
    authorId?: SortOrder
    content?: SortOrder
    anchorType?: SortOrder
    commitSha?: SortOrderInput | SortOrder
    filePath?: SortOrderInput | SortOrder
    lineStart?: SortOrderInput | SortOrder
    lineEnd?: SortOrderInput | SortOrder
    status?: SortOrder
    parentId?: SortOrderInput | SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    snapshot?: SnapshotOrderByWithRelationInput
    author?: UserOrderByWithRelationInput
    parent?: CommentOrderByWithRelationInput
    replies?: CommentOrderByRelationAggregateInput
    timelineEvents?: TimelineEventOrderByRelationAggregateInput
  }

  export type CommentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    snapshotId?: StringFilter<"Comment"> | string
    authorId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    anchorType?: EnumCommentAnchorTypeFilter<"Comment"> | $Enums.CommentAnchorType
    commitSha?: StringNullableFilter<"Comment"> | string | null
    filePath?: StringNullableFilter<"Comment"> | string | null
    lineStart?: IntNullableFilter<"Comment"> | number | null
    lineEnd?: IntNullableFilter<"Comment"> | number | null
    status?: EnumCommentStatusFilter<"Comment"> | $Enums.CommentStatus
    parentId?: StringNullableFilter<"Comment"> | string | null
    isResolved?: BoolFilter<"Comment"> | boolean
    resolvedAt?: DateTimeNullableFilter<"Comment"> | Date | string | null
    resolvedBy?: StringNullableFilter<"Comment"> | string | null
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    snapshot?: XOR<SnapshotRelationFilter, SnapshotWhereInput>
    author?: XOR<UserRelationFilter, UserWhereInput>
    parent?: XOR<CommentNullableRelationFilter, CommentWhereInput> | null
    replies?: CommentListRelationFilter
    timelineEvents?: TimelineEventListRelationFilter
  }, "id">

  export type CommentOrderByWithAggregationInput = {
    id?: SortOrder
    snapshotId?: SortOrder
    authorId?: SortOrder
    content?: SortOrder
    anchorType?: SortOrder
    commitSha?: SortOrderInput | SortOrder
    filePath?: SortOrderInput | SortOrder
    lineStart?: SortOrderInput | SortOrder
    lineEnd?: SortOrderInput | SortOrder
    status?: SortOrder
    parentId?: SortOrderInput | SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CommentCountOrderByAggregateInput
    _avg?: CommentAvgOrderByAggregateInput
    _max?: CommentMaxOrderByAggregateInput
    _min?: CommentMinOrderByAggregateInput
    _sum?: CommentSumOrderByAggregateInput
  }

  export type CommentScalarWhereWithAggregatesInput = {
    AND?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    OR?: CommentScalarWhereWithAggregatesInput[]
    NOT?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Comment"> | string
    snapshotId?: StringWithAggregatesFilter<"Comment"> | string
    authorId?: StringWithAggregatesFilter<"Comment"> | string
    content?: StringWithAggregatesFilter<"Comment"> | string
    anchorType?: EnumCommentAnchorTypeWithAggregatesFilter<"Comment"> | $Enums.CommentAnchorType
    commitSha?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    filePath?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    lineStart?: IntNullableWithAggregatesFilter<"Comment"> | number | null
    lineEnd?: IntNullableWithAggregatesFilter<"Comment"> | number | null
    status?: EnumCommentStatusWithAggregatesFilter<"Comment"> | $Enums.CommentStatus
    parentId?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    isResolved?: BoolWithAggregatesFilter<"Comment"> | boolean
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"Comment"> | Date | string | null
    resolvedBy?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
  }

  export type TimelineEventWhereInput = {
    AND?: TimelineEventWhereInput | TimelineEventWhereInput[]
    OR?: TimelineEventWhereInput[]
    NOT?: TimelineEventWhereInput | TimelineEventWhereInput[]
    id?: StringFilter<"TimelineEvent"> | string
    repoId?: StringFilter<"TimelineEvent"> | string
    type?: EnumTimelineEventTypeFilter<"TimelineEvent"> | $Enums.TimelineEventType
    actorId?: StringFilter<"TimelineEvent"> | string
    snapshotId?: StringNullableFilter<"TimelineEvent"> | string | null
    commentId?: StringNullableFilter<"TimelineEvent"> | string | null
    payload?: JsonFilter<"TimelineEvent">
    createdAt?: DateTimeFilter<"TimelineEvent"> | Date | string
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    actor?: XOR<UserRelationFilter, UserWhereInput>
    snapshot?: XOR<SnapshotNullableRelationFilter, SnapshotWhereInput> | null
    comment?: XOR<CommentNullableRelationFilter, CommentWhereInput> | null
  }

  export type TimelineEventOrderByWithRelationInput = {
    id?: SortOrder
    repoId?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    snapshotId?: SortOrderInput | SortOrder
    commentId?: SortOrderInput | SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    repository?: RepositoryOrderByWithRelationInput
    actor?: UserOrderByWithRelationInput
    snapshot?: SnapshotOrderByWithRelationInput
    comment?: CommentOrderByWithRelationInput
  }

  export type TimelineEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TimelineEventWhereInput | TimelineEventWhereInput[]
    OR?: TimelineEventWhereInput[]
    NOT?: TimelineEventWhereInput | TimelineEventWhereInput[]
    repoId?: StringFilter<"TimelineEvent"> | string
    type?: EnumTimelineEventTypeFilter<"TimelineEvent"> | $Enums.TimelineEventType
    actorId?: StringFilter<"TimelineEvent"> | string
    snapshotId?: StringNullableFilter<"TimelineEvent"> | string | null
    commentId?: StringNullableFilter<"TimelineEvent"> | string | null
    payload?: JsonFilter<"TimelineEvent">
    createdAt?: DateTimeFilter<"TimelineEvent"> | Date | string
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    actor?: XOR<UserRelationFilter, UserWhereInput>
    snapshot?: XOR<SnapshotNullableRelationFilter, SnapshotWhereInput> | null
    comment?: XOR<CommentNullableRelationFilter, CommentWhereInput> | null
  }, "id">

  export type TimelineEventOrderByWithAggregationInput = {
    id?: SortOrder
    repoId?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    snapshotId?: SortOrderInput | SortOrder
    commentId?: SortOrderInput | SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    _count?: TimelineEventCountOrderByAggregateInput
    _max?: TimelineEventMaxOrderByAggregateInput
    _min?: TimelineEventMinOrderByAggregateInput
  }

  export type TimelineEventScalarWhereWithAggregatesInput = {
    AND?: TimelineEventScalarWhereWithAggregatesInput | TimelineEventScalarWhereWithAggregatesInput[]
    OR?: TimelineEventScalarWhereWithAggregatesInput[]
    NOT?: TimelineEventScalarWhereWithAggregatesInput | TimelineEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TimelineEvent"> | string
    repoId?: StringWithAggregatesFilter<"TimelineEvent"> | string
    type?: EnumTimelineEventTypeWithAggregatesFilter<"TimelineEvent"> | $Enums.TimelineEventType
    actorId?: StringWithAggregatesFilter<"TimelineEvent"> | string
    snapshotId?: StringNullableWithAggregatesFilter<"TimelineEvent"> | string | null
    commentId?: StringNullableWithAggregatesFilter<"TimelineEvent"> | string | null
    payload?: JsonWithAggregatesFilter<"TimelineEvent">
    createdAt?: DateTimeWithAggregatesFilter<"TimelineEvent"> | Date | string
  }

  export type DiffWhereInput = {
    AND?: DiffWhereInput | DiffWhereInput[]
    OR?: DiffWhereInput[]
    NOT?: DiffWhereInput | DiffWhereInput[]
    id?: StringFilter<"Diff"> | string
    type?: EnumDiffTypeFilter<"Diff"> | $Enums.DiffType
    sourceId?: StringFilter<"Diff"> | string
    targetId?: StringFilter<"Diff"> | string
    repositoryId?: StringFilter<"Diff"> | string
    ownerId?: StringFilter<"Diff"> | string
    status?: EnumDiffStatusFilter<"Diff"> | $Enums.DiffStatus
    filesCount?: IntFilter<"Diff"> | number
    additionsCount?: IntFilter<"Diff"> | number
    deletionsCount?: IntFilter<"Diff"> | number
    contentHash?: StringNullableFilter<"Diff"> | string | null
    title?: StringNullableFilter<"Diff"> | string | null
    description?: StringNullableFilter<"Diff"> | string | null
    errorMessage?: StringNullableFilter<"Diff"> | string | null
    createdAt?: DateTimeFilter<"Diff"> | Date | string
    updatedAt?: DateTimeFilter<"Diff"> | Date | string
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    owner?: XOR<UserRelationFilter, UserWhereInput>
    files?: DiffFileListRelationFilter
  }

  export type DiffOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    sourceId?: SortOrder
    targetId?: SortOrder
    repositoryId?: SortOrder
    ownerId?: SortOrder
    status?: SortOrder
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
    contentHash?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    repository?: RepositoryOrderByWithRelationInput
    owner?: UserOrderByWithRelationInput
    files?: DiffFileOrderByRelationAggregateInput
  }

  export type DiffWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DiffWhereInput | DiffWhereInput[]
    OR?: DiffWhereInput[]
    NOT?: DiffWhereInput | DiffWhereInput[]
    type?: EnumDiffTypeFilter<"Diff"> | $Enums.DiffType
    sourceId?: StringFilter<"Diff"> | string
    targetId?: StringFilter<"Diff"> | string
    repositoryId?: StringFilter<"Diff"> | string
    ownerId?: StringFilter<"Diff"> | string
    status?: EnumDiffStatusFilter<"Diff"> | $Enums.DiffStatus
    filesCount?: IntFilter<"Diff"> | number
    additionsCount?: IntFilter<"Diff"> | number
    deletionsCount?: IntFilter<"Diff"> | number
    contentHash?: StringNullableFilter<"Diff"> | string | null
    title?: StringNullableFilter<"Diff"> | string | null
    description?: StringNullableFilter<"Diff"> | string | null
    errorMessage?: StringNullableFilter<"Diff"> | string | null
    createdAt?: DateTimeFilter<"Diff"> | Date | string
    updatedAt?: DateTimeFilter<"Diff"> | Date | string
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    owner?: XOR<UserRelationFilter, UserWhereInput>
    files?: DiffFileListRelationFilter
  }, "id">

  export type DiffOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    sourceId?: SortOrder
    targetId?: SortOrder
    repositoryId?: SortOrder
    ownerId?: SortOrder
    status?: SortOrder
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
    contentHash?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DiffCountOrderByAggregateInput
    _avg?: DiffAvgOrderByAggregateInput
    _max?: DiffMaxOrderByAggregateInput
    _min?: DiffMinOrderByAggregateInput
    _sum?: DiffSumOrderByAggregateInput
  }

  export type DiffScalarWhereWithAggregatesInput = {
    AND?: DiffScalarWhereWithAggregatesInput | DiffScalarWhereWithAggregatesInput[]
    OR?: DiffScalarWhereWithAggregatesInput[]
    NOT?: DiffScalarWhereWithAggregatesInput | DiffScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Diff"> | string
    type?: EnumDiffTypeWithAggregatesFilter<"Diff"> | $Enums.DiffType
    sourceId?: StringWithAggregatesFilter<"Diff"> | string
    targetId?: StringWithAggregatesFilter<"Diff"> | string
    repositoryId?: StringWithAggregatesFilter<"Diff"> | string
    ownerId?: StringWithAggregatesFilter<"Diff"> | string
    status?: EnumDiffStatusWithAggregatesFilter<"Diff"> | $Enums.DiffStatus
    filesCount?: IntWithAggregatesFilter<"Diff"> | number
    additionsCount?: IntWithAggregatesFilter<"Diff"> | number
    deletionsCount?: IntWithAggregatesFilter<"Diff"> | number
    contentHash?: StringNullableWithAggregatesFilter<"Diff"> | string | null
    title?: StringNullableWithAggregatesFilter<"Diff"> | string | null
    description?: StringNullableWithAggregatesFilter<"Diff"> | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"Diff"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Diff"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Diff"> | Date | string
  }

  export type DiffFileWhereInput = {
    AND?: DiffFileWhereInput | DiffFileWhereInput[]
    OR?: DiffFileWhereInput[]
    NOT?: DiffFileWhereInput | DiffFileWhereInput[]
    id?: StringFilter<"DiffFile"> | string
    diffId?: StringFilter<"DiffFile"> | string
    filePath?: StringFilter<"DiffFile"> | string
    changeType?: EnumFileChangeTypeFilter<"DiffFile"> | $Enums.FileChangeType
    additions?: IntFilter<"DiffFile"> | number
    deletions?: IntFilter<"DiffFile"> | number
    content?: JsonNullableFilter<"DiffFile">
    contentSize?: IntFilter<"DiffFile"> | number
    oldFilePath?: StringNullableFilter<"DiffFile"> | string | null
    isBinary?: BoolFilter<"DiffFile"> | boolean
    createdAt?: DateTimeFilter<"DiffFile"> | Date | string
    updatedAt?: DateTimeFilter<"DiffFile"> | Date | string
    diff?: XOR<DiffRelationFilter, DiffWhereInput>
  }

  export type DiffFileOrderByWithRelationInput = {
    id?: SortOrder
    diffId?: SortOrder
    filePath?: SortOrder
    changeType?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    content?: SortOrderInput | SortOrder
    contentSize?: SortOrder
    oldFilePath?: SortOrderInput | SortOrder
    isBinary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    diff?: DiffOrderByWithRelationInput
  }

  export type DiffFileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DiffFileWhereInput | DiffFileWhereInput[]
    OR?: DiffFileWhereInput[]
    NOT?: DiffFileWhereInput | DiffFileWhereInput[]
    diffId?: StringFilter<"DiffFile"> | string
    filePath?: StringFilter<"DiffFile"> | string
    changeType?: EnumFileChangeTypeFilter<"DiffFile"> | $Enums.FileChangeType
    additions?: IntFilter<"DiffFile"> | number
    deletions?: IntFilter<"DiffFile"> | number
    content?: JsonNullableFilter<"DiffFile">
    contentSize?: IntFilter<"DiffFile"> | number
    oldFilePath?: StringNullableFilter<"DiffFile"> | string | null
    isBinary?: BoolFilter<"DiffFile"> | boolean
    createdAt?: DateTimeFilter<"DiffFile"> | Date | string
    updatedAt?: DateTimeFilter<"DiffFile"> | Date | string
    diff?: XOR<DiffRelationFilter, DiffWhereInput>
  }, "id">

  export type DiffFileOrderByWithAggregationInput = {
    id?: SortOrder
    diffId?: SortOrder
    filePath?: SortOrder
    changeType?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    content?: SortOrderInput | SortOrder
    contentSize?: SortOrder
    oldFilePath?: SortOrderInput | SortOrder
    isBinary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DiffFileCountOrderByAggregateInput
    _avg?: DiffFileAvgOrderByAggregateInput
    _max?: DiffFileMaxOrderByAggregateInput
    _min?: DiffFileMinOrderByAggregateInput
    _sum?: DiffFileSumOrderByAggregateInput
  }

  export type DiffFileScalarWhereWithAggregatesInput = {
    AND?: DiffFileScalarWhereWithAggregatesInput | DiffFileScalarWhereWithAggregatesInput[]
    OR?: DiffFileScalarWhereWithAggregatesInput[]
    NOT?: DiffFileScalarWhereWithAggregatesInput | DiffFileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DiffFile"> | string
    diffId?: StringWithAggregatesFilter<"DiffFile"> | string
    filePath?: StringWithAggregatesFilter<"DiffFile"> | string
    changeType?: EnumFileChangeTypeWithAggregatesFilter<"DiffFile"> | $Enums.FileChangeType
    additions?: IntWithAggregatesFilter<"DiffFile"> | number
    deletions?: IntWithAggregatesFilter<"DiffFile"> | number
    content?: JsonNullableWithAggregatesFilter<"DiffFile">
    contentSize?: IntWithAggregatesFilter<"DiffFile"> | number
    oldFilePath?: StringNullableWithAggregatesFilter<"DiffFile"> | string | null
    isBinary?: BoolWithAggregatesFilter<"DiffFile"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"DiffFile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DiffFile"> | Date | string
  }

  export type SearchHistoryWhereInput = {
    AND?: SearchHistoryWhereInput | SearchHistoryWhereInput[]
    OR?: SearchHistoryWhereInput[]
    NOT?: SearchHistoryWhereInput | SearchHistoryWhereInput[]
    id?: StringFilter<"SearchHistory"> | string
    userId?: StringFilter<"SearchHistory"> | string
    repositoryId?: StringFilter<"SearchHistory"> | string
    snapshotId?: StringNullableFilter<"SearchHistory"> | string | null
    query?: StringFilter<"SearchHistory"> | string
    searchType?: EnumSearchTypeFilter<"SearchHistory"> | $Enums.SearchType
    resultsCount?: IntFilter<"SearchHistory"> | number
    createdAt?: DateTimeFilter<"SearchHistory"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    snapshot?: XOR<SnapshotNullableRelationFilter, SnapshotWhereInput> | null
  }

  export type SearchHistoryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    repositoryId?: SortOrder
    snapshotId?: SortOrderInput | SortOrder
    query?: SortOrder
    searchType?: SortOrder
    resultsCount?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    repository?: RepositoryOrderByWithRelationInput
    snapshot?: SnapshotOrderByWithRelationInput
  }

  export type SearchHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SearchHistoryWhereInput | SearchHistoryWhereInput[]
    OR?: SearchHistoryWhereInput[]
    NOT?: SearchHistoryWhereInput | SearchHistoryWhereInput[]
    userId?: StringFilter<"SearchHistory"> | string
    repositoryId?: StringFilter<"SearchHistory"> | string
    snapshotId?: StringNullableFilter<"SearchHistory"> | string | null
    query?: StringFilter<"SearchHistory"> | string
    searchType?: EnumSearchTypeFilter<"SearchHistory"> | $Enums.SearchType
    resultsCount?: IntFilter<"SearchHistory"> | number
    createdAt?: DateTimeFilter<"SearchHistory"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    repository?: XOR<RepositoryRelationFilter, RepositoryWhereInput>
    snapshot?: XOR<SnapshotNullableRelationFilter, SnapshotWhereInput> | null
  }, "id">

  export type SearchHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    repositoryId?: SortOrder
    snapshotId?: SortOrderInput | SortOrder
    query?: SortOrder
    searchType?: SortOrder
    resultsCount?: SortOrder
    createdAt?: SortOrder
    _count?: SearchHistoryCountOrderByAggregateInput
    _avg?: SearchHistoryAvgOrderByAggregateInput
    _max?: SearchHistoryMaxOrderByAggregateInput
    _min?: SearchHistoryMinOrderByAggregateInput
    _sum?: SearchHistorySumOrderByAggregateInput
  }

  export type SearchHistoryScalarWhereWithAggregatesInput = {
    AND?: SearchHistoryScalarWhereWithAggregatesInput | SearchHistoryScalarWhereWithAggregatesInput[]
    OR?: SearchHistoryScalarWhereWithAggregatesInput[]
    NOT?: SearchHistoryScalarWhereWithAggregatesInput | SearchHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SearchHistory"> | string
    userId?: StringWithAggregatesFilter<"SearchHistory"> | string
    repositoryId?: StringWithAggregatesFilter<"SearchHistory"> | string
    snapshotId?: StringNullableWithAggregatesFilter<"SearchHistory"> | string | null
    query?: StringWithAggregatesFilter<"SearchHistory"> | string
    searchType?: EnumSearchTypeWithAggregatesFilter<"SearchHistory"> | $Enums.SearchType
    resultsCount?: IntWithAggregatesFilter<"SearchHistory"> | number
    createdAt?: DateTimeWithAggregatesFilter<"SearchHistory"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSessionCreateInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type UserSessionUncheckedCreateInput = {
    id?: string
    userId: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type UserSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type UserSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSessionCreateManyInput = {
    id?: string
    userId: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type UserSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RepositoryCreateInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedRepositoriesInput
    snapshots?: SnapshotCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutRepositoryInput
    diffs?: DiffCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateInput = {
    id?: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutRepositoryInput
    diffs?: DiffUncheckedCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedRepositoriesNestedInput
    snapshots?: SnapshotUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUncheckedUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryCreateManyInput = {
    id?: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RepositoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RepositoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SnapshotCreateInput = {
    id?: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutSnapshotsInput
    owner: UserCreateNestedOneWithoutSnapshotsInput
    comments?: CommentCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUncheckedCreateInput = {
    id?: string
    repoId: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    comments?: CommentUncheckedCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutSnapshotsNestedInput
    owner?: UserUpdateOneRequiredWithoutSnapshotsNestedInput
    comments?: CommentUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    comments?: CommentUncheckedUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotCreateManyInput = {
    id?: string
    repoId: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SnapshotUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SnapshotUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentCreateInput = {
    id?: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshot: SnapshotCreateNestedOneWithoutCommentsInput
    author: UserCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
    replies?: CommentCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutCommentInput
  }

  export type CommentUncheckedCreateInput = {
    id?: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutCommentInput
  }

  export type CommentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: SnapshotUpdateOneRequiredWithoutCommentsNestedInput
    author?: UserUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutCommentNestedInput
  }

  export type CommentCreateManyInput = {
    id?: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventCreateInput = {
    id?: string
    type: $Enums.TimelineEventType
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutTimelineEventsInput
    actor: UserCreateNestedOneWithoutTimelineEventsInput
    snapshot?: SnapshotCreateNestedOneWithoutTimelineEventsInput
    comment?: CommentCreateNestedOneWithoutTimelineEventsInput
  }

  export type TimelineEventUncheckedCreateInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId?: string | null
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type TimelineEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutTimelineEventsNestedInput
    actor?: UserUpdateOneRequiredWithoutTimelineEventsNestedInput
    snapshot?: SnapshotUpdateOneWithoutTimelineEventsNestedInput
    comment?: CommentUpdateOneWithoutTimelineEventsNestedInput
  }

  export type TimelineEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventCreateManyInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId?: string | null
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type TimelineEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffCreateInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutDiffsInput
    owner: UserCreateNestedOneWithoutDiffsInput
    files?: DiffFileCreateNestedManyWithoutDiffInput
  }

  export type DiffUncheckedCreateInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    repositoryId: string
    ownerId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    files?: DiffFileUncheckedCreateNestedManyWithoutDiffInput
  }

  export type DiffUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutDiffsNestedInput
    owner?: UserUpdateOneRequiredWithoutDiffsNestedInput
    files?: DiffFileUpdateManyWithoutDiffNestedInput
  }

  export type DiffUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    files?: DiffFileUncheckedUpdateManyWithoutDiffNestedInput
  }

  export type DiffCreateManyInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    repositoryId: string
    ownerId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffFileCreateInput = {
    id?: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions?: number
    deletions?: number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: number
    oldFilePath?: string | null
    isBinary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    diff: DiffCreateNestedOneWithoutFilesInput
  }

  export type DiffFileUncheckedCreateInput = {
    id?: string
    diffId: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions?: number
    deletions?: number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: number
    oldFilePath?: string | null
    isBinary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffFileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    diff?: DiffUpdateOneRequiredWithoutFilesNestedInput
  }

  export type DiffFileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    diffId?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffFileCreateManyInput = {
    id?: string
    diffId: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions?: number
    deletions?: number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: number
    oldFilePath?: string | null
    isBinary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffFileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffFileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    diffId?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryCreateInput = {
    id?: string
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSearchHistoryInput
    repository: RepositoryCreateNestedOneWithoutSearchHistoryInput
    snapshot?: SnapshotCreateNestedOneWithoutSearchHistoryInput
  }

  export type SearchHistoryUncheckedCreateInput = {
    id?: string
    userId: string
    repositoryId: string
    snapshotId?: string | null
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type SearchHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSearchHistoryNestedInput
    repository?: RepositoryUpdateOneRequiredWithoutSearchHistoryNestedInput
    snapshot?: SnapshotUpdateOneWithoutSearchHistoryNestedInput
  }

  export type SearchHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryCreateManyInput = {
    id?: string
    userId: string
    repositoryId: string
    snapshotId?: string | null
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type SearchHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type RepositoryListRelationFilter = {
    every?: RepositoryWhereInput
    some?: RepositoryWhereInput
    none?: RepositoryWhereInput
  }

  export type SnapshotListRelationFilter = {
    every?: SnapshotWhereInput
    some?: SnapshotWhereInput
    none?: SnapshotWhereInput
  }

  export type CommentListRelationFilter = {
    every?: CommentWhereInput
    some?: CommentWhereInput
    none?: CommentWhereInput
  }

  export type TimelineEventListRelationFilter = {
    every?: TimelineEventWhereInput
    some?: TimelineEventWhereInput
    none?: TimelineEventWhereInput
  }

  export type UserSessionListRelationFilter = {
    every?: UserSessionWhereInput
    some?: UserSessionWhereInput
    none?: UserSessionWhereInput
  }

  export type DiffListRelationFilter = {
    every?: DiffWhereInput
    some?: DiffWhereInput
    none?: DiffWhereInput
  }

  export type SearchHistoryListRelationFilter = {
    every?: SearchHistoryWhereInput
    some?: SearchHistoryWhereInput
    none?: SearchHistoryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RepositoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SnapshotOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CommentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TimelineEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DiffOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SearchHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    avatar?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    avatar?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    avatar?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserSessionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UserSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UserSessionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumRepositoryVisibilityFilter<$PrismaModel = never> = {
    equals?: $Enums.RepositoryVisibility | EnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumRepositoryVisibilityFilter<$PrismaModel> | $Enums.RepositoryVisibility
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type RepositoryOwnerIdNameCompoundUniqueInput = {
    ownerId: string
    name: string
  }

  export type RepositoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    gitUrl?: SortOrder
    ownerId?: SortOrder
    defaultBranch?: SortOrder
    visibility?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RepositoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    gitUrl?: SortOrder
    ownerId?: SortOrder
    defaultBranch?: SortOrder
    visibility?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RepositoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    gitUrl?: SortOrder
    ownerId?: SortOrder
    defaultBranch?: SortOrder
    visibility?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumRepositoryVisibilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepositoryVisibility | EnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumRepositoryVisibilityWithAggregatesFilter<$PrismaModel> | $Enums.RepositoryVisibility
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRepositoryVisibilityFilter<$PrismaModel>
    _max?: NestedEnumRepositoryVisibilityFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumSnapshotStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SnapshotStatus | EnumSnapshotStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSnapshotStatusFilter<$PrismaModel> | $Enums.SnapshotStatus
  }

  export type RepositoryRelationFilter = {
    is?: RepositoryWhereInput
    isNot?: RepositoryWhereInput
  }

  export type SnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    repoId?: SortOrder
    ownerId?: SortOrder
    commitSha?: SortOrder
    branchName?: SortOrder
    worktreePath?: SortOrder
    bundlePath?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrder
    expiresAt?: SortOrder
    processedAt?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    repoId?: SortOrder
    ownerId?: SortOrder
    commitSha?: SortOrder
    branchName?: SortOrder
    worktreePath?: SortOrder
    bundlePath?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrder
    expiresAt?: SortOrder
    processedAt?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    repoId?: SortOrder
    ownerId?: SortOrder
    commitSha?: SortOrder
    branchName?: SortOrder
    worktreePath?: SortOrder
    bundlePath?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrder
    expiresAt?: SortOrder
    processedAt?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumSnapshotStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SnapshotStatus | EnumSnapshotStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSnapshotStatusWithAggregatesFilter<$PrismaModel> | $Enums.SnapshotStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSnapshotStatusFilter<$PrismaModel>
    _max?: NestedEnumSnapshotStatusFilter<$PrismaModel>
  }

  export type EnumCommentAnchorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentAnchorType | EnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentAnchorTypeFilter<$PrismaModel> | $Enums.CommentAnchorType
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumCommentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentStatus | EnumCommentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentStatusFilter<$PrismaModel> | $Enums.CommentStatus
  }

  export type SnapshotRelationFilter = {
    is?: SnapshotWhereInput
    isNot?: SnapshotWhereInput
  }

  export type CommentNullableRelationFilter = {
    is?: CommentWhereInput | null
    isNot?: CommentWhereInput | null
  }

  export type CommentCountOrderByAggregateInput = {
    id?: SortOrder
    snapshotId?: SortOrder
    authorId?: SortOrder
    content?: SortOrder
    anchorType?: SortOrder
    commitSha?: SortOrder
    filePath?: SortOrder
    lineStart?: SortOrder
    lineEnd?: SortOrder
    status?: SortOrder
    parentId?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentAvgOrderByAggregateInput = {
    lineStart?: SortOrder
    lineEnd?: SortOrder
  }

  export type CommentMaxOrderByAggregateInput = {
    id?: SortOrder
    snapshotId?: SortOrder
    authorId?: SortOrder
    content?: SortOrder
    anchorType?: SortOrder
    commitSha?: SortOrder
    filePath?: SortOrder
    lineStart?: SortOrder
    lineEnd?: SortOrder
    status?: SortOrder
    parentId?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentMinOrderByAggregateInput = {
    id?: SortOrder
    snapshotId?: SortOrder
    authorId?: SortOrder
    content?: SortOrder
    anchorType?: SortOrder
    commitSha?: SortOrder
    filePath?: SortOrder
    lineStart?: SortOrder
    lineEnd?: SortOrder
    status?: SortOrder
    parentId?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentSumOrderByAggregateInput = {
    lineStart?: SortOrder
    lineEnd?: SortOrder
  }

  export type EnumCommentAnchorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentAnchorType | EnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentAnchorTypeWithAggregatesFilter<$PrismaModel> | $Enums.CommentAnchorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCommentAnchorTypeFilter<$PrismaModel>
    _max?: NestedEnumCommentAnchorTypeFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumCommentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentStatus | EnumCommentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentStatusWithAggregatesFilter<$PrismaModel> | $Enums.CommentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCommentStatusFilter<$PrismaModel>
    _max?: NestedEnumCommentStatusFilter<$PrismaModel>
  }

  export type EnumTimelineEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineEventType | EnumTimelineEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTimelineEventTypeFilter<$PrismaModel> | $Enums.TimelineEventType
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SnapshotNullableRelationFilter = {
    is?: SnapshotWhereInput | null
    isNot?: SnapshotWhereInput | null
  }

  export type TimelineEventCountOrderByAggregateInput = {
    id?: SortOrder
    repoId?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    snapshotId?: SortOrder
    commentId?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
  }

  export type TimelineEventMaxOrderByAggregateInput = {
    id?: SortOrder
    repoId?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    snapshotId?: SortOrder
    commentId?: SortOrder
    createdAt?: SortOrder
  }

  export type TimelineEventMinOrderByAggregateInput = {
    id?: SortOrder
    repoId?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    snapshotId?: SortOrder
    commentId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumTimelineEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineEventType | EnumTimelineEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTimelineEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.TimelineEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTimelineEventTypeFilter<$PrismaModel>
    _max?: NestedEnumTimelineEventTypeFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumDiffTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffType | EnumDiffTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffTypeFilter<$PrismaModel> | $Enums.DiffType
  }

  export type EnumDiffStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffStatus | EnumDiffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffStatusFilter<$PrismaModel> | $Enums.DiffStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DiffFileListRelationFilter = {
    every?: DiffFileWhereInput
    some?: DiffFileWhereInput
    none?: DiffFileWhereInput
  }

  export type DiffFileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DiffCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    sourceId?: SortOrder
    targetId?: SortOrder
    repositoryId?: SortOrder
    ownerId?: SortOrder
    status?: SortOrder
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
    contentHash?: SortOrder
    title?: SortOrder
    description?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DiffAvgOrderByAggregateInput = {
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
  }

  export type DiffMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    sourceId?: SortOrder
    targetId?: SortOrder
    repositoryId?: SortOrder
    ownerId?: SortOrder
    status?: SortOrder
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
    contentHash?: SortOrder
    title?: SortOrder
    description?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DiffMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    sourceId?: SortOrder
    targetId?: SortOrder
    repositoryId?: SortOrder
    ownerId?: SortOrder
    status?: SortOrder
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
    contentHash?: SortOrder
    title?: SortOrder
    description?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DiffSumOrderByAggregateInput = {
    filesCount?: SortOrder
    additionsCount?: SortOrder
    deletionsCount?: SortOrder
  }

  export type EnumDiffTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffType | EnumDiffTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffTypeWithAggregatesFilter<$PrismaModel> | $Enums.DiffType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDiffTypeFilter<$PrismaModel>
    _max?: NestedEnumDiffTypeFilter<$PrismaModel>
  }

  export type EnumDiffStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffStatus | EnumDiffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffStatusWithAggregatesFilter<$PrismaModel> | $Enums.DiffStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDiffStatusFilter<$PrismaModel>
    _max?: NestedEnumDiffStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumFileChangeTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.FileChangeType | EnumFileChangeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumFileChangeTypeFilter<$PrismaModel> | $Enums.FileChangeType
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DiffRelationFilter = {
    is?: DiffWhereInput
    isNot?: DiffWhereInput
  }

  export type DiffFileCountOrderByAggregateInput = {
    id?: SortOrder
    diffId?: SortOrder
    filePath?: SortOrder
    changeType?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    content?: SortOrder
    contentSize?: SortOrder
    oldFilePath?: SortOrder
    isBinary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DiffFileAvgOrderByAggregateInput = {
    additions?: SortOrder
    deletions?: SortOrder
    contentSize?: SortOrder
  }

  export type DiffFileMaxOrderByAggregateInput = {
    id?: SortOrder
    diffId?: SortOrder
    filePath?: SortOrder
    changeType?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    contentSize?: SortOrder
    oldFilePath?: SortOrder
    isBinary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DiffFileMinOrderByAggregateInput = {
    id?: SortOrder
    diffId?: SortOrder
    filePath?: SortOrder
    changeType?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    contentSize?: SortOrder
    oldFilePath?: SortOrder
    isBinary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DiffFileSumOrderByAggregateInput = {
    additions?: SortOrder
    deletions?: SortOrder
    contentSize?: SortOrder
  }

  export type EnumFileChangeTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FileChangeType | EnumFileChangeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumFileChangeTypeWithAggregatesFilter<$PrismaModel> | $Enums.FileChangeType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFileChangeTypeFilter<$PrismaModel>
    _max?: NestedEnumFileChangeTypeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumSearchTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SearchType | EnumSearchTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSearchTypeFilter<$PrismaModel> | $Enums.SearchType
  }

  export type SearchHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    repositoryId?: SortOrder
    snapshotId?: SortOrder
    query?: SortOrder
    searchType?: SortOrder
    resultsCount?: SortOrder
    createdAt?: SortOrder
  }

  export type SearchHistoryAvgOrderByAggregateInput = {
    resultsCount?: SortOrder
  }

  export type SearchHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    repositoryId?: SortOrder
    snapshotId?: SortOrder
    query?: SortOrder
    searchType?: SortOrder
    resultsCount?: SortOrder
    createdAt?: SortOrder
  }

  export type SearchHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    repositoryId?: SortOrder
    snapshotId?: SortOrder
    query?: SortOrder
    searchType?: SortOrder
    resultsCount?: SortOrder
    createdAt?: SortOrder
  }

  export type SearchHistorySumOrderByAggregateInput = {
    resultsCount?: SortOrder
  }

  export type EnumSearchTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SearchType | EnumSearchTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSearchTypeWithAggregatesFilter<$PrismaModel> | $Enums.SearchType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSearchTypeFilter<$PrismaModel>
    _max?: NestedEnumSearchTypeFilter<$PrismaModel>
  }

  export type RepositoryCreateNestedManyWithoutOwnerInput = {
    create?: XOR<RepositoryCreateWithoutOwnerInput, RepositoryUncheckedCreateWithoutOwnerInput> | RepositoryCreateWithoutOwnerInput[] | RepositoryUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOwnerInput | RepositoryCreateOrConnectWithoutOwnerInput[]
    createMany?: RepositoryCreateManyOwnerInputEnvelope
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
  }

  export type SnapshotCreateNestedManyWithoutOwnerInput = {
    create?: XOR<SnapshotCreateWithoutOwnerInput, SnapshotUncheckedCreateWithoutOwnerInput> | SnapshotCreateWithoutOwnerInput[] | SnapshotUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutOwnerInput | SnapshotCreateOrConnectWithoutOwnerInput[]
    createMany?: SnapshotCreateManyOwnerInputEnvelope
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
  }

  export type CommentCreateNestedManyWithoutAuthorInput = {
    create?: XOR<CommentCreateWithoutAuthorInput, CommentUncheckedCreateWithoutAuthorInput> | CommentCreateWithoutAuthorInput[] | CommentUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutAuthorInput | CommentCreateOrConnectWithoutAuthorInput[]
    createMany?: CommentCreateManyAuthorInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type TimelineEventCreateNestedManyWithoutActorInput = {
    create?: XOR<TimelineEventCreateWithoutActorInput, TimelineEventUncheckedCreateWithoutActorInput> | TimelineEventCreateWithoutActorInput[] | TimelineEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutActorInput | TimelineEventCreateOrConnectWithoutActorInput[]
    createMany?: TimelineEventCreateManyActorInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type UserSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<UserSessionCreateWithoutUserInput, UserSessionUncheckedCreateWithoutUserInput> | UserSessionCreateWithoutUserInput[] | UserSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSessionCreateOrConnectWithoutUserInput | UserSessionCreateOrConnectWithoutUserInput[]
    createMany?: UserSessionCreateManyUserInputEnvelope
    connect?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
  }

  export type DiffCreateNestedManyWithoutOwnerInput = {
    create?: XOR<DiffCreateWithoutOwnerInput, DiffUncheckedCreateWithoutOwnerInput> | DiffCreateWithoutOwnerInput[] | DiffUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutOwnerInput | DiffCreateOrConnectWithoutOwnerInput[]
    createMany?: DiffCreateManyOwnerInputEnvelope
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
  }

  export type SearchHistoryCreateNestedManyWithoutUserInput = {
    create?: XOR<SearchHistoryCreateWithoutUserInput, SearchHistoryUncheckedCreateWithoutUserInput> | SearchHistoryCreateWithoutUserInput[] | SearchHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutUserInput | SearchHistoryCreateOrConnectWithoutUserInput[]
    createMany?: SearchHistoryCreateManyUserInputEnvelope
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
  }

  export type RepositoryUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<RepositoryCreateWithoutOwnerInput, RepositoryUncheckedCreateWithoutOwnerInput> | RepositoryCreateWithoutOwnerInput[] | RepositoryUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOwnerInput | RepositoryCreateOrConnectWithoutOwnerInput[]
    createMany?: RepositoryCreateManyOwnerInputEnvelope
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
  }

  export type SnapshotUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<SnapshotCreateWithoutOwnerInput, SnapshotUncheckedCreateWithoutOwnerInput> | SnapshotCreateWithoutOwnerInput[] | SnapshotUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutOwnerInput | SnapshotCreateOrConnectWithoutOwnerInput[]
    createMany?: SnapshotCreateManyOwnerInputEnvelope
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<CommentCreateWithoutAuthorInput, CommentUncheckedCreateWithoutAuthorInput> | CommentCreateWithoutAuthorInput[] | CommentUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutAuthorInput | CommentCreateOrConnectWithoutAuthorInput[]
    createMany?: CommentCreateManyAuthorInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type TimelineEventUncheckedCreateNestedManyWithoutActorInput = {
    create?: XOR<TimelineEventCreateWithoutActorInput, TimelineEventUncheckedCreateWithoutActorInput> | TimelineEventCreateWithoutActorInput[] | TimelineEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutActorInput | TimelineEventCreateOrConnectWithoutActorInput[]
    createMany?: TimelineEventCreateManyActorInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type UserSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserSessionCreateWithoutUserInput, UserSessionUncheckedCreateWithoutUserInput> | UserSessionCreateWithoutUserInput[] | UserSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSessionCreateOrConnectWithoutUserInput | UserSessionCreateOrConnectWithoutUserInput[]
    createMany?: UserSessionCreateManyUserInputEnvelope
    connect?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
  }

  export type DiffUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<DiffCreateWithoutOwnerInput, DiffUncheckedCreateWithoutOwnerInput> | DiffCreateWithoutOwnerInput[] | DiffUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutOwnerInput | DiffCreateOrConnectWithoutOwnerInput[]
    createMany?: DiffCreateManyOwnerInputEnvelope
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
  }

  export type SearchHistoryUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SearchHistoryCreateWithoutUserInput, SearchHistoryUncheckedCreateWithoutUserInput> | SearchHistoryCreateWithoutUserInput[] | SearchHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutUserInput | SearchHistoryCreateOrConnectWithoutUserInput[]
    createMany?: SearchHistoryCreateManyUserInputEnvelope
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type RepositoryUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<RepositoryCreateWithoutOwnerInput, RepositoryUncheckedCreateWithoutOwnerInput> | RepositoryCreateWithoutOwnerInput[] | RepositoryUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOwnerInput | RepositoryCreateOrConnectWithoutOwnerInput[]
    upsert?: RepositoryUpsertWithWhereUniqueWithoutOwnerInput | RepositoryUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: RepositoryCreateManyOwnerInputEnvelope
    set?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    disconnect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    delete?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    update?: RepositoryUpdateWithWhereUniqueWithoutOwnerInput | RepositoryUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: RepositoryUpdateManyWithWhereWithoutOwnerInput | RepositoryUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
  }

  export type SnapshotUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<SnapshotCreateWithoutOwnerInput, SnapshotUncheckedCreateWithoutOwnerInput> | SnapshotCreateWithoutOwnerInput[] | SnapshotUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutOwnerInput | SnapshotCreateOrConnectWithoutOwnerInput[]
    upsert?: SnapshotUpsertWithWhereUniqueWithoutOwnerInput | SnapshotUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: SnapshotCreateManyOwnerInputEnvelope
    set?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    disconnect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    delete?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    update?: SnapshotUpdateWithWhereUniqueWithoutOwnerInput | SnapshotUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: SnapshotUpdateManyWithWhereWithoutOwnerInput | SnapshotUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: SnapshotScalarWhereInput | SnapshotScalarWhereInput[]
  }

  export type CommentUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<CommentCreateWithoutAuthorInput, CommentUncheckedCreateWithoutAuthorInput> | CommentCreateWithoutAuthorInput[] | CommentUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutAuthorInput | CommentCreateOrConnectWithoutAuthorInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutAuthorInput | CommentUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: CommentCreateManyAuthorInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutAuthorInput | CommentUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutAuthorInput | CommentUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type TimelineEventUpdateManyWithoutActorNestedInput = {
    create?: XOR<TimelineEventCreateWithoutActorInput, TimelineEventUncheckedCreateWithoutActorInput> | TimelineEventCreateWithoutActorInput[] | TimelineEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutActorInput | TimelineEventCreateOrConnectWithoutActorInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutActorInput | TimelineEventUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: TimelineEventCreateManyActorInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutActorInput | TimelineEventUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutActorInput | TimelineEventUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type UserSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserSessionCreateWithoutUserInput, UserSessionUncheckedCreateWithoutUserInput> | UserSessionCreateWithoutUserInput[] | UserSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSessionCreateOrConnectWithoutUserInput | UserSessionCreateOrConnectWithoutUserInput[]
    upsert?: UserSessionUpsertWithWhereUniqueWithoutUserInput | UserSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserSessionCreateManyUserInputEnvelope
    set?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    disconnect?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    delete?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    connect?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    update?: UserSessionUpdateWithWhereUniqueWithoutUserInput | UserSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserSessionUpdateManyWithWhereWithoutUserInput | UserSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserSessionScalarWhereInput | UserSessionScalarWhereInput[]
  }

  export type DiffUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<DiffCreateWithoutOwnerInput, DiffUncheckedCreateWithoutOwnerInput> | DiffCreateWithoutOwnerInput[] | DiffUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutOwnerInput | DiffCreateOrConnectWithoutOwnerInput[]
    upsert?: DiffUpsertWithWhereUniqueWithoutOwnerInput | DiffUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: DiffCreateManyOwnerInputEnvelope
    set?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    disconnect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    delete?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    update?: DiffUpdateWithWhereUniqueWithoutOwnerInput | DiffUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: DiffUpdateManyWithWhereWithoutOwnerInput | DiffUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: DiffScalarWhereInput | DiffScalarWhereInput[]
  }

  export type SearchHistoryUpdateManyWithoutUserNestedInput = {
    create?: XOR<SearchHistoryCreateWithoutUserInput, SearchHistoryUncheckedCreateWithoutUserInput> | SearchHistoryCreateWithoutUserInput[] | SearchHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutUserInput | SearchHistoryCreateOrConnectWithoutUserInput[]
    upsert?: SearchHistoryUpsertWithWhereUniqueWithoutUserInput | SearchHistoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SearchHistoryCreateManyUserInputEnvelope
    set?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    disconnect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    delete?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    update?: SearchHistoryUpdateWithWhereUniqueWithoutUserInput | SearchHistoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SearchHistoryUpdateManyWithWhereWithoutUserInput | SearchHistoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
  }

  export type RepositoryUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<RepositoryCreateWithoutOwnerInput, RepositoryUncheckedCreateWithoutOwnerInput> | RepositoryCreateWithoutOwnerInput[] | RepositoryUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOwnerInput | RepositoryCreateOrConnectWithoutOwnerInput[]
    upsert?: RepositoryUpsertWithWhereUniqueWithoutOwnerInput | RepositoryUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: RepositoryCreateManyOwnerInputEnvelope
    set?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    disconnect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    delete?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    update?: RepositoryUpdateWithWhereUniqueWithoutOwnerInput | RepositoryUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: RepositoryUpdateManyWithWhereWithoutOwnerInput | RepositoryUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
  }

  export type SnapshotUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<SnapshotCreateWithoutOwnerInput, SnapshotUncheckedCreateWithoutOwnerInput> | SnapshotCreateWithoutOwnerInput[] | SnapshotUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutOwnerInput | SnapshotCreateOrConnectWithoutOwnerInput[]
    upsert?: SnapshotUpsertWithWhereUniqueWithoutOwnerInput | SnapshotUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: SnapshotCreateManyOwnerInputEnvelope
    set?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    disconnect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    delete?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    update?: SnapshotUpdateWithWhereUniqueWithoutOwnerInput | SnapshotUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: SnapshotUpdateManyWithWhereWithoutOwnerInput | SnapshotUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: SnapshotScalarWhereInput | SnapshotScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<CommentCreateWithoutAuthorInput, CommentUncheckedCreateWithoutAuthorInput> | CommentCreateWithoutAuthorInput[] | CommentUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutAuthorInput | CommentCreateOrConnectWithoutAuthorInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutAuthorInput | CommentUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: CommentCreateManyAuthorInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutAuthorInput | CommentUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutAuthorInput | CommentUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type TimelineEventUncheckedUpdateManyWithoutActorNestedInput = {
    create?: XOR<TimelineEventCreateWithoutActorInput, TimelineEventUncheckedCreateWithoutActorInput> | TimelineEventCreateWithoutActorInput[] | TimelineEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutActorInput | TimelineEventCreateOrConnectWithoutActorInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutActorInput | TimelineEventUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: TimelineEventCreateManyActorInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutActorInput | TimelineEventUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutActorInput | TimelineEventUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type UserSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserSessionCreateWithoutUserInput, UserSessionUncheckedCreateWithoutUserInput> | UserSessionCreateWithoutUserInput[] | UserSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSessionCreateOrConnectWithoutUserInput | UserSessionCreateOrConnectWithoutUserInput[]
    upsert?: UserSessionUpsertWithWhereUniqueWithoutUserInput | UserSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserSessionCreateManyUserInputEnvelope
    set?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    disconnect?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    delete?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    connect?: UserSessionWhereUniqueInput | UserSessionWhereUniqueInput[]
    update?: UserSessionUpdateWithWhereUniqueWithoutUserInput | UserSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserSessionUpdateManyWithWhereWithoutUserInput | UserSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserSessionScalarWhereInput | UserSessionScalarWhereInput[]
  }

  export type DiffUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<DiffCreateWithoutOwnerInput, DiffUncheckedCreateWithoutOwnerInput> | DiffCreateWithoutOwnerInput[] | DiffUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutOwnerInput | DiffCreateOrConnectWithoutOwnerInput[]
    upsert?: DiffUpsertWithWhereUniqueWithoutOwnerInput | DiffUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: DiffCreateManyOwnerInputEnvelope
    set?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    disconnect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    delete?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    update?: DiffUpdateWithWhereUniqueWithoutOwnerInput | DiffUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: DiffUpdateManyWithWhereWithoutOwnerInput | DiffUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: DiffScalarWhereInput | DiffScalarWhereInput[]
  }

  export type SearchHistoryUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SearchHistoryCreateWithoutUserInput, SearchHistoryUncheckedCreateWithoutUserInput> | SearchHistoryCreateWithoutUserInput[] | SearchHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutUserInput | SearchHistoryCreateOrConnectWithoutUserInput[]
    upsert?: SearchHistoryUpsertWithWhereUniqueWithoutUserInput | SearchHistoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SearchHistoryCreateManyUserInputEnvelope
    set?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    disconnect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    delete?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    update?: SearchHistoryUpdateWithWhereUniqueWithoutUserInput | SearchHistoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SearchHistoryUpdateManyWithWhereWithoutUserInput | SearchHistoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserCreateNestedOneWithoutOwnedRepositoriesInput = {
    create?: XOR<UserCreateWithoutOwnedRepositoriesInput, UserUncheckedCreateWithoutOwnedRepositoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedRepositoriesInput
    connect?: UserWhereUniqueInput
  }

  export type SnapshotCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<SnapshotCreateWithoutRepositoryInput, SnapshotUncheckedCreateWithoutRepositoryInput> | SnapshotCreateWithoutRepositoryInput[] | SnapshotUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutRepositoryInput | SnapshotCreateOrConnectWithoutRepositoryInput[]
    createMany?: SnapshotCreateManyRepositoryInputEnvelope
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
  }

  export type TimelineEventCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<TimelineEventCreateWithoutRepositoryInput, TimelineEventUncheckedCreateWithoutRepositoryInput> | TimelineEventCreateWithoutRepositoryInput[] | TimelineEventUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutRepositoryInput | TimelineEventCreateOrConnectWithoutRepositoryInput[]
    createMany?: TimelineEventCreateManyRepositoryInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type DiffCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<DiffCreateWithoutRepositoryInput, DiffUncheckedCreateWithoutRepositoryInput> | DiffCreateWithoutRepositoryInput[] | DiffUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutRepositoryInput | DiffCreateOrConnectWithoutRepositoryInput[]
    createMany?: DiffCreateManyRepositoryInputEnvelope
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
  }

  export type SearchHistoryCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<SearchHistoryCreateWithoutRepositoryInput, SearchHistoryUncheckedCreateWithoutRepositoryInput> | SearchHistoryCreateWithoutRepositoryInput[] | SearchHistoryUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutRepositoryInput | SearchHistoryCreateOrConnectWithoutRepositoryInput[]
    createMany?: SearchHistoryCreateManyRepositoryInputEnvelope
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
  }

  export type SnapshotUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<SnapshotCreateWithoutRepositoryInput, SnapshotUncheckedCreateWithoutRepositoryInput> | SnapshotCreateWithoutRepositoryInput[] | SnapshotUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutRepositoryInput | SnapshotCreateOrConnectWithoutRepositoryInput[]
    createMany?: SnapshotCreateManyRepositoryInputEnvelope
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
  }

  export type TimelineEventUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<TimelineEventCreateWithoutRepositoryInput, TimelineEventUncheckedCreateWithoutRepositoryInput> | TimelineEventCreateWithoutRepositoryInput[] | TimelineEventUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutRepositoryInput | TimelineEventCreateOrConnectWithoutRepositoryInput[]
    createMany?: TimelineEventCreateManyRepositoryInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type DiffUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<DiffCreateWithoutRepositoryInput, DiffUncheckedCreateWithoutRepositoryInput> | DiffCreateWithoutRepositoryInput[] | DiffUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutRepositoryInput | DiffCreateOrConnectWithoutRepositoryInput[]
    createMany?: DiffCreateManyRepositoryInputEnvelope
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
  }

  export type SearchHistoryUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<SearchHistoryCreateWithoutRepositoryInput, SearchHistoryUncheckedCreateWithoutRepositoryInput> | SearchHistoryCreateWithoutRepositoryInput[] | SearchHistoryUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutRepositoryInput | SearchHistoryCreateOrConnectWithoutRepositoryInput[]
    createMany?: SearchHistoryCreateManyRepositoryInputEnvelope
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
  }

  export type EnumRepositoryVisibilityFieldUpdateOperationsInput = {
    set?: $Enums.RepositoryVisibility
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutOwnedRepositoriesNestedInput = {
    create?: XOR<UserCreateWithoutOwnedRepositoriesInput, UserUncheckedCreateWithoutOwnedRepositoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedRepositoriesInput
    upsert?: UserUpsertWithoutOwnedRepositoriesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOwnedRepositoriesInput, UserUpdateWithoutOwnedRepositoriesInput>, UserUncheckedUpdateWithoutOwnedRepositoriesInput>
  }

  export type SnapshotUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<SnapshotCreateWithoutRepositoryInput, SnapshotUncheckedCreateWithoutRepositoryInput> | SnapshotCreateWithoutRepositoryInput[] | SnapshotUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutRepositoryInput | SnapshotCreateOrConnectWithoutRepositoryInput[]
    upsert?: SnapshotUpsertWithWhereUniqueWithoutRepositoryInput | SnapshotUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: SnapshotCreateManyRepositoryInputEnvelope
    set?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    disconnect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    delete?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    update?: SnapshotUpdateWithWhereUniqueWithoutRepositoryInput | SnapshotUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: SnapshotUpdateManyWithWhereWithoutRepositoryInput | SnapshotUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: SnapshotScalarWhereInput | SnapshotScalarWhereInput[]
  }

  export type TimelineEventUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<TimelineEventCreateWithoutRepositoryInput, TimelineEventUncheckedCreateWithoutRepositoryInput> | TimelineEventCreateWithoutRepositoryInput[] | TimelineEventUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutRepositoryInput | TimelineEventCreateOrConnectWithoutRepositoryInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutRepositoryInput | TimelineEventUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: TimelineEventCreateManyRepositoryInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutRepositoryInput | TimelineEventUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutRepositoryInput | TimelineEventUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type DiffUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<DiffCreateWithoutRepositoryInput, DiffUncheckedCreateWithoutRepositoryInput> | DiffCreateWithoutRepositoryInput[] | DiffUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutRepositoryInput | DiffCreateOrConnectWithoutRepositoryInput[]
    upsert?: DiffUpsertWithWhereUniqueWithoutRepositoryInput | DiffUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: DiffCreateManyRepositoryInputEnvelope
    set?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    disconnect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    delete?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    update?: DiffUpdateWithWhereUniqueWithoutRepositoryInput | DiffUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: DiffUpdateManyWithWhereWithoutRepositoryInput | DiffUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: DiffScalarWhereInput | DiffScalarWhereInput[]
  }

  export type SearchHistoryUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<SearchHistoryCreateWithoutRepositoryInput, SearchHistoryUncheckedCreateWithoutRepositoryInput> | SearchHistoryCreateWithoutRepositoryInput[] | SearchHistoryUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutRepositoryInput | SearchHistoryCreateOrConnectWithoutRepositoryInput[]
    upsert?: SearchHistoryUpsertWithWhereUniqueWithoutRepositoryInput | SearchHistoryUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: SearchHistoryCreateManyRepositoryInputEnvelope
    set?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    disconnect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    delete?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    update?: SearchHistoryUpdateWithWhereUniqueWithoutRepositoryInput | SearchHistoryUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: SearchHistoryUpdateManyWithWhereWithoutRepositoryInput | SearchHistoryUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
  }

  export type SnapshotUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<SnapshotCreateWithoutRepositoryInput, SnapshotUncheckedCreateWithoutRepositoryInput> | SnapshotCreateWithoutRepositoryInput[] | SnapshotUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SnapshotCreateOrConnectWithoutRepositoryInput | SnapshotCreateOrConnectWithoutRepositoryInput[]
    upsert?: SnapshotUpsertWithWhereUniqueWithoutRepositoryInput | SnapshotUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: SnapshotCreateManyRepositoryInputEnvelope
    set?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    disconnect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    delete?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    connect?: SnapshotWhereUniqueInput | SnapshotWhereUniqueInput[]
    update?: SnapshotUpdateWithWhereUniqueWithoutRepositoryInput | SnapshotUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: SnapshotUpdateManyWithWhereWithoutRepositoryInput | SnapshotUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: SnapshotScalarWhereInput | SnapshotScalarWhereInput[]
  }

  export type TimelineEventUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<TimelineEventCreateWithoutRepositoryInput, TimelineEventUncheckedCreateWithoutRepositoryInput> | TimelineEventCreateWithoutRepositoryInput[] | TimelineEventUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutRepositoryInput | TimelineEventCreateOrConnectWithoutRepositoryInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutRepositoryInput | TimelineEventUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: TimelineEventCreateManyRepositoryInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutRepositoryInput | TimelineEventUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutRepositoryInput | TimelineEventUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type DiffUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<DiffCreateWithoutRepositoryInput, DiffUncheckedCreateWithoutRepositoryInput> | DiffCreateWithoutRepositoryInput[] | DiffUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: DiffCreateOrConnectWithoutRepositoryInput | DiffCreateOrConnectWithoutRepositoryInput[]
    upsert?: DiffUpsertWithWhereUniqueWithoutRepositoryInput | DiffUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: DiffCreateManyRepositoryInputEnvelope
    set?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    disconnect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    delete?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    connect?: DiffWhereUniqueInput | DiffWhereUniqueInput[]
    update?: DiffUpdateWithWhereUniqueWithoutRepositoryInput | DiffUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: DiffUpdateManyWithWhereWithoutRepositoryInput | DiffUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: DiffScalarWhereInput | DiffScalarWhereInput[]
  }

  export type SearchHistoryUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<SearchHistoryCreateWithoutRepositoryInput, SearchHistoryUncheckedCreateWithoutRepositoryInput> | SearchHistoryCreateWithoutRepositoryInput[] | SearchHistoryUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutRepositoryInput | SearchHistoryCreateOrConnectWithoutRepositoryInput[]
    upsert?: SearchHistoryUpsertWithWhereUniqueWithoutRepositoryInput | SearchHistoryUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: SearchHistoryCreateManyRepositoryInputEnvelope
    set?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    disconnect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    delete?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    update?: SearchHistoryUpdateWithWhereUniqueWithoutRepositoryInput | SearchHistoryUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: SearchHistoryUpdateManyWithWhereWithoutRepositoryInput | SearchHistoryUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
  }

  export type RepositoryCreateNestedOneWithoutSnapshotsInput = {
    create?: XOR<RepositoryCreateWithoutSnapshotsInput, RepositoryUncheckedCreateWithoutSnapshotsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutSnapshotsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutSnapshotsInput = {
    create?: XOR<UserCreateWithoutSnapshotsInput, UserUncheckedCreateWithoutSnapshotsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSnapshotsInput
    connect?: UserWhereUniqueInput
  }

  export type CommentCreateNestedManyWithoutSnapshotInput = {
    create?: XOR<CommentCreateWithoutSnapshotInput, CommentUncheckedCreateWithoutSnapshotInput> | CommentCreateWithoutSnapshotInput[] | CommentUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutSnapshotInput | CommentCreateOrConnectWithoutSnapshotInput[]
    createMany?: CommentCreateManySnapshotInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type TimelineEventCreateNestedManyWithoutSnapshotInput = {
    create?: XOR<TimelineEventCreateWithoutSnapshotInput, TimelineEventUncheckedCreateWithoutSnapshotInput> | TimelineEventCreateWithoutSnapshotInput[] | TimelineEventUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutSnapshotInput | TimelineEventCreateOrConnectWithoutSnapshotInput[]
    createMany?: TimelineEventCreateManySnapshotInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type SearchHistoryCreateNestedManyWithoutSnapshotInput = {
    create?: XOR<SearchHistoryCreateWithoutSnapshotInput, SearchHistoryUncheckedCreateWithoutSnapshotInput> | SearchHistoryCreateWithoutSnapshotInput[] | SearchHistoryUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutSnapshotInput | SearchHistoryCreateOrConnectWithoutSnapshotInput[]
    createMany?: SearchHistoryCreateManySnapshotInputEnvelope
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutSnapshotInput = {
    create?: XOR<CommentCreateWithoutSnapshotInput, CommentUncheckedCreateWithoutSnapshotInput> | CommentCreateWithoutSnapshotInput[] | CommentUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutSnapshotInput | CommentCreateOrConnectWithoutSnapshotInput[]
    createMany?: CommentCreateManySnapshotInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type TimelineEventUncheckedCreateNestedManyWithoutSnapshotInput = {
    create?: XOR<TimelineEventCreateWithoutSnapshotInput, TimelineEventUncheckedCreateWithoutSnapshotInput> | TimelineEventCreateWithoutSnapshotInput[] | TimelineEventUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutSnapshotInput | TimelineEventCreateOrConnectWithoutSnapshotInput[]
    createMany?: TimelineEventCreateManySnapshotInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type SearchHistoryUncheckedCreateNestedManyWithoutSnapshotInput = {
    create?: XOR<SearchHistoryCreateWithoutSnapshotInput, SearchHistoryUncheckedCreateWithoutSnapshotInput> | SearchHistoryCreateWithoutSnapshotInput[] | SearchHistoryUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutSnapshotInput | SearchHistoryCreateOrConnectWithoutSnapshotInput[]
    createMany?: SearchHistoryCreateManySnapshotInputEnvelope
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
  }

  export type EnumSnapshotStatusFieldUpdateOperationsInput = {
    set?: $Enums.SnapshotStatus
  }

  export type RepositoryUpdateOneRequiredWithoutSnapshotsNestedInput = {
    create?: XOR<RepositoryCreateWithoutSnapshotsInput, RepositoryUncheckedCreateWithoutSnapshotsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutSnapshotsInput
    upsert?: RepositoryUpsertWithoutSnapshotsInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutSnapshotsInput, RepositoryUpdateWithoutSnapshotsInput>, RepositoryUncheckedUpdateWithoutSnapshotsInput>
  }

  export type UserUpdateOneRequiredWithoutSnapshotsNestedInput = {
    create?: XOR<UserCreateWithoutSnapshotsInput, UserUncheckedCreateWithoutSnapshotsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSnapshotsInput
    upsert?: UserUpsertWithoutSnapshotsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSnapshotsInput, UserUpdateWithoutSnapshotsInput>, UserUncheckedUpdateWithoutSnapshotsInput>
  }

  export type CommentUpdateManyWithoutSnapshotNestedInput = {
    create?: XOR<CommentCreateWithoutSnapshotInput, CommentUncheckedCreateWithoutSnapshotInput> | CommentCreateWithoutSnapshotInput[] | CommentUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutSnapshotInput | CommentCreateOrConnectWithoutSnapshotInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutSnapshotInput | CommentUpsertWithWhereUniqueWithoutSnapshotInput[]
    createMany?: CommentCreateManySnapshotInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutSnapshotInput | CommentUpdateWithWhereUniqueWithoutSnapshotInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutSnapshotInput | CommentUpdateManyWithWhereWithoutSnapshotInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type TimelineEventUpdateManyWithoutSnapshotNestedInput = {
    create?: XOR<TimelineEventCreateWithoutSnapshotInput, TimelineEventUncheckedCreateWithoutSnapshotInput> | TimelineEventCreateWithoutSnapshotInput[] | TimelineEventUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutSnapshotInput | TimelineEventCreateOrConnectWithoutSnapshotInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutSnapshotInput | TimelineEventUpsertWithWhereUniqueWithoutSnapshotInput[]
    createMany?: TimelineEventCreateManySnapshotInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutSnapshotInput | TimelineEventUpdateWithWhereUniqueWithoutSnapshotInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutSnapshotInput | TimelineEventUpdateManyWithWhereWithoutSnapshotInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type SearchHistoryUpdateManyWithoutSnapshotNestedInput = {
    create?: XOR<SearchHistoryCreateWithoutSnapshotInput, SearchHistoryUncheckedCreateWithoutSnapshotInput> | SearchHistoryCreateWithoutSnapshotInput[] | SearchHistoryUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutSnapshotInput | SearchHistoryCreateOrConnectWithoutSnapshotInput[]
    upsert?: SearchHistoryUpsertWithWhereUniqueWithoutSnapshotInput | SearchHistoryUpsertWithWhereUniqueWithoutSnapshotInput[]
    createMany?: SearchHistoryCreateManySnapshotInputEnvelope
    set?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    disconnect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    delete?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    update?: SearchHistoryUpdateWithWhereUniqueWithoutSnapshotInput | SearchHistoryUpdateWithWhereUniqueWithoutSnapshotInput[]
    updateMany?: SearchHistoryUpdateManyWithWhereWithoutSnapshotInput | SearchHistoryUpdateManyWithWhereWithoutSnapshotInput[]
    deleteMany?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutSnapshotNestedInput = {
    create?: XOR<CommentCreateWithoutSnapshotInput, CommentUncheckedCreateWithoutSnapshotInput> | CommentCreateWithoutSnapshotInput[] | CommentUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutSnapshotInput | CommentCreateOrConnectWithoutSnapshotInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutSnapshotInput | CommentUpsertWithWhereUniqueWithoutSnapshotInput[]
    createMany?: CommentCreateManySnapshotInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutSnapshotInput | CommentUpdateWithWhereUniqueWithoutSnapshotInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutSnapshotInput | CommentUpdateManyWithWhereWithoutSnapshotInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type TimelineEventUncheckedUpdateManyWithoutSnapshotNestedInput = {
    create?: XOR<TimelineEventCreateWithoutSnapshotInput, TimelineEventUncheckedCreateWithoutSnapshotInput> | TimelineEventCreateWithoutSnapshotInput[] | TimelineEventUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutSnapshotInput | TimelineEventCreateOrConnectWithoutSnapshotInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutSnapshotInput | TimelineEventUpsertWithWhereUniqueWithoutSnapshotInput[]
    createMany?: TimelineEventCreateManySnapshotInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutSnapshotInput | TimelineEventUpdateWithWhereUniqueWithoutSnapshotInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutSnapshotInput | TimelineEventUpdateManyWithWhereWithoutSnapshotInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type SearchHistoryUncheckedUpdateManyWithoutSnapshotNestedInput = {
    create?: XOR<SearchHistoryCreateWithoutSnapshotInput, SearchHistoryUncheckedCreateWithoutSnapshotInput> | SearchHistoryCreateWithoutSnapshotInput[] | SearchHistoryUncheckedCreateWithoutSnapshotInput[]
    connectOrCreate?: SearchHistoryCreateOrConnectWithoutSnapshotInput | SearchHistoryCreateOrConnectWithoutSnapshotInput[]
    upsert?: SearchHistoryUpsertWithWhereUniqueWithoutSnapshotInput | SearchHistoryUpsertWithWhereUniqueWithoutSnapshotInput[]
    createMany?: SearchHistoryCreateManySnapshotInputEnvelope
    set?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    disconnect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    delete?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    connect?: SearchHistoryWhereUniqueInput | SearchHistoryWhereUniqueInput[]
    update?: SearchHistoryUpdateWithWhereUniqueWithoutSnapshotInput | SearchHistoryUpdateWithWhereUniqueWithoutSnapshotInput[]
    updateMany?: SearchHistoryUpdateManyWithWhereWithoutSnapshotInput | SearchHistoryUpdateManyWithWhereWithoutSnapshotInput[]
    deleteMany?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
  }

  export type SnapshotCreateNestedOneWithoutCommentsInput = {
    create?: XOR<SnapshotCreateWithoutCommentsInput, SnapshotUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: SnapshotCreateOrConnectWithoutCommentsInput
    connect?: SnapshotWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutCommentsInput = {
    create?: XOR<UserCreateWithoutCommentsInput, UserUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCommentsInput
    connect?: UserWhereUniqueInput
  }

  export type CommentCreateNestedOneWithoutRepliesInput = {
    create?: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
    connectOrCreate?: CommentCreateOrConnectWithoutRepliesInput
    connect?: CommentWhereUniqueInput
  }

  export type CommentCreateNestedManyWithoutParentInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type TimelineEventCreateNestedManyWithoutCommentInput = {
    create?: XOR<TimelineEventCreateWithoutCommentInput, TimelineEventUncheckedCreateWithoutCommentInput> | TimelineEventCreateWithoutCommentInput[] | TimelineEventUncheckedCreateWithoutCommentInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutCommentInput | TimelineEventCreateOrConnectWithoutCommentInput[]
    createMany?: TimelineEventCreateManyCommentInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type TimelineEventUncheckedCreateNestedManyWithoutCommentInput = {
    create?: XOR<TimelineEventCreateWithoutCommentInput, TimelineEventUncheckedCreateWithoutCommentInput> | TimelineEventCreateWithoutCommentInput[] | TimelineEventUncheckedCreateWithoutCommentInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutCommentInput | TimelineEventCreateOrConnectWithoutCommentInput[]
    createMany?: TimelineEventCreateManyCommentInputEnvelope
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
  }

  export type EnumCommentAnchorTypeFieldUpdateOperationsInput = {
    set?: $Enums.CommentAnchorType
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumCommentStatusFieldUpdateOperationsInput = {
    set?: $Enums.CommentStatus
  }

  export type SnapshotUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<SnapshotCreateWithoutCommentsInput, SnapshotUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: SnapshotCreateOrConnectWithoutCommentsInput
    upsert?: SnapshotUpsertWithoutCommentsInput
    connect?: SnapshotWhereUniqueInput
    update?: XOR<XOR<SnapshotUpdateToOneWithWhereWithoutCommentsInput, SnapshotUpdateWithoutCommentsInput>, SnapshotUncheckedUpdateWithoutCommentsInput>
  }

  export type UserUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<UserCreateWithoutCommentsInput, UserUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCommentsInput
    upsert?: UserUpsertWithoutCommentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCommentsInput, UserUpdateWithoutCommentsInput>, UserUncheckedUpdateWithoutCommentsInput>
  }

  export type CommentUpdateOneWithoutRepliesNestedInput = {
    create?: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
    connectOrCreate?: CommentCreateOrConnectWithoutRepliesInput
    upsert?: CommentUpsertWithoutRepliesInput
    disconnect?: CommentWhereInput | boolean
    delete?: CommentWhereInput | boolean
    connect?: CommentWhereUniqueInput
    update?: XOR<XOR<CommentUpdateToOneWithWhereWithoutRepliesInput, CommentUpdateWithoutRepliesInput>, CommentUncheckedUpdateWithoutRepliesInput>
  }

  export type CommentUpdateManyWithoutParentNestedInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutParentInput | CommentUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutParentInput | CommentUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutParentInput | CommentUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type TimelineEventUpdateManyWithoutCommentNestedInput = {
    create?: XOR<TimelineEventCreateWithoutCommentInput, TimelineEventUncheckedCreateWithoutCommentInput> | TimelineEventCreateWithoutCommentInput[] | TimelineEventUncheckedCreateWithoutCommentInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutCommentInput | TimelineEventCreateOrConnectWithoutCommentInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutCommentInput | TimelineEventUpsertWithWhereUniqueWithoutCommentInput[]
    createMany?: TimelineEventCreateManyCommentInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutCommentInput | TimelineEventUpdateWithWhereUniqueWithoutCommentInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutCommentInput | TimelineEventUpdateManyWithWhereWithoutCommentInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutParentInput | CommentUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutParentInput | CommentUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutParentInput | CommentUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type TimelineEventUncheckedUpdateManyWithoutCommentNestedInput = {
    create?: XOR<TimelineEventCreateWithoutCommentInput, TimelineEventUncheckedCreateWithoutCommentInput> | TimelineEventCreateWithoutCommentInput[] | TimelineEventUncheckedCreateWithoutCommentInput[]
    connectOrCreate?: TimelineEventCreateOrConnectWithoutCommentInput | TimelineEventCreateOrConnectWithoutCommentInput[]
    upsert?: TimelineEventUpsertWithWhereUniqueWithoutCommentInput | TimelineEventUpsertWithWhereUniqueWithoutCommentInput[]
    createMany?: TimelineEventCreateManyCommentInputEnvelope
    set?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    disconnect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    delete?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    connect?: TimelineEventWhereUniqueInput | TimelineEventWhereUniqueInput[]
    update?: TimelineEventUpdateWithWhereUniqueWithoutCommentInput | TimelineEventUpdateWithWhereUniqueWithoutCommentInput[]
    updateMany?: TimelineEventUpdateManyWithWhereWithoutCommentInput | TimelineEventUpdateManyWithWhereWithoutCommentInput[]
    deleteMany?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
  }

  export type RepositoryCreateNestedOneWithoutTimelineEventsInput = {
    create?: XOR<RepositoryCreateWithoutTimelineEventsInput, RepositoryUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutTimelineEventsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutTimelineEventsInput = {
    create?: XOR<UserCreateWithoutTimelineEventsInput, UserUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTimelineEventsInput
    connect?: UserWhereUniqueInput
  }

  export type SnapshotCreateNestedOneWithoutTimelineEventsInput = {
    create?: XOR<SnapshotCreateWithoutTimelineEventsInput, SnapshotUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: SnapshotCreateOrConnectWithoutTimelineEventsInput
    connect?: SnapshotWhereUniqueInput
  }

  export type CommentCreateNestedOneWithoutTimelineEventsInput = {
    create?: XOR<CommentCreateWithoutTimelineEventsInput, CommentUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: CommentCreateOrConnectWithoutTimelineEventsInput
    connect?: CommentWhereUniqueInput
  }

  export type EnumTimelineEventTypeFieldUpdateOperationsInput = {
    set?: $Enums.TimelineEventType
  }

  export type RepositoryUpdateOneRequiredWithoutTimelineEventsNestedInput = {
    create?: XOR<RepositoryCreateWithoutTimelineEventsInput, RepositoryUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutTimelineEventsInput
    upsert?: RepositoryUpsertWithoutTimelineEventsInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutTimelineEventsInput, RepositoryUpdateWithoutTimelineEventsInput>, RepositoryUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type UserUpdateOneRequiredWithoutTimelineEventsNestedInput = {
    create?: XOR<UserCreateWithoutTimelineEventsInput, UserUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTimelineEventsInput
    upsert?: UserUpsertWithoutTimelineEventsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTimelineEventsInput, UserUpdateWithoutTimelineEventsInput>, UserUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type SnapshotUpdateOneWithoutTimelineEventsNestedInput = {
    create?: XOR<SnapshotCreateWithoutTimelineEventsInput, SnapshotUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: SnapshotCreateOrConnectWithoutTimelineEventsInput
    upsert?: SnapshotUpsertWithoutTimelineEventsInput
    disconnect?: SnapshotWhereInput | boolean
    delete?: SnapshotWhereInput | boolean
    connect?: SnapshotWhereUniqueInput
    update?: XOR<XOR<SnapshotUpdateToOneWithWhereWithoutTimelineEventsInput, SnapshotUpdateWithoutTimelineEventsInput>, SnapshotUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type CommentUpdateOneWithoutTimelineEventsNestedInput = {
    create?: XOR<CommentCreateWithoutTimelineEventsInput, CommentUncheckedCreateWithoutTimelineEventsInput>
    connectOrCreate?: CommentCreateOrConnectWithoutTimelineEventsInput
    upsert?: CommentUpsertWithoutTimelineEventsInput
    disconnect?: CommentWhereInput | boolean
    delete?: CommentWhereInput | boolean
    connect?: CommentWhereUniqueInput
    update?: XOR<XOR<CommentUpdateToOneWithWhereWithoutTimelineEventsInput, CommentUpdateWithoutTimelineEventsInput>, CommentUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type RepositoryCreateNestedOneWithoutDiffsInput = {
    create?: XOR<RepositoryCreateWithoutDiffsInput, RepositoryUncheckedCreateWithoutDiffsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutDiffsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutDiffsInput = {
    create?: XOR<UserCreateWithoutDiffsInput, UserUncheckedCreateWithoutDiffsInput>
    connectOrCreate?: UserCreateOrConnectWithoutDiffsInput
    connect?: UserWhereUniqueInput
  }

  export type DiffFileCreateNestedManyWithoutDiffInput = {
    create?: XOR<DiffFileCreateWithoutDiffInput, DiffFileUncheckedCreateWithoutDiffInput> | DiffFileCreateWithoutDiffInput[] | DiffFileUncheckedCreateWithoutDiffInput[]
    connectOrCreate?: DiffFileCreateOrConnectWithoutDiffInput | DiffFileCreateOrConnectWithoutDiffInput[]
    createMany?: DiffFileCreateManyDiffInputEnvelope
    connect?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
  }

  export type DiffFileUncheckedCreateNestedManyWithoutDiffInput = {
    create?: XOR<DiffFileCreateWithoutDiffInput, DiffFileUncheckedCreateWithoutDiffInput> | DiffFileCreateWithoutDiffInput[] | DiffFileUncheckedCreateWithoutDiffInput[]
    connectOrCreate?: DiffFileCreateOrConnectWithoutDiffInput | DiffFileCreateOrConnectWithoutDiffInput[]
    createMany?: DiffFileCreateManyDiffInputEnvelope
    connect?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
  }

  export type EnumDiffTypeFieldUpdateOperationsInput = {
    set?: $Enums.DiffType
  }

  export type EnumDiffStatusFieldUpdateOperationsInput = {
    set?: $Enums.DiffStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RepositoryUpdateOneRequiredWithoutDiffsNestedInput = {
    create?: XOR<RepositoryCreateWithoutDiffsInput, RepositoryUncheckedCreateWithoutDiffsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutDiffsInput
    upsert?: RepositoryUpsertWithoutDiffsInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutDiffsInput, RepositoryUpdateWithoutDiffsInput>, RepositoryUncheckedUpdateWithoutDiffsInput>
  }

  export type UserUpdateOneRequiredWithoutDiffsNestedInput = {
    create?: XOR<UserCreateWithoutDiffsInput, UserUncheckedCreateWithoutDiffsInput>
    connectOrCreate?: UserCreateOrConnectWithoutDiffsInput
    upsert?: UserUpsertWithoutDiffsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDiffsInput, UserUpdateWithoutDiffsInput>, UserUncheckedUpdateWithoutDiffsInput>
  }

  export type DiffFileUpdateManyWithoutDiffNestedInput = {
    create?: XOR<DiffFileCreateWithoutDiffInput, DiffFileUncheckedCreateWithoutDiffInput> | DiffFileCreateWithoutDiffInput[] | DiffFileUncheckedCreateWithoutDiffInput[]
    connectOrCreate?: DiffFileCreateOrConnectWithoutDiffInput | DiffFileCreateOrConnectWithoutDiffInput[]
    upsert?: DiffFileUpsertWithWhereUniqueWithoutDiffInput | DiffFileUpsertWithWhereUniqueWithoutDiffInput[]
    createMany?: DiffFileCreateManyDiffInputEnvelope
    set?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    disconnect?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    delete?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    connect?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    update?: DiffFileUpdateWithWhereUniqueWithoutDiffInput | DiffFileUpdateWithWhereUniqueWithoutDiffInput[]
    updateMany?: DiffFileUpdateManyWithWhereWithoutDiffInput | DiffFileUpdateManyWithWhereWithoutDiffInput[]
    deleteMany?: DiffFileScalarWhereInput | DiffFileScalarWhereInput[]
  }

  export type DiffFileUncheckedUpdateManyWithoutDiffNestedInput = {
    create?: XOR<DiffFileCreateWithoutDiffInput, DiffFileUncheckedCreateWithoutDiffInput> | DiffFileCreateWithoutDiffInput[] | DiffFileUncheckedCreateWithoutDiffInput[]
    connectOrCreate?: DiffFileCreateOrConnectWithoutDiffInput | DiffFileCreateOrConnectWithoutDiffInput[]
    upsert?: DiffFileUpsertWithWhereUniqueWithoutDiffInput | DiffFileUpsertWithWhereUniqueWithoutDiffInput[]
    createMany?: DiffFileCreateManyDiffInputEnvelope
    set?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    disconnect?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    delete?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    connect?: DiffFileWhereUniqueInput | DiffFileWhereUniqueInput[]
    update?: DiffFileUpdateWithWhereUniqueWithoutDiffInput | DiffFileUpdateWithWhereUniqueWithoutDiffInput[]
    updateMany?: DiffFileUpdateManyWithWhereWithoutDiffInput | DiffFileUpdateManyWithWhereWithoutDiffInput[]
    deleteMany?: DiffFileScalarWhereInput | DiffFileScalarWhereInput[]
  }

  export type DiffCreateNestedOneWithoutFilesInput = {
    create?: XOR<DiffCreateWithoutFilesInput, DiffUncheckedCreateWithoutFilesInput>
    connectOrCreate?: DiffCreateOrConnectWithoutFilesInput
    connect?: DiffWhereUniqueInput
  }

  export type EnumFileChangeTypeFieldUpdateOperationsInput = {
    set?: $Enums.FileChangeType
  }

  export type DiffUpdateOneRequiredWithoutFilesNestedInput = {
    create?: XOR<DiffCreateWithoutFilesInput, DiffUncheckedCreateWithoutFilesInput>
    connectOrCreate?: DiffCreateOrConnectWithoutFilesInput
    upsert?: DiffUpsertWithoutFilesInput
    connect?: DiffWhereUniqueInput
    update?: XOR<XOR<DiffUpdateToOneWithWhereWithoutFilesInput, DiffUpdateWithoutFilesInput>, DiffUncheckedUpdateWithoutFilesInput>
  }

  export type UserCreateNestedOneWithoutSearchHistoryInput = {
    create?: XOR<UserCreateWithoutSearchHistoryInput, UserUncheckedCreateWithoutSearchHistoryInput>
    connectOrCreate?: UserCreateOrConnectWithoutSearchHistoryInput
    connect?: UserWhereUniqueInput
  }

  export type RepositoryCreateNestedOneWithoutSearchHistoryInput = {
    create?: XOR<RepositoryCreateWithoutSearchHistoryInput, RepositoryUncheckedCreateWithoutSearchHistoryInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutSearchHistoryInput
    connect?: RepositoryWhereUniqueInput
  }

  export type SnapshotCreateNestedOneWithoutSearchHistoryInput = {
    create?: XOR<SnapshotCreateWithoutSearchHistoryInput, SnapshotUncheckedCreateWithoutSearchHistoryInput>
    connectOrCreate?: SnapshotCreateOrConnectWithoutSearchHistoryInput
    connect?: SnapshotWhereUniqueInput
  }

  export type EnumSearchTypeFieldUpdateOperationsInput = {
    set?: $Enums.SearchType
  }

  export type UserUpdateOneRequiredWithoutSearchHistoryNestedInput = {
    create?: XOR<UserCreateWithoutSearchHistoryInput, UserUncheckedCreateWithoutSearchHistoryInput>
    connectOrCreate?: UserCreateOrConnectWithoutSearchHistoryInput
    upsert?: UserUpsertWithoutSearchHistoryInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSearchHistoryInput, UserUpdateWithoutSearchHistoryInput>, UserUncheckedUpdateWithoutSearchHistoryInput>
  }

  export type RepositoryUpdateOneRequiredWithoutSearchHistoryNestedInput = {
    create?: XOR<RepositoryCreateWithoutSearchHistoryInput, RepositoryUncheckedCreateWithoutSearchHistoryInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutSearchHistoryInput
    upsert?: RepositoryUpsertWithoutSearchHistoryInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutSearchHistoryInput, RepositoryUpdateWithoutSearchHistoryInput>, RepositoryUncheckedUpdateWithoutSearchHistoryInput>
  }

  export type SnapshotUpdateOneWithoutSearchHistoryNestedInput = {
    create?: XOR<SnapshotCreateWithoutSearchHistoryInput, SnapshotUncheckedCreateWithoutSearchHistoryInput>
    connectOrCreate?: SnapshotCreateOrConnectWithoutSearchHistoryInput
    upsert?: SnapshotUpsertWithoutSearchHistoryInput
    disconnect?: SnapshotWhereInput | boolean
    delete?: SnapshotWhereInput | boolean
    connect?: SnapshotWhereUniqueInput
    update?: XOR<XOR<SnapshotUpdateToOneWithWhereWithoutSearchHistoryInput, SnapshotUpdateWithoutSearchHistoryInput>, SnapshotUncheckedUpdateWithoutSearchHistoryInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumRepositoryVisibilityFilter<$PrismaModel = never> = {
    equals?: $Enums.RepositoryVisibility | EnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumRepositoryVisibilityFilter<$PrismaModel> | $Enums.RepositoryVisibility
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumRepositoryVisibilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepositoryVisibility | EnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.RepositoryVisibility[] | ListEnumRepositoryVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumRepositoryVisibilityWithAggregatesFilter<$PrismaModel> | $Enums.RepositoryVisibility
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRepositoryVisibilityFilter<$PrismaModel>
    _max?: NestedEnumRepositoryVisibilityFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumSnapshotStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SnapshotStatus | EnumSnapshotStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSnapshotStatusFilter<$PrismaModel> | $Enums.SnapshotStatus
  }

  export type NestedEnumSnapshotStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SnapshotStatus | EnumSnapshotStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SnapshotStatus[] | ListEnumSnapshotStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSnapshotStatusWithAggregatesFilter<$PrismaModel> | $Enums.SnapshotStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSnapshotStatusFilter<$PrismaModel>
    _max?: NestedEnumSnapshotStatusFilter<$PrismaModel>
  }

  export type NestedEnumCommentAnchorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentAnchorType | EnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentAnchorTypeFilter<$PrismaModel> | $Enums.CommentAnchorType
  }

  export type NestedEnumCommentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentStatus | EnumCommentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentStatusFilter<$PrismaModel> | $Enums.CommentStatus
  }

  export type NestedEnumCommentAnchorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentAnchorType | EnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentAnchorType[] | ListEnumCommentAnchorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentAnchorTypeWithAggregatesFilter<$PrismaModel> | $Enums.CommentAnchorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCommentAnchorTypeFilter<$PrismaModel>
    _max?: NestedEnumCommentAnchorTypeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumCommentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CommentStatus | EnumCommentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommentStatus[] | ListEnumCommentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommentStatusWithAggregatesFilter<$PrismaModel> | $Enums.CommentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCommentStatusFilter<$PrismaModel>
    _max?: NestedEnumCommentStatusFilter<$PrismaModel>
  }

  export type NestedEnumTimelineEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineEventType | EnumTimelineEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTimelineEventTypeFilter<$PrismaModel> | $Enums.TimelineEventType
  }

  export type NestedEnumTimelineEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineEventType | EnumTimelineEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TimelineEventType[] | ListEnumTimelineEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTimelineEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.TimelineEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTimelineEventTypeFilter<$PrismaModel>
    _max?: NestedEnumTimelineEventTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumDiffTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffType | EnumDiffTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffTypeFilter<$PrismaModel> | $Enums.DiffType
  }

  export type NestedEnumDiffStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffStatus | EnumDiffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffStatusFilter<$PrismaModel> | $Enums.DiffStatus
  }

  export type NestedEnumDiffTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffType | EnumDiffTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffType[] | ListEnumDiffTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffTypeWithAggregatesFilter<$PrismaModel> | $Enums.DiffType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDiffTypeFilter<$PrismaModel>
    _max?: NestedEnumDiffTypeFilter<$PrismaModel>
  }

  export type NestedEnumDiffStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DiffStatus | EnumDiffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiffStatus[] | ListEnumDiffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDiffStatusWithAggregatesFilter<$PrismaModel> | $Enums.DiffStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDiffStatusFilter<$PrismaModel>
    _max?: NestedEnumDiffStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumFileChangeTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.FileChangeType | EnumFileChangeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumFileChangeTypeFilter<$PrismaModel> | $Enums.FileChangeType
  }

  export type NestedEnumFileChangeTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FileChangeType | EnumFileChangeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.FileChangeType[] | ListEnumFileChangeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumFileChangeTypeWithAggregatesFilter<$PrismaModel> | $Enums.FileChangeType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFileChangeTypeFilter<$PrismaModel>
    _max?: NestedEnumFileChangeTypeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumSearchTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SearchType | EnumSearchTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSearchTypeFilter<$PrismaModel> | $Enums.SearchType
  }

  export type NestedEnumSearchTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SearchType | EnumSearchTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SearchType[] | ListEnumSearchTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSearchTypeWithAggregatesFilter<$PrismaModel> | $Enums.SearchType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSearchTypeFilter<$PrismaModel>
    _max?: NestedEnumSearchTypeFilter<$PrismaModel>
  }

  export type RepositoryCreateWithoutOwnerInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutRepositoryInput
    diffs?: DiffCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutOwnerInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutRepositoryInput
    diffs?: DiffUncheckedCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutOwnerInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutOwnerInput, RepositoryUncheckedCreateWithoutOwnerInput>
  }

  export type RepositoryCreateManyOwnerInputEnvelope = {
    data: RepositoryCreateManyOwnerInput | RepositoryCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type SnapshotCreateWithoutOwnerInput = {
    id?: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutSnapshotsInput
    comments?: CommentCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUncheckedCreateWithoutOwnerInput = {
    id?: string
    repoId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    comments?: CommentUncheckedCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotCreateOrConnectWithoutOwnerInput = {
    where: SnapshotWhereUniqueInput
    create: XOR<SnapshotCreateWithoutOwnerInput, SnapshotUncheckedCreateWithoutOwnerInput>
  }

  export type SnapshotCreateManyOwnerInputEnvelope = {
    data: SnapshotCreateManyOwnerInput | SnapshotCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type CommentCreateWithoutAuthorInput = {
    id?: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshot: SnapshotCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
    replies?: CommentCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutCommentInput
  }

  export type CommentUncheckedCreateWithoutAuthorInput = {
    id?: string
    snapshotId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutCommentInput
  }

  export type CommentCreateOrConnectWithoutAuthorInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutAuthorInput, CommentUncheckedCreateWithoutAuthorInput>
  }

  export type CommentCreateManyAuthorInputEnvelope = {
    data: CommentCreateManyAuthorInput | CommentCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type TimelineEventCreateWithoutActorInput = {
    id?: string
    type: $Enums.TimelineEventType
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutTimelineEventsInput
    snapshot?: SnapshotCreateNestedOneWithoutTimelineEventsInput
    comment?: CommentCreateNestedOneWithoutTimelineEventsInput
  }

  export type TimelineEventUncheckedCreateWithoutActorInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    snapshotId?: string | null
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type TimelineEventCreateOrConnectWithoutActorInput = {
    where: TimelineEventWhereUniqueInput
    create: XOR<TimelineEventCreateWithoutActorInput, TimelineEventUncheckedCreateWithoutActorInput>
  }

  export type TimelineEventCreateManyActorInputEnvelope = {
    data: TimelineEventCreateManyActorInput | TimelineEventCreateManyActorInput[]
    skipDuplicates?: boolean
  }

  export type UserSessionCreateWithoutUserInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type UserSessionUncheckedCreateWithoutUserInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type UserSessionCreateOrConnectWithoutUserInput = {
    where: UserSessionWhereUniqueInput
    create: XOR<UserSessionCreateWithoutUserInput, UserSessionUncheckedCreateWithoutUserInput>
  }

  export type UserSessionCreateManyUserInputEnvelope = {
    data: UserSessionCreateManyUserInput | UserSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DiffCreateWithoutOwnerInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutDiffsInput
    files?: DiffFileCreateNestedManyWithoutDiffInput
  }

  export type DiffUncheckedCreateWithoutOwnerInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    repositoryId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    files?: DiffFileUncheckedCreateNestedManyWithoutDiffInput
  }

  export type DiffCreateOrConnectWithoutOwnerInput = {
    where: DiffWhereUniqueInput
    create: XOR<DiffCreateWithoutOwnerInput, DiffUncheckedCreateWithoutOwnerInput>
  }

  export type DiffCreateManyOwnerInputEnvelope = {
    data: DiffCreateManyOwnerInput | DiffCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type SearchHistoryCreateWithoutUserInput = {
    id?: string
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutSearchHistoryInput
    snapshot?: SnapshotCreateNestedOneWithoutSearchHistoryInput
  }

  export type SearchHistoryUncheckedCreateWithoutUserInput = {
    id?: string
    repositoryId: string
    snapshotId?: string | null
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type SearchHistoryCreateOrConnectWithoutUserInput = {
    where: SearchHistoryWhereUniqueInput
    create: XOR<SearchHistoryCreateWithoutUserInput, SearchHistoryUncheckedCreateWithoutUserInput>
  }

  export type SearchHistoryCreateManyUserInputEnvelope = {
    data: SearchHistoryCreateManyUserInput | SearchHistoryCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RepositoryUpsertWithWhereUniqueWithoutOwnerInput = {
    where: RepositoryWhereUniqueInput
    update: XOR<RepositoryUpdateWithoutOwnerInput, RepositoryUncheckedUpdateWithoutOwnerInput>
    create: XOR<RepositoryCreateWithoutOwnerInput, RepositoryUncheckedCreateWithoutOwnerInput>
  }

  export type RepositoryUpdateWithWhereUniqueWithoutOwnerInput = {
    where: RepositoryWhereUniqueInput
    data: XOR<RepositoryUpdateWithoutOwnerInput, RepositoryUncheckedUpdateWithoutOwnerInput>
  }

  export type RepositoryUpdateManyWithWhereWithoutOwnerInput = {
    where: RepositoryScalarWhereInput
    data: XOR<RepositoryUpdateManyMutationInput, RepositoryUncheckedUpdateManyWithoutOwnerInput>
  }

  export type RepositoryScalarWhereInput = {
    AND?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
    OR?: RepositoryScalarWhereInput[]
    NOT?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
    id?: StringFilter<"Repository"> | string
    name?: StringFilter<"Repository"> | string
    gitUrl?: StringFilter<"Repository"> | string
    ownerId?: StringFilter<"Repository"> | string
    defaultBranch?: StringFilter<"Repository"> | string
    visibility?: EnumRepositoryVisibilityFilter<"Repository"> | $Enums.RepositoryVisibility
    description?: StringNullableFilter<"Repository"> | string | null
    isActive?: BoolFilter<"Repository"> | boolean
    lastSyncAt?: DateTimeNullableFilter<"Repository"> | Date | string | null
    createdAt?: DateTimeFilter<"Repository"> | Date | string
    updatedAt?: DateTimeFilter<"Repository"> | Date | string
  }

  export type SnapshotUpsertWithWhereUniqueWithoutOwnerInput = {
    where: SnapshotWhereUniqueInput
    update: XOR<SnapshotUpdateWithoutOwnerInput, SnapshotUncheckedUpdateWithoutOwnerInput>
    create: XOR<SnapshotCreateWithoutOwnerInput, SnapshotUncheckedCreateWithoutOwnerInput>
  }

  export type SnapshotUpdateWithWhereUniqueWithoutOwnerInput = {
    where: SnapshotWhereUniqueInput
    data: XOR<SnapshotUpdateWithoutOwnerInput, SnapshotUncheckedUpdateWithoutOwnerInput>
  }

  export type SnapshotUpdateManyWithWhereWithoutOwnerInput = {
    where: SnapshotScalarWhereInput
    data: XOR<SnapshotUpdateManyMutationInput, SnapshotUncheckedUpdateManyWithoutOwnerInput>
  }

  export type SnapshotScalarWhereInput = {
    AND?: SnapshotScalarWhereInput | SnapshotScalarWhereInput[]
    OR?: SnapshotScalarWhereInput[]
    NOT?: SnapshotScalarWhereInput | SnapshotScalarWhereInput[]
    id?: StringFilter<"Snapshot"> | string
    repoId?: StringFilter<"Snapshot"> | string
    ownerId?: StringFilter<"Snapshot"> | string
    commitSha?: StringFilter<"Snapshot"> | string
    branchName?: StringFilter<"Snapshot"> | string
    worktreePath?: StringNullableFilter<"Snapshot"> | string | null
    bundlePath?: StringNullableFilter<"Snapshot"> | string | null
    status?: EnumSnapshotStatusFilter<"Snapshot"> | $Enums.SnapshotStatus
    title?: StringNullableFilter<"Snapshot"> | string | null
    description?: StringNullableFilter<"Snapshot"> | string | null
    expiresAt?: DateTimeFilter<"Snapshot"> | Date | string
    processedAt?: DateTimeNullableFilter<"Snapshot"> | Date | string | null
    errorMessage?: StringNullableFilter<"Snapshot"> | string | null
    createdAt?: DateTimeFilter<"Snapshot"> | Date | string
    updatedAt?: DateTimeFilter<"Snapshot"> | Date | string
  }

  export type CommentUpsertWithWhereUniqueWithoutAuthorInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutAuthorInput, CommentUncheckedUpdateWithoutAuthorInput>
    create: XOR<CommentCreateWithoutAuthorInput, CommentUncheckedCreateWithoutAuthorInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutAuthorInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutAuthorInput, CommentUncheckedUpdateWithoutAuthorInput>
  }

  export type CommentUpdateManyWithWhereWithoutAuthorInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutAuthorInput>
  }

  export type CommentScalarWhereInput = {
    AND?: CommentScalarWhereInput | CommentScalarWhereInput[]
    OR?: CommentScalarWhereInput[]
    NOT?: CommentScalarWhereInput | CommentScalarWhereInput[]
    id?: StringFilter<"Comment"> | string
    snapshotId?: StringFilter<"Comment"> | string
    authorId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    anchorType?: EnumCommentAnchorTypeFilter<"Comment"> | $Enums.CommentAnchorType
    commitSha?: StringNullableFilter<"Comment"> | string | null
    filePath?: StringNullableFilter<"Comment"> | string | null
    lineStart?: IntNullableFilter<"Comment"> | number | null
    lineEnd?: IntNullableFilter<"Comment"> | number | null
    status?: EnumCommentStatusFilter<"Comment"> | $Enums.CommentStatus
    parentId?: StringNullableFilter<"Comment"> | string | null
    isResolved?: BoolFilter<"Comment"> | boolean
    resolvedAt?: DateTimeNullableFilter<"Comment"> | Date | string | null
    resolvedBy?: StringNullableFilter<"Comment"> | string | null
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
  }

  export type TimelineEventUpsertWithWhereUniqueWithoutActorInput = {
    where: TimelineEventWhereUniqueInput
    update: XOR<TimelineEventUpdateWithoutActorInput, TimelineEventUncheckedUpdateWithoutActorInput>
    create: XOR<TimelineEventCreateWithoutActorInput, TimelineEventUncheckedCreateWithoutActorInput>
  }

  export type TimelineEventUpdateWithWhereUniqueWithoutActorInput = {
    where: TimelineEventWhereUniqueInput
    data: XOR<TimelineEventUpdateWithoutActorInput, TimelineEventUncheckedUpdateWithoutActorInput>
  }

  export type TimelineEventUpdateManyWithWhereWithoutActorInput = {
    where: TimelineEventScalarWhereInput
    data: XOR<TimelineEventUpdateManyMutationInput, TimelineEventUncheckedUpdateManyWithoutActorInput>
  }

  export type TimelineEventScalarWhereInput = {
    AND?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
    OR?: TimelineEventScalarWhereInput[]
    NOT?: TimelineEventScalarWhereInput | TimelineEventScalarWhereInput[]
    id?: StringFilter<"TimelineEvent"> | string
    repoId?: StringFilter<"TimelineEvent"> | string
    type?: EnumTimelineEventTypeFilter<"TimelineEvent"> | $Enums.TimelineEventType
    actorId?: StringFilter<"TimelineEvent"> | string
    snapshotId?: StringNullableFilter<"TimelineEvent"> | string | null
    commentId?: StringNullableFilter<"TimelineEvent"> | string | null
    payload?: JsonFilter<"TimelineEvent">
    createdAt?: DateTimeFilter<"TimelineEvent"> | Date | string
  }

  export type UserSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: UserSessionWhereUniqueInput
    update: XOR<UserSessionUpdateWithoutUserInput, UserSessionUncheckedUpdateWithoutUserInput>
    create: XOR<UserSessionCreateWithoutUserInput, UserSessionUncheckedCreateWithoutUserInput>
  }

  export type UserSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: UserSessionWhereUniqueInput
    data: XOR<UserSessionUpdateWithoutUserInput, UserSessionUncheckedUpdateWithoutUserInput>
  }

  export type UserSessionUpdateManyWithWhereWithoutUserInput = {
    where: UserSessionScalarWhereInput
    data: XOR<UserSessionUpdateManyMutationInput, UserSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type UserSessionScalarWhereInput = {
    AND?: UserSessionScalarWhereInput | UserSessionScalarWhereInput[]
    OR?: UserSessionScalarWhereInput[]
    NOT?: UserSessionScalarWhereInput | UserSessionScalarWhereInput[]
    id?: StringFilter<"UserSession"> | string
    userId?: StringFilter<"UserSession"> | string
    token?: StringFilter<"UserSession"> | string
    expiresAt?: DateTimeFilter<"UserSession"> | Date | string
    createdAt?: DateTimeFilter<"UserSession"> | Date | string
  }

  export type DiffUpsertWithWhereUniqueWithoutOwnerInput = {
    where: DiffWhereUniqueInput
    update: XOR<DiffUpdateWithoutOwnerInput, DiffUncheckedUpdateWithoutOwnerInput>
    create: XOR<DiffCreateWithoutOwnerInput, DiffUncheckedCreateWithoutOwnerInput>
  }

  export type DiffUpdateWithWhereUniqueWithoutOwnerInput = {
    where: DiffWhereUniqueInput
    data: XOR<DiffUpdateWithoutOwnerInput, DiffUncheckedUpdateWithoutOwnerInput>
  }

  export type DiffUpdateManyWithWhereWithoutOwnerInput = {
    where: DiffScalarWhereInput
    data: XOR<DiffUpdateManyMutationInput, DiffUncheckedUpdateManyWithoutOwnerInput>
  }

  export type DiffScalarWhereInput = {
    AND?: DiffScalarWhereInput | DiffScalarWhereInput[]
    OR?: DiffScalarWhereInput[]
    NOT?: DiffScalarWhereInput | DiffScalarWhereInput[]
    id?: StringFilter<"Diff"> | string
    type?: EnumDiffTypeFilter<"Diff"> | $Enums.DiffType
    sourceId?: StringFilter<"Diff"> | string
    targetId?: StringFilter<"Diff"> | string
    repositoryId?: StringFilter<"Diff"> | string
    ownerId?: StringFilter<"Diff"> | string
    status?: EnumDiffStatusFilter<"Diff"> | $Enums.DiffStatus
    filesCount?: IntFilter<"Diff"> | number
    additionsCount?: IntFilter<"Diff"> | number
    deletionsCount?: IntFilter<"Diff"> | number
    contentHash?: StringNullableFilter<"Diff"> | string | null
    title?: StringNullableFilter<"Diff"> | string | null
    description?: StringNullableFilter<"Diff"> | string | null
    errorMessage?: StringNullableFilter<"Diff"> | string | null
    createdAt?: DateTimeFilter<"Diff"> | Date | string
    updatedAt?: DateTimeFilter<"Diff"> | Date | string
  }

  export type SearchHistoryUpsertWithWhereUniqueWithoutUserInput = {
    where: SearchHistoryWhereUniqueInput
    update: XOR<SearchHistoryUpdateWithoutUserInput, SearchHistoryUncheckedUpdateWithoutUserInput>
    create: XOR<SearchHistoryCreateWithoutUserInput, SearchHistoryUncheckedCreateWithoutUserInput>
  }

  export type SearchHistoryUpdateWithWhereUniqueWithoutUserInput = {
    where: SearchHistoryWhereUniqueInput
    data: XOR<SearchHistoryUpdateWithoutUserInput, SearchHistoryUncheckedUpdateWithoutUserInput>
  }

  export type SearchHistoryUpdateManyWithWhereWithoutUserInput = {
    where: SearchHistoryScalarWhereInput
    data: XOR<SearchHistoryUpdateManyMutationInput, SearchHistoryUncheckedUpdateManyWithoutUserInput>
  }

  export type SearchHistoryScalarWhereInput = {
    AND?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
    OR?: SearchHistoryScalarWhereInput[]
    NOT?: SearchHistoryScalarWhereInput | SearchHistoryScalarWhereInput[]
    id?: StringFilter<"SearchHistory"> | string
    userId?: StringFilter<"SearchHistory"> | string
    repositoryId?: StringFilter<"SearchHistory"> | string
    snapshotId?: StringNullableFilter<"SearchHistory"> | string | null
    query?: StringFilter<"SearchHistory"> | string
    searchType?: EnumSearchTypeFilter<"SearchHistory"> | $Enums.SearchType
    resultsCount?: IntFilter<"SearchHistory"> | number
    createdAt?: DateTimeFilter<"SearchHistory"> | Date | string
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutOwnedRepositoriesInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOwnedRepositoriesInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOwnedRepositoriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOwnedRepositoriesInput, UserUncheckedCreateWithoutOwnedRepositoriesInput>
  }

  export type SnapshotCreateWithoutRepositoryInput = {
    id?: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutSnapshotsInput
    comments?: CommentCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUncheckedCreateWithoutRepositoryInput = {
    id?: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    comments?: CommentUncheckedCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotCreateOrConnectWithoutRepositoryInput = {
    where: SnapshotWhereUniqueInput
    create: XOR<SnapshotCreateWithoutRepositoryInput, SnapshotUncheckedCreateWithoutRepositoryInput>
  }

  export type SnapshotCreateManyRepositoryInputEnvelope = {
    data: SnapshotCreateManyRepositoryInput | SnapshotCreateManyRepositoryInput[]
    skipDuplicates?: boolean
  }

  export type TimelineEventCreateWithoutRepositoryInput = {
    id?: string
    type: $Enums.TimelineEventType
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    actor: UserCreateNestedOneWithoutTimelineEventsInput
    snapshot?: SnapshotCreateNestedOneWithoutTimelineEventsInput
    comment?: CommentCreateNestedOneWithoutTimelineEventsInput
  }

  export type TimelineEventUncheckedCreateWithoutRepositoryInput = {
    id?: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId?: string | null
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type TimelineEventCreateOrConnectWithoutRepositoryInput = {
    where: TimelineEventWhereUniqueInput
    create: XOR<TimelineEventCreateWithoutRepositoryInput, TimelineEventUncheckedCreateWithoutRepositoryInput>
  }

  export type TimelineEventCreateManyRepositoryInputEnvelope = {
    data: TimelineEventCreateManyRepositoryInput | TimelineEventCreateManyRepositoryInput[]
    skipDuplicates?: boolean
  }

  export type DiffCreateWithoutRepositoryInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutDiffsInput
    files?: DiffFileCreateNestedManyWithoutDiffInput
  }

  export type DiffUncheckedCreateWithoutRepositoryInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    ownerId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    files?: DiffFileUncheckedCreateNestedManyWithoutDiffInput
  }

  export type DiffCreateOrConnectWithoutRepositoryInput = {
    where: DiffWhereUniqueInput
    create: XOR<DiffCreateWithoutRepositoryInput, DiffUncheckedCreateWithoutRepositoryInput>
  }

  export type DiffCreateManyRepositoryInputEnvelope = {
    data: DiffCreateManyRepositoryInput | DiffCreateManyRepositoryInput[]
    skipDuplicates?: boolean
  }

  export type SearchHistoryCreateWithoutRepositoryInput = {
    id?: string
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSearchHistoryInput
    snapshot?: SnapshotCreateNestedOneWithoutSearchHistoryInput
  }

  export type SearchHistoryUncheckedCreateWithoutRepositoryInput = {
    id?: string
    userId: string
    snapshotId?: string | null
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type SearchHistoryCreateOrConnectWithoutRepositoryInput = {
    where: SearchHistoryWhereUniqueInput
    create: XOR<SearchHistoryCreateWithoutRepositoryInput, SearchHistoryUncheckedCreateWithoutRepositoryInput>
  }

  export type SearchHistoryCreateManyRepositoryInputEnvelope = {
    data: SearchHistoryCreateManyRepositoryInput | SearchHistoryCreateManyRepositoryInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutOwnedRepositoriesInput = {
    update: XOR<UserUpdateWithoutOwnedRepositoriesInput, UserUncheckedUpdateWithoutOwnedRepositoriesInput>
    create: XOR<UserCreateWithoutOwnedRepositoriesInput, UserUncheckedCreateWithoutOwnedRepositoriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOwnedRepositoriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOwnedRepositoriesInput, UserUncheckedUpdateWithoutOwnedRepositoriesInput>
  }

  export type UserUpdateWithoutOwnedRepositoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOwnedRepositoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SnapshotUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: SnapshotWhereUniqueInput
    update: XOR<SnapshotUpdateWithoutRepositoryInput, SnapshotUncheckedUpdateWithoutRepositoryInput>
    create: XOR<SnapshotCreateWithoutRepositoryInput, SnapshotUncheckedCreateWithoutRepositoryInput>
  }

  export type SnapshotUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: SnapshotWhereUniqueInput
    data: XOR<SnapshotUpdateWithoutRepositoryInput, SnapshotUncheckedUpdateWithoutRepositoryInput>
  }

  export type SnapshotUpdateManyWithWhereWithoutRepositoryInput = {
    where: SnapshotScalarWhereInput
    data: XOR<SnapshotUpdateManyMutationInput, SnapshotUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type TimelineEventUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: TimelineEventWhereUniqueInput
    update: XOR<TimelineEventUpdateWithoutRepositoryInput, TimelineEventUncheckedUpdateWithoutRepositoryInput>
    create: XOR<TimelineEventCreateWithoutRepositoryInput, TimelineEventUncheckedCreateWithoutRepositoryInput>
  }

  export type TimelineEventUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: TimelineEventWhereUniqueInput
    data: XOR<TimelineEventUpdateWithoutRepositoryInput, TimelineEventUncheckedUpdateWithoutRepositoryInput>
  }

  export type TimelineEventUpdateManyWithWhereWithoutRepositoryInput = {
    where: TimelineEventScalarWhereInput
    data: XOR<TimelineEventUpdateManyMutationInput, TimelineEventUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type DiffUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: DiffWhereUniqueInput
    update: XOR<DiffUpdateWithoutRepositoryInput, DiffUncheckedUpdateWithoutRepositoryInput>
    create: XOR<DiffCreateWithoutRepositoryInput, DiffUncheckedCreateWithoutRepositoryInput>
  }

  export type DiffUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: DiffWhereUniqueInput
    data: XOR<DiffUpdateWithoutRepositoryInput, DiffUncheckedUpdateWithoutRepositoryInput>
  }

  export type DiffUpdateManyWithWhereWithoutRepositoryInput = {
    where: DiffScalarWhereInput
    data: XOR<DiffUpdateManyMutationInput, DiffUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type SearchHistoryUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: SearchHistoryWhereUniqueInput
    update: XOR<SearchHistoryUpdateWithoutRepositoryInput, SearchHistoryUncheckedUpdateWithoutRepositoryInput>
    create: XOR<SearchHistoryCreateWithoutRepositoryInput, SearchHistoryUncheckedCreateWithoutRepositoryInput>
  }

  export type SearchHistoryUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: SearchHistoryWhereUniqueInput
    data: XOR<SearchHistoryUpdateWithoutRepositoryInput, SearchHistoryUncheckedUpdateWithoutRepositoryInput>
  }

  export type SearchHistoryUpdateManyWithWhereWithoutRepositoryInput = {
    where: SearchHistoryScalarWhereInput
    data: XOR<SearchHistoryUpdateManyMutationInput, SearchHistoryUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type RepositoryCreateWithoutSnapshotsInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedRepositoriesInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutRepositoryInput
    diffs?: DiffCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutSnapshotsInput = {
    id?: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutRepositoryInput
    diffs?: DiffUncheckedCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutSnapshotsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutSnapshotsInput, RepositoryUncheckedCreateWithoutSnapshotsInput>
  }

  export type UserCreateWithoutSnapshotsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSnapshotsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSnapshotsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSnapshotsInput, UserUncheckedCreateWithoutSnapshotsInput>
  }

  export type CommentCreateWithoutSnapshotInput = {
    id?: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    author: UserCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
    replies?: CommentCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutCommentInput
  }

  export type CommentUncheckedCreateWithoutSnapshotInput = {
    id?: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutCommentInput
  }

  export type CommentCreateOrConnectWithoutSnapshotInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutSnapshotInput, CommentUncheckedCreateWithoutSnapshotInput>
  }

  export type CommentCreateManySnapshotInputEnvelope = {
    data: CommentCreateManySnapshotInput | CommentCreateManySnapshotInput[]
    skipDuplicates?: boolean
  }

  export type TimelineEventCreateWithoutSnapshotInput = {
    id?: string
    type: $Enums.TimelineEventType
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutTimelineEventsInput
    actor: UserCreateNestedOneWithoutTimelineEventsInput
    comment?: CommentCreateNestedOneWithoutTimelineEventsInput
  }

  export type TimelineEventUncheckedCreateWithoutSnapshotInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type TimelineEventCreateOrConnectWithoutSnapshotInput = {
    where: TimelineEventWhereUniqueInput
    create: XOR<TimelineEventCreateWithoutSnapshotInput, TimelineEventUncheckedCreateWithoutSnapshotInput>
  }

  export type TimelineEventCreateManySnapshotInputEnvelope = {
    data: TimelineEventCreateManySnapshotInput | TimelineEventCreateManySnapshotInput[]
    skipDuplicates?: boolean
  }

  export type SearchHistoryCreateWithoutSnapshotInput = {
    id?: string
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSearchHistoryInput
    repository: RepositoryCreateNestedOneWithoutSearchHistoryInput
  }

  export type SearchHistoryUncheckedCreateWithoutSnapshotInput = {
    id?: string
    userId: string
    repositoryId: string
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type SearchHistoryCreateOrConnectWithoutSnapshotInput = {
    where: SearchHistoryWhereUniqueInput
    create: XOR<SearchHistoryCreateWithoutSnapshotInput, SearchHistoryUncheckedCreateWithoutSnapshotInput>
  }

  export type SearchHistoryCreateManySnapshotInputEnvelope = {
    data: SearchHistoryCreateManySnapshotInput | SearchHistoryCreateManySnapshotInput[]
    skipDuplicates?: boolean
  }

  export type RepositoryUpsertWithoutSnapshotsInput = {
    update: XOR<RepositoryUpdateWithoutSnapshotsInput, RepositoryUncheckedUpdateWithoutSnapshotsInput>
    create: XOR<RepositoryCreateWithoutSnapshotsInput, RepositoryUncheckedCreateWithoutSnapshotsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutSnapshotsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutSnapshotsInput, RepositoryUncheckedUpdateWithoutSnapshotsInput>
  }

  export type RepositoryUpdateWithoutSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedRepositoriesNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type UserUpsertWithoutSnapshotsInput = {
    update: XOR<UserUpdateWithoutSnapshotsInput, UserUncheckedUpdateWithoutSnapshotsInput>
    create: XOR<UserCreateWithoutSnapshotsInput, UserUncheckedCreateWithoutSnapshotsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSnapshotsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSnapshotsInput, UserUncheckedUpdateWithoutSnapshotsInput>
  }

  export type UserUpdateWithoutSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CommentUpsertWithWhereUniqueWithoutSnapshotInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutSnapshotInput, CommentUncheckedUpdateWithoutSnapshotInput>
    create: XOR<CommentCreateWithoutSnapshotInput, CommentUncheckedCreateWithoutSnapshotInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutSnapshotInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutSnapshotInput, CommentUncheckedUpdateWithoutSnapshotInput>
  }

  export type CommentUpdateManyWithWhereWithoutSnapshotInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutSnapshotInput>
  }

  export type TimelineEventUpsertWithWhereUniqueWithoutSnapshotInput = {
    where: TimelineEventWhereUniqueInput
    update: XOR<TimelineEventUpdateWithoutSnapshotInput, TimelineEventUncheckedUpdateWithoutSnapshotInput>
    create: XOR<TimelineEventCreateWithoutSnapshotInput, TimelineEventUncheckedCreateWithoutSnapshotInput>
  }

  export type TimelineEventUpdateWithWhereUniqueWithoutSnapshotInput = {
    where: TimelineEventWhereUniqueInput
    data: XOR<TimelineEventUpdateWithoutSnapshotInput, TimelineEventUncheckedUpdateWithoutSnapshotInput>
  }

  export type TimelineEventUpdateManyWithWhereWithoutSnapshotInput = {
    where: TimelineEventScalarWhereInput
    data: XOR<TimelineEventUpdateManyMutationInput, TimelineEventUncheckedUpdateManyWithoutSnapshotInput>
  }

  export type SearchHistoryUpsertWithWhereUniqueWithoutSnapshotInput = {
    where: SearchHistoryWhereUniqueInput
    update: XOR<SearchHistoryUpdateWithoutSnapshotInput, SearchHistoryUncheckedUpdateWithoutSnapshotInput>
    create: XOR<SearchHistoryCreateWithoutSnapshotInput, SearchHistoryUncheckedCreateWithoutSnapshotInput>
  }

  export type SearchHistoryUpdateWithWhereUniqueWithoutSnapshotInput = {
    where: SearchHistoryWhereUniqueInput
    data: XOR<SearchHistoryUpdateWithoutSnapshotInput, SearchHistoryUncheckedUpdateWithoutSnapshotInput>
  }

  export type SearchHistoryUpdateManyWithWhereWithoutSnapshotInput = {
    where: SearchHistoryScalarWhereInput
    data: XOR<SearchHistoryUpdateManyMutationInput, SearchHistoryUncheckedUpdateManyWithoutSnapshotInput>
  }

  export type SnapshotCreateWithoutCommentsInput = {
    id?: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutSnapshotsInput
    owner: UserCreateNestedOneWithoutSnapshotsInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUncheckedCreateWithoutCommentsInput = {
    id?: string
    repoId: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotCreateOrConnectWithoutCommentsInput = {
    where: SnapshotWhereUniqueInput
    create: XOR<SnapshotCreateWithoutCommentsInput, SnapshotUncheckedCreateWithoutCommentsInput>
  }

  export type UserCreateWithoutCommentsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCommentsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCommentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCommentsInput, UserUncheckedCreateWithoutCommentsInput>
  }

  export type CommentCreateWithoutRepliesInput = {
    id?: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshot: SnapshotCreateNestedOneWithoutCommentsInput
    author: UserCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutCommentInput
  }

  export type CommentUncheckedCreateWithoutRepliesInput = {
    id?: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutCommentInput
  }

  export type CommentCreateOrConnectWithoutRepliesInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
  }

  export type CommentCreateWithoutParentInput = {
    id?: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshot: SnapshotCreateNestedOneWithoutCommentsInput
    author: UserCreateNestedOneWithoutCommentsInput
    replies?: CommentCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutCommentInput
  }

  export type CommentUncheckedCreateWithoutParentInput = {
    id?: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutCommentInput
  }

  export type CommentCreateOrConnectWithoutParentInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput>
  }

  export type CommentCreateManyParentInputEnvelope = {
    data: CommentCreateManyParentInput | CommentCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type TimelineEventCreateWithoutCommentInput = {
    id?: string
    type: $Enums.TimelineEventType
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutTimelineEventsInput
    actor: UserCreateNestedOneWithoutTimelineEventsInput
    snapshot?: SnapshotCreateNestedOneWithoutTimelineEventsInput
  }

  export type TimelineEventUncheckedCreateWithoutCommentInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type TimelineEventCreateOrConnectWithoutCommentInput = {
    where: TimelineEventWhereUniqueInput
    create: XOR<TimelineEventCreateWithoutCommentInput, TimelineEventUncheckedCreateWithoutCommentInput>
  }

  export type TimelineEventCreateManyCommentInputEnvelope = {
    data: TimelineEventCreateManyCommentInput | TimelineEventCreateManyCommentInput[]
    skipDuplicates?: boolean
  }

  export type SnapshotUpsertWithoutCommentsInput = {
    update: XOR<SnapshotUpdateWithoutCommentsInput, SnapshotUncheckedUpdateWithoutCommentsInput>
    create: XOR<SnapshotCreateWithoutCommentsInput, SnapshotUncheckedCreateWithoutCommentsInput>
    where?: SnapshotWhereInput
  }

  export type SnapshotUpdateToOneWithWhereWithoutCommentsInput = {
    where?: SnapshotWhereInput
    data: XOR<SnapshotUpdateWithoutCommentsInput, SnapshotUncheckedUpdateWithoutCommentsInput>
  }

  export type SnapshotUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutSnapshotsNestedInput
    owner?: UserUpdateOneRequiredWithoutSnapshotsNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutSnapshotNestedInput
  }

  export type UserUpsertWithoutCommentsInput = {
    update: XOR<UserUpdateWithoutCommentsInput, UserUncheckedUpdateWithoutCommentsInput>
    create: XOR<UserCreateWithoutCommentsInput, UserUncheckedCreateWithoutCommentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCommentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCommentsInput, UserUncheckedUpdateWithoutCommentsInput>
  }

  export type UserUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CommentUpsertWithoutRepliesInput = {
    update: XOR<CommentUpdateWithoutRepliesInput, CommentUncheckedUpdateWithoutRepliesInput>
    create: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
    where?: CommentWhereInput
  }

  export type CommentUpdateToOneWithWhereWithoutRepliesInput = {
    where?: CommentWhereInput
    data: XOR<CommentUpdateWithoutRepliesInput, CommentUncheckedUpdateWithoutRepliesInput>
  }

  export type CommentUpdateWithoutRepliesInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: SnapshotUpdateOneRequiredWithoutCommentsNestedInput
    author?: UserUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateWithoutRepliesInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutCommentNestedInput
  }

  export type CommentUpsertWithWhereUniqueWithoutParentInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutParentInput, CommentUncheckedUpdateWithoutParentInput>
    create: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutParentInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutParentInput, CommentUncheckedUpdateWithoutParentInput>
  }

  export type CommentUpdateManyWithWhereWithoutParentInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutParentInput>
  }

  export type TimelineEventUpsertWithWhereUniqueWithoutCommentInput = {
    where: TimelineEventWhereUniqueInput
    update: XOR<TimelineEventUpdateWithoutCommentInput, TimelineEventUncheckedUpdateWithoutCommentInput>
    create: XOR<TimelineEventCreateWithoutCommentInput, TimelineEventUncheckedCreateWithoutCommentInput>
  }

  export type TimelineEventUpdateWithWhereUniqueWithoutCommentInput = {
    where: TimelineEventWhereUniqueInput
    data: XOR<TimelineEventUpdateWithoutCommentInput, TimelineEventUncheckedUpdateWithoutCommentInput>
  }

  export type TimelineEventUpdateManyWithWhereWithoutCommentInput = {
    where: TimelineEventScalarWhereInput
    data: XOR<TimelineEventUpdateManyMutationInput, TimelineEventUncheckedUpdateManyWithoutCommentInput>
  }

  export type RepositoryCreateWithoutTimelineEventsInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedRepositoriesInput
    snapshots?: SnapshotCreateNestedManyWithoutRepositoryInput
    diffs?: DiffCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutTimelineEventsInput = {
    id?: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutRepositoryInput
    diffs?: DiffUncheckedCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutTimelineEventsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutTimelineEventsInput, RepositoryUncheckedCreateWithoutTimelineEventsInput>
  }

  export type UserCreateWithoutTimelineEventsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTimelineEventsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTimelineEventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTimelineEventsInput, UserUncheckedCreateWithoutTimelineEventsInput>
  }

  export type SnapshotCreateWithoutTimelineEventsInput = {
    id?: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutSnapshotsInput
    owner: UserCreateNestedOneWithoutSnapshotsInput
    comments?: CommentCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUncheckedCreateWithoutTimelineEventsInput = {
    id?: string
    repoId: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    comments?: CommentUncheckedCreateNestedManyWithoutSnapshotInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotCreateOrConnectWithoutTimelineEventsInput = {
    where: SnapshotWhereUniqueInput
    create: XOR<SnapshotCreateWithoutTimelineEventsInput, SnapshotUncheckedCreateWithoutTimelineEventsInput>
  }

  export type CommentCreateWithoutTimelineEventsInput = {
    id?: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshot: SnapshotCreateNestedOneWithoutCommentsInput
    author: UserCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
    replies?: CommentCreateNestedManyWithoutParentInput
  }

  export type CommentUncheckedCreateWithoutTimelineEventsInput = {
    id?: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
  }

  export type CommentCreateOrConnectWithoutTimelineEventsInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutTimelineEventsInput, CommentUncheckedCreateWithoutTimelineEventsInput>
  }

  export type RepositoryUpsertWithoutTimelineEventsInput = {
    update: XOR<RepositoryUpdateWithoutTimelineEventsInput, RepositoryUncheckedUpdateWithoutTimelineEventsInput>
    create: XOR<RepositoryCreateWithoutTimelineEventsInput, RepositoryUncheckedCreateWithoutTimelineEventsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutTimelineEventsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutTimelineEventsInput, RepositoryUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type RepositoryUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedRepositoriesNestedInput
    snapshots?: SnapshotUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUncheckedUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type UserUpsertWithoutTimelineEventsInput = {
    update: XOR<UserUpdateWithoutTimelineEventsInput, UserUncheckedUpdateWithoutTimelineEventsInput>
    create: XOR<UserCreateWithoutTimelineEventsInput, UserUncheckedCreateWithoutTimelineEventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTimelineEventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTimelineEventsInput, UserUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type UserUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SnapshotUpsertWithoutTimelineEventsInput = {
    update: XOR<SnapshotUpdateWithoutTimelineEventsInput, SnapshotUncheckedUpdateWithoutTimelineEventsInput>
    create: XOR<SnapshotCreateWithoutTimelineEventsInput, SnapshotUncheckedCreateWithoutTimelineEventsInput>
    where?: SnapshotWhereInput
  }

  export type SnapshotUpdateToOneWithWhereWithoutTimelineEventsInput = {
    where?: SnapshotWhereInput
    data: XOR<SnapshotUpdateWithoutTimelineEventsInput, SnapshotUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type SnapshotUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutSnapshotsNestedInput
    owner?: UserUpdateOneRequiredWithoutSnapshotsNestedInput
    comments?: CommentUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    comments?: CommentUncheckedUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutSnapshotNestedInput
  }

  export type CommentUpsertWithoutTimelineEventsInput = {
    update: XOR<CommentUpdateWithoutTimelineEventsInput, CommentUncheckedUpdateWithoutTimelineEventsInput>
    create: XOR<CommentCreateWithoutTimelineEventsInput, CommentUncheckedCreateWithoutTimelineEventsInput>
    where?: CommentWhereInput
  }

  export type CommentUpdateToOneWithWhereWithoutTimelineEventsInput = {
    where?: CommentWhereInput
    data: XOR<CommentUpdateWithoutTimelineEventsInput, CommentUncheckedUpdateWithoutTimelineEventsInput>
  }

  export type CommentUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: SnapshotUpdateOneRequiredWithoutCommentsNestedInput
    author?: UserUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
  }

  export type CommentUncheckedUpdateWithoutTimelineEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
  }

  export type RepositoryCreateWithoutDiffsInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedRepositoriesInput
    snapshots?: SnapshotCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutDiffsInput = {
    id?: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutRepositoryInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutDiffsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutDiffsInput, RepositoryUncheckedCreateWithoutDiffsInput>
  }

  export type UserCreateWithoutDiffsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    searchHistory?: SearchHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDiffsInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    searchHistory?: SearchHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDiffsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDiffsInput, UserUncheckedCreateWithoutDiffsInput>
  }

  export type DiffFileCreateWithoutDiffInput = {
    id?: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions?: number
    deletions?: number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: number
    oldFilePath?: string | null
    isBinary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffFileUncheckedCreateWithoutDiffInput = {
    id?: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions?: number
    deletions?: number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: number
    oldFilePath?: string | null
    isBinary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffFileCreateOrConnectWithoutDiffInput = {
    where: DiffFileWhereUniqueInput
    create: XOR<DiffFileCreateWithoutDiffInput, DiffFileUncheckedCreateWithoutDiffInput>
  }

  export type DiffFileCreateManyDiffInputEnvelope = {
    data: DiffFileCreateManyDiffInput | DiffFileCreateManyDiffInput[]
    skipDuplicates?: boolean
  }

  export type RepositoryUpsertWithoutDiffsInput = {
    update: XOR<RepositoryUpdateWithoutDiffsInput, RepositoryUncheckedUpdateWithoutDiffsInput>
    create: XOR<RepositoryCreateWithoutDiffsInput, RepositoryUncheckedCreateWithoutDiffsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutDiffsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutDiffsInput, RepositoryUncheckedUpdateWithoutDiffsInput>
  }

  export type RepositoryUpdateWithoutDiffsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedRepositoriesNestedInput
    snapshots?: SnapshotUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutDiffsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUncheckedUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type UserUpsertWithoutDiffsInput = {
    update: XOR<UserUpdateWithoutDiffsInput, UserUncheckedUpdateWithoutDiffsInput>
    create: XOR<UserCreateWithoutDiffsInput, UserUncheckedCreateWithoutDiffsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDiffsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDiffsInput, UserUncheckedUpdateWithoutDiffsInput>
  }

  export type UserUpdateWithoutDiffsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDiffsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DiffFileUpsertWithWhereUniqueWithoutDiffInput = {
    where: DiffFileWhereUniqueInput
    update: XOR<DiffFileUpdateWithoutDiffInput, DiffFileUncheckedUpdateWithoutDiffInput>
    create: XOR<DiffFileCreateWithoutDiffInput, DiffFileUncheckedCreateWithoutDiffInput>
  }

  export type DiffFileUpdateWithWhereUniqueWithoutDiffInput = {
    where: DiffFileWhereUniqueInput
    data: XOR<DiffFileUpdateWithoutDiffInput, DiffFileUncheckedUpdateWithoutDiffInput>
  }

  export type DiffFileUpdateManyWithWhereWithoutDiffInput = {
    where: DiffFileScalarWhereInput
    data: XOR<DiffFileUpdateManyMutationInput, DiffFileUncheckedUpdateManyWithoutDiffInput>
  }

  export type DiffFileScalarWhereInput = {
    AND?: DiffFileScalarWhereInput | DiffFileScalarWhereInput[]
    OR?: DiffFileScalarWhereInput[]
    NOT?: DiffFileScalarWhereInput | DiffFileScalarWhereInput[]
    id?: StringFilter<"DiffFile"> | string
    diffId?: StringFilter<"DiffFile"> | string
    filePath?: StringFilter<"DiffFile"> | string
    changeType?: EnumFileChangeTypeFilter<"DiffFile"> | $Enums.FileChangeType
    additions?: IntFilter<"DiffFile"> | number
    deletions?: IntFilter<"DiffFile"> | number
    content?: JsonNullableFilter<"DiffFile">
    contentSize?: IntFilter<"DiffFile"> | number
    oldFilePath?: StringNullableFilter<"DiffFile"> | string | null
    isBinary?: BoolFilter<"DiffFile"> | boolean
    createdAt?: DateTimeFilter<"DiffFile"> | Date | string
    updatedAt?: DateTimeFilter<"DiffFile"> | Date | string
  }

  export type DiffCreateWithoutFilesInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutDiffsInput
    owner: UserCreateNestedOneWithoutDiffsInput
  }

  export type DiffUncheckedCreateWithoutFilesInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    repositoryId: string
    ownerId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffCreateOrConnectWithoutFilesInput = {
    where: DiffWhereUniqueInput
    create: XOR<DiffCreateWithoutFilesInput, DiffUncheckedCreateWithoutFilesInput>
  }

  export type DiffUpsertWithoutFilesInput = {
    update: XOR<DiffUpdateWithoutFilesInput, DiffUncheckedUpdateWithoutFilesInput>
    create: XOR<DiffCreateWithoutFilesInput, DiffUncheckedCreateWithoutFilesInput>
    where?: DiffWhereInput
  }

  export type DiffUpdateToOneWithWhereWithoutFilesInput = {
    where?: DiffWhereInput
    data: XOR<DiffUpdateWithoutFilesInput, DiffUncheckedUpdateWithoutFilesInput>
  }

  export type DiffUpdateWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutDiffsNestedInput
    owner?: UserUpdateOneRequiredWithoutDiffsNestedInput
  }

  export type DiffUncheckedUpdateWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutSearchHistoryInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotCreateNestedManyWithoutOwnerInput
    comments?: CommentCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutActorInput
    sessions?: UserSessionCreateNestedManyWithoutUserInput
    diffs?: DiffCreateNestedManyWithoutOwnerInput
  }

  export type UserUncheckedCreateWithoutSearchHistoryInput = {
    id?: string
    email: string
    username: string
    password: string
    avatar?: string | null
    role?: $Enums.UserRole
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedRepositories?: RepositoryUncheckedCreateNestedManyWithoutOwnerInput
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutOwnerInput
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutActorInput
    sessions?: UserSessionUncheckedCreateNestedManyWithoutUserInput
    diffs?: DiffUncheckedCreateNestedManyWithoutOwnerInput
  }

  export type UserCreateOrConnectWithoutSearchHistoryInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSearchHistoryInput, UserUncheckedCreateWithoutSearchHistoryInput>
  }

  export type RepositoryCreateWithoutSearchHistoryInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedRepositoriesInput
    snapshots?: SnapshotCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutRepositoryInput
    diffs?: DiffCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutSearchHistoryInput = {
    id?: string
    name: string
    gitUrl: string
    ownerId: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    snapshots?: SnapshotUncheckedCreateNestedManyWithoutRepositoryInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutRepositoryInput
    diffs?: DiffUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutSearchHistoryInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutSearchHistoryInput, RepositoryUncheckedCreateWithoutSearchHistoryInput>
  }

  export type SnapshotCreateWithoutSearchHistoryInput = {
    id?: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutSnapshotsInput
    owner: UserCreateNestedOneWithoutSnapshotsInput
    comments?: CommentCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotUncheckedCreateWithoutSearchHistoryInput = {
    id?: string
    repoId: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    comments?: CommentUncheckedCreateNestedManyWithoutSnapshotInput
    timelineEvents?: TimelineEventUncheckedCreateNestedManyWithoutSnapshotInput
  }

  export type SnapshotCreateOrConnectWithoutSearchHistoryInput = {
    where: SnapshotWhereUniqueInput
    create: XOR<SnapshotCreateWithoutSearchHistoryInput, SnapshotUncheckedCreateWithoutSearchHistoryInput>
  }

  export type UserUpsertWithoutSearchHistoryInput = {
    update: XOR<UserUpdateWithoutSearchHistoryInput, UserUncheckedUpdateWithoutSearchHistoryInput>
    create: XOR<UserCreateWithoutSearchHistoryInput, UserUncheckedCreateWithoutSearchHistoryInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSearchHistoryInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSearchHistoryInput, UserUncheckedUpdateWithoutSearchHistoryInput>
  }

  export type UserUpdateWithoutSearchHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUpdateManyWithoutOwnerNestedInput
    comments?: CommentUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUpdateManyWithoutUserNestedInput
    diffs?: DiffUpdateManyWithoutOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutSearchHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedRepositories?: RepositoryUncheckedUpdateManyWithoutOwnerNestedInput
    snapshots?: SnapshotUncheckedUpdateManyWithoutOwnerNestedInput
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutActorNestedInput
    sessions?: UserSessionUncheckedUpdateManyWithoutUserNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutOwnerNestedInput
  }

  export type RepositoryUpsertWithoutSearchHistoryInput = {
    update: XOR<RepositoryUpdateWithoutSearchHistoryInput, RepositoryUncheckedUpdateWithoutSearchHistoryInput>
    create: XOR<RepositoryCreateWithoutSearchHistoryInput, RepositoryUncheckedCreateWithoutSearchHistoryInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutSearchHistoryInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutSearchHistoryInput, RepositoryUncheckedUpdateWithoutSearchHistoryInput>
  }

  export type RepositoryUpdateWithoutSearchHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedRepositoriesNestedInput
    snapshots?: SnapshotUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutSearchHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUncheckedUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type SnapshotUpsertWithoutSearchHistoryInput = {
    update: XOR<SnapshotUpdateWithoutSearchHistoryInput, SnapshotUncheckedUpdateWithoutSearchHistoryInput>
    create: XOR<SnapshotCreateWithoutSearchHistoryInput, SnapshotUncheckedCreateWithoutSearchHistoryInput>
    where?: SnapshotWhereInput
  }

  export type SnapshotUpdateToOneWithWhereWithoutSearchHistoryInput = {
    where?: SnapshotWhereInput
    data: XOR<SnapshotUpdateWithoutSearchHistoryInput, SnapshotUncheckedUpdateWithoutSearchHistoryInput>
  }

  export type SnapshotUpdateWithoutSearchHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutSnapshotsNestedInput
    owner?: UserUpdateOneRequiredWithoutSnapshotsNestedInput
    comments?: CommentUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateWithoutSearchHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    comments?: CommentUncheckedUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutSnapshotNestedInput
  }

  export type RepositoryCreateManyOwnerInput = {
    id?: string
    name: string
    gitUrl: string
    defaultBranch?: string
    visibility?: $Enums.RepositoryVisibility
    description?: string | null
    isActive?: boolean
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SnapshotCreateManyOwnerInput = {
    id?: string
    repoId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentCreateManyAuthorInput = {
    id?: string
    snapshotId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TimelineEventCreateManyActorInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    snapshotId?: string | null
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type UserSessionCreateManyUserInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type DiffCreateManyOwnerInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    repositoryId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SearchHistoryCreateManyUserInput = {
    id?: string
    repositoryId: string
    snapshotId?: string | null
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type RepositoryUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: SnapshotUncheckedUpdateManyWithoutRepositoryNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutRepositoryNestedInput
    diffs?: DiffUncheckedUpdateManyWithoutRepositoryNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gitUrl?: StringFieldUpdateOperationsInput | string
    defaultBranch?: StringFieldUpdateOperationsInput | string
    visibility?: EnumRepositoryVisibilityFieldUpdateOperationsInput | $Enums.RepositoryVisibility
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SnapshotUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutSnapshotsNestedInput
    comments?: CommentUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    comments?: CommentUncheckedUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: SnapshotUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateManyWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutTimelineEventsNestedInput
    snapshot?: SnapshotUpdateOneWithoutTimelineEventsNestedInput
    comment?: CommentUpdateOneWithoutTimelineEventsNestedInput
  }

  export type TimelineEventUncheckedUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUncheckedUpdateManyWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutDiffsNestedInput
    files?: DiffFileUpdateManyWithoutDiffNestedInput
  }

  export type DiffUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    files?: DiffFileUncheckedUpdateManyWithoutDiffNestedInput
  }

  export type DiffUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutSearchHistoryNestedInput
    snapshot?: SnapshotUpdateOneWithoutSearchHistoryNestedInput
  }

  export type SearchHistoryUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SnapshotCreateManyRepositoryInput = {
    id?: string
    ownerId: string
    commitSha: string
    branchName: string
    worktreePath?: string | null
    bundlePath?: string | null
    status?: $Enums.SnapshotStatus
    title?: string | null
    description?: string | null
    expiresAt: Date | string
    processedAt?: Date | string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TimelineEventCreateManyRepositoryInput = {
    id?: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId?: string | null
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type DiffCreateManyRepositoryInput = {
    id?: string
    type: $Enums.DiffType
    sourceId: string
    targetId: string
    ownerId: string
    status?: $Enums.DiffStatus
    filesCount?: number
    additionsCount?: number
    deletionsCount?: number
    contentHash?: string | null
    title?: string | null
    description?: string | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SearchHistoryCreateManyRepositoryInput = {
    id?: string
    userId: string
    snapshotId?: string | null
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type SnapshotUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutSnapshotsNestedInput
    comments?: CommentUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    comments?: CommentUncheckedUpdateManyWithoutSnapshotNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutSnapshotNestedInput
    searchHistory?: SearchHistoryUncheckedUpdateManyWithoutSnapshotNestedInput
  }

  export type SnapshotUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    commitSha?: StringFieldUpdateOperationsInput | string
    branchName?: StringFieldUpdateOperationsInput | string
    worktreePath?: NullableStringFieldUpdateOperationsInput | string | null
    bundlePath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumSnapshotStatusFieldUpdateOperationsInput | $Enums.SnapshotStatus
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actor?: UserUpdateOneRequiredWithoutTimelineEventsNestedInput
    snapshot?: SnapshotUpdateOneWithoutTimelineEventsNestedInput
    comment?: CommentUpdateOneWithoutTimelineEventsNestedInput
  }

  export type TimelineEventUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutDiffsNestedInput
    files?: DiffFileUpdateManyWithoutDiffNestedInput
  }

  export type DiffUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    files?: DiffFileUncheckedUpdateManyWithoutDiffNestedInput
  }

  export type DiffUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumDiffTypeFieldUpdateOperationsInput | $Enums.DiffType
    sourceId?: StringFieldUpdateOperationsInput | string
    targetId?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    status?: EnumDiffStatusFieldUpdateOperationsInput | $Enums.DiffStatus
    filesCount?: IntFieldUpdateOperationsInput | number
    additionsCount?: IntFieldUpdateOperationsInput | number
    deletionsCount?: IntFieldUpdateOperationsInput | number
    contentHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSearchHistoryNestedInput
    snapshot?: SnapshotUpdateOneWithoutSearchHistoryNestedInput
  }

  export type SearchHistoryUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentCreateManySnapshotInput = {
    id?: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    parentId?: string | null
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TimelineEventCreateManySnapshotInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    commentId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SearchHistoryCreateManySnapshotInput = {
    id?: string
    userId: string
    repositoryId: string
    query: string
    searchType?: $Enums.SearchType
    resultsCount?: number
    createdAt?: Date | string
  }

  export type CommentUpdateWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: UserUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateManyWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUpdateWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutTimelineEventsNestedInput
    actor?: UserUpdateOneRequiredWithoutTimelineEventsNestedInput
    comment?: CommentUpdateOneWithoutTimelineEventsNestedInput
  }

  export type TimelineEventUncheckedUpdateWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUncheckedUpdateManyWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    commentId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUpdateWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSearchHistoryNestedInput
    repository?: RepositoryUpdateOneRequiredWithoutSearchHistoryNestedInput
  }

  export type SearchHistoryUncheckedUpdateWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SearchHistoryUncheckedUpdateManyWithoutSnapshotInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    query?: StringFieldUpdateOperationsInput | string
    searchType?: EnumSearchTypeFieldUpdateOperationsInput | $Enums.SearchType
    resultsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentCreateManyParentInput = {
    id?: string
    snapshotId: string
    authorId: string
    content: string
    anchorType: $Enums.CommentAnchorType
    commitSha?: string | null
    filePath?: string | null
    lineStart?: number | null
    lineEnd?: number | null
    status?: $Enums.CommentStatus
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TimelineEventCreateManyCommentInput = {
    id?: string
    repoId: string
    type: $Enums.TimelineEventType
    actorId: string
    snapshotId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type CommentUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: SnapshotUpdateOneRequiredWithoutCommentsNestedInput
    author?: UserUpdateOneRequiredWithoutCommentsNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
    timelineEvents?: TimelineEventUncheckedUpdateManyWithoutCommentNestedInput
  }

  export type CommentUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    snapshotId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    anchorType?: EnumCommentAnchorTypeFieldUpdateOperationsInput | $Enums.CommentAnchorType
    commitSha?: NullableStringFieldUpdateOperationsInput | string | null
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    lineStart?: NullableIntFieldUpdateOperationsInput | number | null
    lineEnd?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumCommentStatusFieldUpdateOperationsInput | $Enums.CommentStatus
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUpdateWithoutCommentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutTimelineEventsNestedInput
    actor?: UserUpdateOneRequiredWithoutTimelineEventsNestedInput
    snapshot?: SnapshotUpdateOneWithoutTimelineEventsNestedInput
  }

  export type TimelineEventUncheckedUpdateWithoutCommentInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimelineEventUncheckedUpdateManyWithoutCommentInput = {
    id?: StringFieldUpdateOperationsInput | string
    repoId?: StringFieldUpdateOperationsInput | string
    type?: EnumTimelineEventTypeFieldUpdateOperationsInput | $Enums.TimelineEventType
    actorId?: StringFieldUpdateOperationsInput | string
    snapshotId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffFileCreateManyDiffInput = {
    id?: string
    filePath: string
    changeType: $Enums.FileChangeType
    additions?: number
    deletions?: number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: number
    oldFilePath?: string | null
    isBinary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DiffFileUpdateWithoutDiffInput = {
    id?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffFileUncheckedUpdateWithoutDiffInput = {
    id?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffFileUncheckedUpdateManyWithoutDiffInput = {
    id?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    changeType?: EnumFileChangeTypeFieldUpdateOperationsInput | $Enums.FileChangeType
    additions?: IntFieldUpdateOperationsInput | number
    deletions?: IntFieldUpdateOperationsInput | number
    content?: NullableJsonNullValueInput | InputJsonValue
    contentSize?: IntFieldUpdateOperationsInput | number
    oldFilePath?: NullableStringFieldUpdateOperationsInput | string | null
    isBinary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RepositoryCountOutputTypeDefaultArgs instead
     */
    export type RepositoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RepositoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SnapshotCountOutputTypeDefaultArgs instead
     */
    export type SnapshotCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SnapshotCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CommentCountOutputTypeDefaultArgs instead
     */
    export type CommentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CommentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DiffCountOutputTypeDefaultArgs instead
     */
    export type DiffCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DiffCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserSessionDefaultArgs instead
     */
    export type UserSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RepositoryDefaultArgs instead
     */
    export type RepositoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RepositoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SnapshotDefaultArgs instead
     */
    export type SnapshotArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SnapshotDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CommentDefaultArgs instead
     */
    export type CommentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CommentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TimelineEventDefaultArgs instead
     */
    export type TimelineEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TimelineEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DiffDefaultArgs instead
     */
    export type DiffArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DiffDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DiffFileDefaultArgs instead
     */
    export type DiffFileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DiffFileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SearchHistoryDefaultArgs instead
     */
    export type SearchHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SearchHistoryDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}