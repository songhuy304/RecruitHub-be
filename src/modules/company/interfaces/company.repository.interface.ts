import { Repository } from '@/common/core/repository';
import { CompanyEntity } from '@/common/entities/company.entity';

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');

export type ICompanyRepository = Repository<CompanyEntity>;
