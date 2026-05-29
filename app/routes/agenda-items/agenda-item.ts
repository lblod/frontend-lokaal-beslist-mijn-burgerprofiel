import type Store from '@ember-data/store';
import Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type AgendaItemController from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/agenda-item';
import type AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import type ArticleModel from 'frontend-burgernabije-besluitendatabank/models/article';
import type ConceptModel from 'frontend-burgernabije-besluitendatabank/models/concept';
import type VoteModel from 'frontend-burgernabije-besluitendatabank/models/vote';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';
import {
  formatLatLon,
  osmUrlFromLabel,
  osmUrlFromWkt,
  wgs84FromWkt,
} from 'frontend-burgernabije-besluitendatabank/utils/openstreetmap';

interface DetailParams {
  id: string;
}

interface LocationEntry {
  id: string;
  label?: string;
  href: string;
}

interface AgendaItemRouteModel {
  agendaItem: AgendaItemModel;
  vote?: VoteModel;
  articles: ArticleModel[];
  themes: ConceptModel[];
  locations: LocationEntry[];
  agendaItemOnSameSession: AgendaItemModel[];
  similiarAgendaItems: AgendaItemModel[];
}

export default class AgendaItemRoute extends Route {
  @service declare router: Route;
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;
  @service declare mbpEmbed: MbpEmbedService;

  beforeModel() {
    this.mbpEmbed.setLoadingStateFalse();
  }

  async model(params: DetailParams) {
    const agendaItem = await this.store.findRecord('agenda-item', params.id, {
      include:
        'has-themes,has-location,handled-by.resolutions.has-themes,handled-by.resolutions.has-location.geometry',
    });

    // wait until sessions are loaded
    const sessions = await agendaItem.sessions;
    // SessionModel expects the following to be loaded:
    // - governingBody.isTimeSpecializationOf.administrativeUnit.location
    // - governingBody.administrativeUnit.location
    // to resolve municipality & governingBody name
    await Promise.all(
      sessions?.map(async (session) => {
        const governingBody = await session.governingBody;
        const isTimeSpecializationOf =
          await governingBody?.isTimeSpecializationOf;
        let administrativeUnit =
          await isTimeSpecializationOf?.administrativeUnit;
        await administrativeUnit?.location;
        administrativeUnit = await governingBody?.administrativeUnit;
        await administrativeUnit?.location;
      }) || [],
    );
    const sessionId = agendaItem.session?.id;
    const agendaItemOnSameSessionRaw = sessionId
      ? await this.store.query('agenda-item', {
          filter: {
            sessions: {
              [':id:']: sessionId,
            },
          },
        })
      : [];

    const agendaItemOnSameSession = agendaItemOnSameSessionRaw
      .filter((item) => item.id !== agendaItem.id && !!item.title)
      .sort(sortObjectsByTitle)
      .slice(0, 4);

    const agendaItemHandling = await agendaItem.handledBy;
    const vote = (await agendaItemHandling?.hasVotes)?.slice().shift();

    // load resolution and articles
    const resolutions = await agendaItemHandling?.resolutions;
    const articles = (
      await Promise.all(
        resolutions?.map(async (resolution) => {
          return (await resolution.articles).slice();
        }) || [],
      )
    )
      .flat()
      .sort((a, b) => a.numberAsInt - b.numberAsInt);

    // Themes can be linked to the agenda-item directly (sro:heeftThema), but in
    // practice they live on the generated resolution (dct:subject). Merge both
    // sources and de-duplicate by id so the detail page shows them either way.
    const agendaItemThemes = (await agendaItem.hasThemes)?.slice() ?? [];
    const resolutionThemes = (
      await Promise.all(
        resolutions?.map(
          async (resolution) => (await resolution.hasThemes)?.slice() ?? [],
        ) || [],
      )
    ).flat();
    const themesById = new Map<string, ConceptModel>();
    [...agendaItemThemes, ...resolutionThemes].forEach((theme) => {
      themesById.set(theme.id, theme);
    });
    const themes = [...themesById.values()];

    // Locations follow the same pattern as themes: the agenda-item can carry
    // them directly (sro:heeftLocatie), but in practice the physical place
    // (locn:Location) lives on the resolution (prov:atLocation). The place's
    // geometry holds Lambert 72 (EPSG:31370) coordinates, which we convert to
    // WGS84 to build a precise OpenStreetMap link; otherwise we fall back to a
    // label search.
    const agendaItemLocations: LocationEntry[] = (
      (await agendaItem.hasLocation)?.slice() ?? []
    ).map((location) => ({
      id: location.id,
      label: location.label,
      href: osmUrlFromLabel(location.label),
    }));
    const resolutionLocations = (
      await Promise.all(
        resolutions?.map(async (resolution): Promise<LocationEntry[]> => {
          const place = await resolution.hasLocation;
          if (!place) {
            return [];
          }
          const geometry = await place.geometry;
          const latLon = wgs84FromWkt(geometry?.coordinates);
          // Fall back to the coordinates when the place has no label.
          const label =
            place.label || (latLon ? formatLatLon(latLon) : undefined);
          const href =
            osmUrlFromWkt(geometry?.coordinates) ??
            osmUrlFromLabel(place.label);
          return [{ id: place.id, label, href }];
        }) || [],
      )
    ).flat();
    const locationsById = new Map<string, LocationEntry>();
    [...agendaItemLocations, ...resolutionLocations].forEach((location) => {
      locationsById.set(location.id, location);
    });
    const locations = [...locationsById.values()];

    const locationId = agendaItem.session?.municipalityId;

    // load 5 similiar agenda items in order to filter out the current agenda item
    const similarAgendaItemsPromise = this.constructRelatedItems(
      locationId,
      agendaItem,
    );
    return {
      resolutions,
      agendaItem,
      vote,
      articles,
      themes,
      locations,
      agendaItemOnSameSession,
      similarAgendaItemsPromise,
    };
  }

  async constructRelatedItems(
    locationId: string | undefined,
    agendaItem: AgendaItemModel,
  ) {
    return (
      await this.store.query('agenda-item', {
        page: {
          size: 5,
        },
        'filter[:or:][sessions][governing-body][is-time-specialization-of][administrative-unit][location][:id:]':
          locationId,
        'filter[:or:][sessions][governing-body][administrative-unit][location][:id:]':
          locationId,
        filter: {
          ':or:': {
            title: this.keywordStore.keyword || undefined,
            description: this.keywordStore.keyword || undefined,
          },
        },
      })
    )
      .filter((item) => item.id !== agendaItem.id && !!item.title)
      .slice(0, 4);
  }

  afterModel(model: AgendaItemRouteModel) {
    if (
      this.governingBodyDisabledList.list.includes(
        model.agendaItem.governingBodyIdResolved || '',
      )
    ) {
      this.router.transitionTo('agenda-items.index');
    }
  }

  resetController(
    controller: AgendaItemController,
    isExiting: boolean,
    transition: Transition,
  ) {
    super.resetController(controller, isExiting, transition);
    if (isExiting) {
      controller.closeModal();
    }
  }
}
