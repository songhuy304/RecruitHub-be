import { SortOrder } from '@/common/enums';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// ─── Filter DSL (NestJS-Query style) ─────────────────────────────────────────

export type FilterOperator =
  | 'eq'
  | 'not'
  | 'ilike'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'dateRange'
  | 'in'
  | 'isNull'
  | 'isNotNull';

export interface FilterRule {
  field: string;
  op: FilterOperator;
  value?: unknown;
}

/**
 * NestJS-Query style filter — supports nested and/or groups.
 *
 * @example OR search
 * {
 *   or: [
 *     { field: 'user.fullName', op: 'ilike', value: 'john' },
 *     { field: 'user.email', op: 'ilike', value: 'john' },
 *   ],
 * }
 *
 * @example AND conditions
 * {
 *   and: [
 *     { field: 'status', op: 'eq', value: 'active' },
 *     { field: 'role', op: 'in', value: ['admin', 'mod'] },
 *   ],
 * }
 *
 * @example Nested (A AND B) OR C
 * {
 *   or: [
 *     {
 *       and: [
 *         { field: 'teamId', op: 'eq', value: 1 },
 *         { field: 'role', op: 'eq', value: 'admin' },
 *       ],
 *     },
 *     { field: 'userId', op: 'eq', value: 42 },
 *   ],
 * }
 *
 * When both `and` and `or` are present at the same level they are combined with AND:
 * (and rules…) AND (or rules…)
 */
export type FilterInput = {
  and?: Array<FilterRule | FilterInput>;
  or?: Array<FilterRule | FilterInput>;
};

// ─── Query Options ────────────────────────────────────────────────────────────

export interface QueryOptions<T extends ObjectLiteral> {
  /**
   * Hard conditions — always applied as AND (e.g. teamId, ownerId).
   */
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];

  /**
   * Dynamic filter conditions with AND/OR group support.
   * Merged with `where` as AND at the top level.
   */
  filters?: FilterInput;

  sort?: Partial<Record<string, SortOrder>>;
  pagination?: PaginationOptions;
  relations?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
}
