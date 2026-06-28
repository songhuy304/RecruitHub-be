import {
  FilterInput,
  FilterOperator,
  FilterRule,
} from '@/common/helper/interfaces/helper-query.interface';
import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { uniqueQueryParam } from './query-param.util';

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

function isRuleValid(rule: FilterRule): boolean {
  return !OPS_REQUIRE_VALUE.includes(rule.op) || rule.value !== undefined;
}

export function isFilterRule(
  item: FilterRule | FilterInput,
): item is FilterRule {
  return 'field' in item && 'op' in item;
}

function applyRule(
  qb: WhereExpressionBuilder,
  resolveColumn: (field: string) => string,
  rule: FilterRule,
  method: 'andWhere' | 'orWhere' | 'where',
): void {
  if (!isRuleValid(rule)) return;

  const { op, value } = rule;
  const col = resolveColumn(rule.field);
  const param = uniqueQueryParam(rule.field);

  switch (op) {
    case 'isNull':
      qb[method](`${col} IS NULL`);
      break;
    case 'isNotNull':
      qb[method](`${col} IS NOT NULL`);
      break;
    case 'ilike':
      qb[method](`${col} ILIKE :${param}`, { [param]: `%${value}%` });
      break;
    case 'startsWith':
      qb[method](`${col} ILIKE :${param}`, { [param]: `${value}%` });
      break;
    case 'endsWith':
      qb[method](`${col} ILIKE :${param}`, { [param]: `%${value}` });
      break;
    case 'gt':
      qb[method](`${col} > :${param}`, { [param]: value });
      break;
    case 'gte':
      qb[method](`${col} >= :${param}`, { [param]: value });
      break;
    case 'lt':
      qb[method](`${col} < :${param}`, { [param]: value });
      break;
    case 'lte':
      qb[method](`${col} <= :${param}`, { [param]: value });
      break;
    case 'not':
      qb[method](`${col} != :${param}`, { [param]: value });
      break;
    case 'between': {
      const [from, to] = value as [unknown, unknown];
      qb[method](`${col} BETWEEN :${param}_from AND :${param}_to`, {
        [`${param}_from`]: from,
        [`${param}_to`]: to,
      });
      break;
    }
    case 'dateRange': {
      const [from, to] = value as [Date | string, Date | string];
      qb[method](`${col} BETWEEN :${param}_from AND :${param}_to`, {
        [`${param}_from`]: from,
        [`${param}_to`]: to,
      });
      break;
    }
    case 'in':
      qb[method](`${col} IN (:...${param})`, { [param]: value });
      break;
    case 'eq':
    default:
      qb[method](`${col} = :${param}`, { [param]: value });
      break;
  }
}

function applyFilterItems(
  qb: WhereExpressionBuilder,
  items: Array<FilterRule | FilterInput>,
  combinator: 'and' | 'or',
  resolveColumn: (field: string) => string,
): void {
  let isFirst = true;

  for (const item of items) {
    if (isFilterRule(item)) {
      if (!isRuleValid(item)) continue;

      const method = isFirst
        ? 'where'
        : combinator === 'or'
          ? 'orWhere'
          : 'andWhere';
      applyRule(qb, resolveColumn, item, method);
      isFirst = false;
      continue;
    }

    const method = isFirst
      ? 'where'
      : combinator === 'or'
        ? 'orWhere'
        : 'andWhere';

    qb[method](
      new Brackets((nestedQb) =>
        applyFilterInput(nestedQb, item, resolveColumn),
      ),
    );
    isFirst = false;
  }
}

export function applyFilterInput(
  qb: WhereExpressionBuilder,
  input: FilterInput,
  resolveColumn: (field: string) => string,
): void {
  const { and = [], or = [] } = input;

  if (and.length === 0 && or.length === 0) return;

  let isFirst = true;

  if (and.length > 0) {
    const method = isFirst ? 'where' : 'andWhere';
    qb[method](
      new Brackets((innerQb) =>
        applyFilterItems(innerQb, and, 'and', resolveColumn),
      ),
    );
    isFirst = false;
  }

  if (or.length > 0) {
    const method = isFirst ? 'where' : 'andWhere';
    qb[method](
      new Brackets((innerQb) =>
        applyFilterItems(innerQb, or, 'or', resolveColumn),
      ),
    );
  }
}
