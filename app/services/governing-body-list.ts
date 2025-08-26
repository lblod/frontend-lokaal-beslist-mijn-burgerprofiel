import Service, { service } from '@ember/service';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type MunicipalityListService from './municipality-list';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
import type GovernmentListService from './government-list';
import type FilterService from './filter-service';
import type ProvinceListService from './province-list';
import type NativeArray from '@ember/array/-private/native-array';

export interface GoverningBodyOption {
  id: string;
  label: string;
  type: string;
}

export default class GoverningBodyListService extends Service {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governmentList: GovernmentListService;
  @service declare filterService: FilterService;

  @tracked selectedIds: Array<string> = [];
  @tracked options: GoverningBodyOption[] = [];
  @tracked lookupOptions: NativeArray<GoverningBodyOption> = A([]);

  getIdsForLabel(label: string): Array<string> | undefined {
    const matches = this.lookupOptions.filter(
      (option) => option.label === label,
    );

    return matches.map((m) => m.id);
  }

  async loadOptions() {
    const {
      municipalityLabels,
      governingBodyClassificationIds,
      provinceLabels,
    } = this.filterService.filters;
    let queryFilter = {};
    if (municipalityLabels?.length >= 1 || provinceLabels?.length >= 1) {
      const municipalityIds =
        await this.municipalityList.getLocationIdsFromLabels(
          serializeArray(municipalityLabels),
        );
      const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
        serializeArray(provinceLabels),
      );
      queryFilter = {
        'administrative-unit': {
          location: {
            ':id:': [...municipalityIds, ...provinceIds].join(','),
          },
        },
      };
    }
    const governingBodies = await this.store.query('governing-body', {
      filter: queryFilter,
      'filter[:has:classification]': true,
      'filter[:has:sessions]': true,
    });
    this.options = this.sortOptions(
      await this.getUniqueGoverningBodies(governingBodies),
    );
    this.selectedIds = governingBodyClassificationIds;

    return this.options;
  }

  sortOptions(options: GoverningBodyOption[]): GoverningBodyOption[] {
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }

  async getUniqueGoverningBodies(
    govBodies: AdapterPopulatedRecordArrayWithMeta<GoverningBodyModel>,
  ) {
    const uniqueLabels = new Set();
    const classifications = await this.store.query(
      'governing-body-classification-code',
      {
        'filter[governing-bodies][:id:]': govBodies.map((b) => b.id).join(','),
      },
    );

    return classifications
      .filter((classification) => {
        const label = classification.label;
        if (label && !uniqueLabels.has(label)) {
          uniqueLabels.add(label);
          return true;
        }
        return false;
      })
      .map((classification) => ({
        id: classification.id ?? '',
        label: classification.label ?? '',
        type: QueryParameterKeys.governingBodies,
      }));
  }

  async setLookupForOptions(): Promise<void> {
    const governingBodyClassifications = await this.store.query(
      'governing-body-classification-code',
      {
        page: { size: 100 },
        sort: 'label',
      },
    );
    const allOptions = this.sortOptions(
      governingBodyClassifications.map((classification) => ({
        id: classification.id,
        label: classification.label,
        type: QueryParameterKeys.governingBodies,
      })),
    );
    this.lookupOptions.clear();
    this.lookupOptions.pushObjects(A(allOptions));
  }
}
declare module '@ember/service' {
  interface Registry {
    'governing-body-list': GoverningBodyListService;
  }
}
