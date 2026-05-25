import { SortOrder } from '@/common/enums';
import { FilterConditions } from '@/common/helper/dtos/helper.condition.dto';
import { PaginatedDto } from '@/common/response';
import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

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

const OPS_REQUIRE_VALUE: FilterOperator[] = [
  'eq',
  'not',
  'ilike',
  'startsWith',
  'endsWith',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'dateRange',
  'in',
];

export interface FilterRule<T extends ObjectLiteral> {
  field: keyof T & string;
  op: FilterOperator;
  value?: unknown;
}

export interface QueryOptions<T extends ObjectLiteral> {
  filters?: FilterRule<T>[];
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  sort?: Partial<Record<keyof T & string, SortOrder>>;
  pagination?: PaginationOptions;
  relations?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function resolveCondition(rule: FilterRule<ObjectLiteral>): unknown {
  const { op, value } = rule;

  switch (op) {
    case 'eq':
      return value;

    case 'not':
      return FilterConditions.not(value);

    case 'ilike':
      return FilterConditions.ilike(value as string);

    case 'startsWith':
      return FilterConditions.startsWith(value as string);

    case 'endsWith':
      return FilterConditions.endsWith(value as string);

    case 'gt':
      return FilterConditions.gt(value);

    case 'gte':
      return FilterConditions.gte(value);

    case 'lt':
      return FilterConditions.lt(value);

    case 'lte':
      return FilterConditions.lte(value);

    case 'between': {
      const [from, to] = value as [unknown, unknown];
      return FilterConditions.between(from, to);
    }

    case 'dateRange': {
      const [from, to] = value as [Date | string, Date | string];
      return FilterConditions.dateRange(from, to);
    }

    case 'in':
      return FilterConditions.inList(value as unknown[]);

    case 'isNull':
      return FilterConditions.isNull();

    case 'isNotNull':
      return FilterConditions.isNotNull();

    default:
      return value;
  }
}

function buildWhere<T extends ObjectLiteral>(
  filters: FilterRule<T>[] = [],
): FindOptionsWhere<T> {
  return filters
    .filter(
      (rule) =>
        !OPS_REQUIRE_VALUE.includes(rule.op) || rule.value !== undefined,
    )
    .reduce<FindOptionsWhere<T>>((acc, rule) => {
      (acc as Record<string, unknown>)[rule.field] = resolveCondition(
        rule as FilterRule<ObjectLiteral>,
      );
      return acc;
    }, {} as FindOptionsWhere<T>);
}

function removeUndefinedDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedDeep) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        (acc as Record<string, unknown>)[key] = removeUndefinedDeep(value);
      }

      return acc;
    }, {} as T);
  }

  return obj;
}

function mergeWhere<T extends ObjectLiteral>(
  fromFilters: FindOptionsWhere<T>,
  extra?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
  const cleanedFilters = removeUndefinedDeep(fromFilters);

  if (!extra) return cleanedFilters;

  if (Array.isArray(extra)) {
    return extra.map((branch) =>
      removeUndefinedDeep({
        ...cleanedFilters,
        ...branch,
      }),
    );
  }

  return removeUndefinedDeep({
    ...cleanedFilters,
    ...extra,
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class HelperQueryService {
  // ── Internal ────────────────────────────────────────────────────────────────

  private buildFindOptions<T extends ObjectLiteral>(
    options: QueryOptions<T>,
  ): FindManyOptions<T> {
    const {
      filters = [],
      where,
      sort,
      pagination,
      relations,
      select,
    } = options;

    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.max(1, pagination?.limit ?? 20);

    const whereFromFilters = buildWhere(filters);
    const mergedWhere = mergeWhere(whereFromFilters, where);

    const order = sort ? (sort as FindOptionsOrder<T>) : undefined;

    return {
      where: mergedWhere as FindOptionsWhere<T>,
      order,
      skip: (page - 1) * limit,
      take: limit,
      relations,
      select,
    };
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async findMany<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: QueryOptions<T> = {},
  ): Promise<PaginatedDto<T>> {
    const page = Math.max(1, options.pagination?.page ?? 1);
    const limit = Math.max(1, options.pagination?.limit ?? 20);

    const findOptions = this.buildFindOptions(options);

    const [data, total] = await repo.findAndCount(findOptions);

    return {
      data,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: QueryOptions<T> = {},
  ): Promise<T | null> {
    const findOptions = this.buildFindOptions({
      ...options,
      pagination: { page: 1, limit: 1 },
    });

    return repo.findOne(findOptions);
  }

  async count<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: Pick<QueryOptions<T>, 'filters' | 'where'> = {},
  ): Promise<number> {
    const whereFromFilters = buildWhere(options.filters ?? []);
    const mergedWhere = mergeWhere(whereFromFilters, options.where);

    return repo.count({
      where: mergedWhere as FindOptionsWhere<T>,
    });
  }

  async exists<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: Pick<QueryOptions<T>, 'filters' | 'where'> = {},
  ): Promise<boolean> {
    return (await this.count(repo, options)) > 0;
  }

  async findAll<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: Omit<QueryOptions<T>, 'pagination'> = {},
  ): Promise<T[]> {
    const whereFromFilters = buildWhere(options.filters ?? []);
    const mergedWhere = mergeWhere(whereFromFilters, options.where);

    return repo.find({
      where: mergedWhere as FindOptionsWhere<T>,
      order: options.sort as FindOptionsOrder<T>,
      relations: options.relations,
      select: options.select,
    });
  }
}
