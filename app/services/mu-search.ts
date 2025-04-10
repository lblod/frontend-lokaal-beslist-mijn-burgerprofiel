import Service from '@ember/service';
export type PageMetadata = { number?: number; size?: number };
export type Page = {
  first: PageMetadata;
  last: PageMetadata;
  prev?: PageMetadata;
  next?: PageMetadata;
  self: PageMetadata;
};

export type MuSearchData<E> = { attributes: E };
export type DataMapper<I, O> = (data: MuSearchData<I>) => O;
export type PageableRequest<I, O> = {
  index: string;
  page: number;
  size: number;
  sort?: string;
  filters?: { [key: string]: string };
  dataMapping: DataMapper<I, O>;
};

export interface MuSearchResponse<T> {
  count: number;
  pagination: Page;
  items: T[];
}

export default class MuSearchService extends Service {
  async search<I, O>(
    request: PageableRequest<I, O>,
  ): Promise<MuSearchResponse<O>> {
    const { index, page, size, sort, filters, dataMapping } = request;
    try {
      const params = [`page[size]=${size}`, `page[number]=${page}`];

      if (filters) {
        Object.entries(filters).forEach(([field, q]) => {
          params.push(`filter[${field}]=${q}`);
        });
      }

      if (sort) {
        const sortParams = sort
          .split(',')
          .filter((sortParam) => sortParam.length > 0);
        params.push(
          ...sortParams.map(
            (sortParam) =>
              `sort[${this.stripSort(sortParam)}.field]=${this.sortOrder(
                sortParam,
              )}`,
          ),
        );
      }

      const endpoint = `/search/${index}/search?${params.join('&')}`;
      const response = await fetch(endpoint);
      const json = await response.json();

      if (!json || !json.count || !json.data) {
        throw new Error(`Invalid response from ${endpoint}`);
      }

      const { count, data } = json;
      const pagination = this.getPaginationMetadata(page, size, count);
      const items = data.map(dataMapping);

      return {
        items,
        count,
        pagination,
      };
    } catch (error) {
      console.error('Error during search:', error);

      return {
        items: [],
        count: 0,
        pagination: this.getPaginationMetadata(page, size, 0),
      };
    }
  }

  private sortOrder(sort: string): string {
    return sort.startsWith('-') ? 'desc' : 'asc';
  }

  private stripSort(sort: string): string {
    return sort.replace(/^[-+]+/, '');
  }

  private getPaginationMetadata(
    pageNumber: number,
    pageSize: number,
    total: number,
  ): Page {
    const size = Math.min(pageSize, total);
    const lastPageNumber =
      total === 0 ? 0 : Math.max(Math.ceil(total / size) - 1, 0);
    const lastPageSize = total % size || size;
    const isFirstPage = pageNumber === 0;
    const isLastPage = pageNumber === lastPageNumber;

    const pagination: Page = {
      first: {
        number: 0,
        size,
      },
      last: {
        number: lastPageNumber,
        size: lastPageSize,
      },
      self: {
        number: pageNumber,
        size,
      },
    };

    if (!isFirstPage) {
      pagination.prev = {
        number: pageNumber - 1,
        size,
      };
    }

    if (!isLastPage) {
      const nextPageSize = pageNumber === lastPageNumber ? lastPageSize : size;
      pagination.next = {
        number: pageNumber + 1,
        size: nextPageSize,
      };
    }

    return pagination;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:feature')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('feature') declare altName: FeatureService;`.
declare module '@ember/service' {
  interface Registry {
    muSearch: MuSearchService;
  }
}
