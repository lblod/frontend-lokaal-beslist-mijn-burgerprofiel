import Service, { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type MunicipalityListService from './municipality-list';
import type GovernmentListService from './government-list';
import type FilterService from './filter-service';
import type ProvinceListService from './province-list';
import type GoverningBodyClassificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';

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

  @tracked options: GoverningBodyOption[] = [];

  async getIdsForLabel(label: string): Promise<Array<string>> {
    const classifications = await this.store.query(
      'governing-body-classification-code',
      {
        'filter[label]': label,
      },
    );

    return classifications.slice().map((c) => c.id);
  }

  get labelsForSelectedIds() {
    return this.options
      .filter(
        (o) =>
          this.filterService.filters.governingBodyClassificationIds.filter(
            (id) => new RegExp('\\b' + id + '\\b').test(o.id),
          ).length >= 1,
      )
      .map((o) => o.label);
  }

  async loadOptions() {
    const { municipalityLabels, provinceLabels } = this.filterService.filters;
    let classifications: Array<GoverningBodyClassificationCodeModel> = [];
    const isGovernmentSet =
      municipalityLabels?.length >= 1 || provinceLabels?.length >= 1;
    if (isGovernmentSet) {
      const municipalityIds =
        await this.municipalityList.getLocationIdsFromLabels(
          serializeArray(municipalityLabels),
        );
      const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
        serializeArray(provinceLabels),
      );
      const governingBodies = await this.store.query('governing-body', {
        filter: {
          'administrative-unit': {
            location: {
              ':id:': [...municipalityIds, ...provinceIds].join(','),
            },
          },
        },
        'filter[:has:classification]': true,
        // 'filter[:has:sessions]': true, Not suer if we actually want this, maybe people think there are missing bodies
        page: { size: 100 },
      });

      classifications = await this.getClassificationsForGoverningBodies(
        governingBodies.slice(),
      );
    } else {
      const adapterClassifications = await this.store.query(
        'governing-body-classification-code',
        {
          sort: 'label',
          page: { size: 999 },
        },
      );
      classifications = adapterClassifications.slice();
    }
    this.options = this.sortOptions(
      this.getUniqueClassifications(classifications),
    );

    return this.options;
  }

  sortOptions(options: GoverningBodyOption[]): GoverningBodyOption[] {
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }

  async getClassificationsForGoverningBodies(
    governingBodies: Array<GoverningBodyModel>,
  ): Promise<Array<GoverningBodyClassificationCodeModel>> {
    const adapterClassifications = await this.store.query(
      'governing-body-classification-code',
      {
        'filter[governing-bodies][:id:]': governingBodies
          .map((b) => b.id)
          .join(','),
        sort: 'label',
        page: { size: 999 },
      },
    );

    return adapterClassifications.slice();
  }

  getUniqueClassifications(
    classifications: Array<GoverningBodyClassificationCodeModel>,
  ) {
    const labelsWithIdsMap: { [label: string]: string[] } = {};
    classifications.map((classification) => {
      if (!(classification.label in labelsWithIdsMap)) {
        labelsWithIdsMap[classification.label] = [];
      }
      (labelsWithIdsMap[classification.label] as Array<string>).push(
        classification.id,
      );
    });
    return Object.entries(labelsWithIdsMap).map(
      ([label, ids]: [string, Array<string>]) => {
        return {
          id: serializeArray(ids, ','),
          label,
          type: QueryParameterKeys.governingBodies,
        };
      },
    );
  }
}
declare module '@ember/service' {
  interface Registry {
    'governing-body-list': GoverningBodyListService;
  }
}
