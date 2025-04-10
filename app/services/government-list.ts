import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type FilterService from './filter-service';
import type MunicipalityListService from './municipality-list';
import type ProvinceListService from './province-list';

export enum LocalGovernmentType {
  Municipality = 'gemeentes',
  Province = 'provincies',
}

export interface LocalGovernmentOption {
  id?: string;
  label: string;
  type?: LocalGovernmentType;
}

export interface LocalGovernmentGroup {
  groupName: string;
  options: LocalGovernmentOption[];
}

export default class GovernmentListService extends Service {
  @service declare filterService: FilterService;
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;

  @tracked selected: LocalGovernmentOption[] = [];

  get options() {
    return Promise.all([this.municipalities, this.provinces]).then(
      ([municipalities, provinces]) => {
        this.syncSelectedGovernments(municipalities, provinces);
        return [
          { groupName: 'Gemeente', options: municipalities },
          { groupName: 'Provincie', options: provinces },
        ];
      },
    );
  }

  private syncSelectedGovernments(
    municipalities: LocalGovernmentOption[],
    provinces: LocalGovernmentOption[],
  ): void {
    const { municipalityLabels, provinceLabels } = this.filterService.filters;

    const selectedMunicipalities = municipalityLabels
      ? municipalityLabels.split('+').map((municipality) => {
          const matchedMunicipality = municipalities.find(
            (m) => m.label === municipality,
          );
          return (
            matchedMunicipality || {
              id: 'unknown',
              label: municipality,
              type: LocalGovernmentType.Municipality,
            }
          );
        })
      : [];

    const selectedProvinces = provinceLabels
      ? provinceLabels.split('+').map((province) => {
          const matchedProvince = provinces.find((p) => p.label === province);
          return (
            matchedProvince || {
              id: 'unknown',
              label: province,
              type: LocalGovernmentType.Province,
            }
          );
        })
      : [];

    this.selected = [...selectedMunicipalities, ...selectedProvinces];
  }

  private get municipalities() {
    return this.municipalityList.municipalityLabels();
  }

  private get provinces() {
    return this.provinceList.provinceLabels();
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:government-list')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('government-list') declare altName: GovernmentListService;`.
declare module '@ember/service' {
  interface Registry {
    'government-list': GovernmentListService;
  }
}
