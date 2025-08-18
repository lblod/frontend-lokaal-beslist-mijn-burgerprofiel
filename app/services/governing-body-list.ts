import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import {
  deserializeArray,
  serializeArray,
} from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type MunicipalityListService from './municipality-list';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type GoverningBodyClassificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
import type GovernmentListService from './government-list';
import type FilterService from './filter-service';
import type ProvinceListService from './province-list';

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

  /**
   * Get the governing body classification ids from the given labels.
   * @returns The governing body classification ids.
   **/

  async getGoverningBodyClassificationIdsFromLabels(
    governingBodyLabels: Array<string> | string | null,
  ): Promise<string | null> {
    if (!governingBodyLabels) {
      return null;
    }

    const options = await this.loadOptions();

    const governingBodyLabelsArray = Array.isArray(governingBodyLabels)
      ? governingBodyLabels
      : deserializeArray(governingBodyLabels);
    const governingBodyClassificationIds = options.reduce(
      (acc, governingBody) => {
        if (governingBodyLabelsArray.includes(governingBody.label)) {
          acc.push(governingBody.id);
        }
        return acc;
      },
      [] as Array<string>,
    );

    return governingBodyClassificationIds.join(',');
  }

  async loadOptions() {
    const {
      municipalityLabels,
      governingBodyClassificationIds,
      provinceLabels,
    } = this.filterService.filters;
    if (municipalityLabels?.length === 0 && provinceLabels?.length === 0) {
      const governingBodyClassifications = await this.store.query(
        'governing-body-classification-code',
        {
          page: { size: 100 },
          sort: 'label',
        },
      );
      this.options = this.sortOptions(
        this.getUniqueClassifications(governingBodyClassifications),
      );
    } else {
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
              ':id:': municipalityIds.join(',') + provinceIds.join(','),
            },
          },
        },
        include: 'classification',
        page: { size: 100 },
      });
      this.options = this.sortOptions(
        this.getUniqueGoverningBodies(governingBodies),
      );
    }
    this.selectedIds = governingBodyClassificationIds;

    return this.options;
  }

  async fetchBestuursorgaanOptions(
    gemeenteLabel?: string,
  ): Promise<Array<GoverningBodyOption>> {
    if (!gemeenteLabel) {
      return [];
    }

    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(gemeenteLabel);
    const governingBodies = await this.store.query('governing-body', {
      filter: {
        'administrative-unit': {
          location: {
            ':id:': municipalityIds.join(','),
          },
        },
      },
      include: 'classification',
    });
    this.options = this.sortOptions(
      this.getUniqueGoverningBodies(governingBodies),
    );

    return this.options;
  }

  sortOptions(options: GoverningBodyOption[]): GoverningBodyOption[] {
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }

  getUniqueGoverningBodies(
    govBodies: AdapterPopulatedRecordArrayWithMeta<GoverningBodyModel>,
  ) {
    const uniqueLabels = new Set();

    return govBodies
      .filter((govBody) => {
        const label = govBody.classification.get('label');
        if (label && !uniqueLabels.has(label)) {
          uniqueLabels.add(label);
          return true;
        }
        return false;
      })
      .map((govBody) => ({
        id: govBody.classification.get('id') ?? '',
        label: govBody.classification.get('label') ?? '',
        type: QueryParameterKeys.governingBodies,
      }));
  }

  getUniqueClassifications(
    classifications: AdapterPopulatedRecordArrayWithMeta<GoverningBodyClassificationCodeModel>,
  ) {
    const uniqueLabels = new Set();

    return classifications
      .filter((classification) => {
        if (!uniqueLabels.has(classification.label)) {
          uniqueLabels.add(classification.label);
          return true;
        }
        return false;
      })
      .map((classification) => ({
        id: classification.id,
        label: classification.label,
        type: QueryParameterKeys.governingBodies,
      }));
  }
}
declare module '@ember/service' {
  interface Registry {
    'governing-body-list': GoverningBodyListService;
  }
}
