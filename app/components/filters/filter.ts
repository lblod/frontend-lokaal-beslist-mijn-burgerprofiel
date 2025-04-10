import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export interface FilterArgs {
  id: string;
  queryParam: string;

  searchField: string;
  options: Array<object>;
}

interface Signature {
  Args: FilterArgs;
}

export default class FilterComponent<S = Signature> extends Component<S> {
  @service declare router: RouterService;

  /**
   *
   * @param param name of the queryParameter that is presented to the user
   * @returns queryParameter value. Possibly undefined
   */
  getQueryParam(param: string): string | undefined {
    return this.router.currentRoute.queryParams[param];
  }

  /**
   *
   * @param params object with {queryParameterName: newValue}
   */
  updateQueryParams(params: { [key: string]: string | undefined }) {
    if (this.router) {
      this.router.transitionTo(this.router.currentRouteName, {
        queryParams: params,
      });
    } else {
      console.error('Router service is not available.');
    }
  }
}
