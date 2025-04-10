import type Store from '@ember-data/store';
import Service, { service } from '@ember/service';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
export default class ProvinceListService extends Service {
  @service declare store: Store;
  private _provinces?: Array<{ label: string; id: string }>;

  async provinces() {
    if (!this._provinces) {
      this._provinces = await this._loadProvinces();
    }

    return this._provinces;
  }

  async provinceLabels() {
    if (!this._provinces) {
      this._provinces = await this._loadProvinces();
    }
    return this._provinces;
  }

  async getProvinceIdsFromLabels(
    labels: Array<string> | string,
  ): Promise<Array<string>> {
    const provinces = await this.provinces();
    if (!labels || labels.length === 0) {
      return [];
    }

    const provinceIds = provinces
      .filter((province) => labels.includes(province.label))
      .map(({ id }) => id);

    return provinceIds;
  }

  private async _loadProvinces() {
    const provinces = await this.store.query('location', {
      filter: {
        niveau: 'Provincie',
      },
      page: { size: 100 },
    });
    return provinces.map((province) => ({
      label: province.label,
      id: province.id,
      type: QueryParameterKeys.provinces,
    }));
  }
}
declare module '@ember/service' {
  interface Registry {
    'province-list': ProvinceListService;
  }
}
