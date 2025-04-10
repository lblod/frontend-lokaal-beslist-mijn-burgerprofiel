import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type MunicipalityListService from './municipality-list';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type GoverningBodyClasssificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';
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

  @tracked selected: GoverningBodyOption[] = [];
  @tracked options: GoverningBodyOption[] = [];

  constructor(...args: []) {
    super(...args);
    this.loadOptions();
  }

  /**
   * Get the governing body classification ids from the given labels.
   * @returns The governing body classifcation ids.
   **/

  async getGoverningBodyClassificationIdsFromLabels(
    governingBodyLabels?: Array<string> | string,
  ): Promise<string | undefined> {
    if (!governingBodyLabels) {
      return undefined;
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
    const { municipalityLabels, governingBodyClassifications, provinceLabels } =
      this.filterService.filters;
    if (
      (municipalityLabels == undefined || municipalityLabels == '') &&
      (provinceLabels == undefined || provinceLabels == '')
    ) {
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
          municipalityLabels?.replace(',', '+'),
        );
      const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
        provinceLabels?.replace(',', '+'),
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
    if (governingBodyClassifications != null) {
      this.selected = this.options.filter((option) =>
        governingBodyClassifications.split('+').includes(option.label),
      );
      if (this.selected.length == 0) {
        this.router.transitionTo({
          queryParams: {
            bestuursorganen: null,
          },
        });
      }
    }

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
    classifications: AdapterPopulatedRecordArrayWithMeta<GoverningBodyClasssificationCodeModel>,
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
