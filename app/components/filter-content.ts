import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import { localCopy } from 'tracked-toolbox';

export default class FilterContent extends Component {
  @service declare filterService: FilterService;
  @service declare router: RouterService;
  @tracked showAdvancedSearch = false;

  @localCopy<string>('args.value', '') declare value: string;

  @action
  handleChange(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
  }

  @action
  handleSubmit(event: Event) {
    event.preventDefault();
    const queryParams = {
      [QueryParameterKeys.keyword]: this.value || null,
    };
    this.router.transitionTo(this.router.currentRouteName, { queryParams });
  }

  @action
  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  @action
  removeAdvancedSearchItem(item: string) {
    const parsedResults = this.filterService.keywordAdvancedSearch || {};

    for (const operator in parsedResults) {
      const itemsArray = parsedResults[operator];
      if (itemsArray) {
        const itemIndex = itemsArray.indexOf(item);
        if (itemIndex !== -1) {
          itemsArray.splice(itemIndex, 1);
          break;
        }
      }
    }
    if (this.filterService.filters.keyword) {
      let keywordString = this.filterService.filters.keyword;
      const regex = new RegExp(
        `${item}| OF ${item}|OF ${item}|-${item}|"${item}"`,
        'g',
      );
      keywordString = keywordString.replace(regex, '').trim();
      keywordString = keywordString.replace(/\s{2,}/g, ' ');
      this.filterService.filters.keyword = keywordString;
      this.filterService.filters = {
        ...this.filterService.filters,
        keyword: keywordString,
      };
      const queryParams = { [QueryParameterKeys.keyword]: keywordString };
      this.router.transitionTo({ queryParams });
    }
    this.filterService.keywordAdvancedSearch = parsedResults;
  }
}
