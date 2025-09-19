import {
  Model,
  FilterQuery,
  UpdateQuery,
  Document,
  UpdateResult,
  DeleteResult,
} from 'mongoose';
import { IBaseEntity } from '../interfaces/base-entity.interface';
import { PaginationResult } from '../interfaces/pagination-result.interface';

export interface FindOptions {
  populate?: string | string[];
  sort?: Record<string, 1 | -1>;
  select?: string;
  limit?: number;
}

export class BaseService<T extends Document, I extends IBaseEntity> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<I> {
    const doc = await this.model.create(data);
    return doc as I;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    filter?: FilterQuery<T>;
    populate?: string | string[];
    select?: string;
  }): Promise<PaginationResult<I>> {
    const {
      page = 1,
      limit = 25,
      filter = {},
      sort,
      populate,
      select,
    } = params;

    const skip = (page - 1) * limit;

    let query = this.model.find(filter).skip(skip).limit(limit);

    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);

    const [items, total] = await Promise.all([
      select ? query.select(select).lean().exec() : query.lean().exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      items: items as I[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllRaw(
    filter: FilterQuery<T> = {},
    options?: FindOptions,
  ): Promise<I[] | null> {
    let query = this.model.find(filter);

    if (options && options.populate) {
      query = query.populate(options.populate);
    }

    if (options && options.sort) {
      query = query.sort(options.sort);
    }

    if (options && options.limit) {
      query = query.limit(options.limit);
    }

    const result =
      options && options.select
        ? await query.select(options.select).lean().exec()
        : query.lean().exec();

    return result as I[] | null;
  }

  async findById(id: string, options?: FindOptions): Promise<I | null> {
    let query = this.model.findById(id);

    if (options && options.populate) {
      query = query.populate(options.populate);
    }

    if (options && options.sort) {
      query = query.sort(options.sort);
    }

    const result =
      options && options.select
        ? await query.select(options.select).lean().exec()
        : query.lean().exec();

    return result as I | null;
  }

  async findOne(
    filter: FilterQuery<T>,
    options?: FindOptions,
  ): Promise<I | null> {
    let query = this.model.findOne(filter);

    if (options && options.populate) {
      query = query.populate(options.populate);
    }

    if (options && options.sort) {
      query = query.sort(options.sort);
    }

    const result =
      options && options.select
        ? await query.select(options.select).lean().exec()
        : query.lean().exec();

    return result as I | null;
  }

  async update(id: string, update: UpdateQuery<T>): Promise<I | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    return doc as I | null;
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: Record<string, unknown>,
  ): Promise<UpdateResult> {
    return await this.model.updateMany(filter, update, options).exec();
  }

  async delete(id: string): Promise<I | null> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    return doc as I | null;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
    return await this.model.deleteMany(filter).exec();
  }
}
