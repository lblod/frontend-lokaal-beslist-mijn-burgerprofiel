import Route from '@ember/routing/route';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { getCount } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

import type Store from '@ember-data/store';
import type Transition from '@ember/routing/transition';
import type DataQualityController from 'frontend-burgernabije-besluitendatabank/controllers/data-quality';
import type AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import type VoteModel from 'frontend-burgernabije-besluitendatabank/models/vote';
import type FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';
import type MbpEmbedService from 'frontend-burgernabije-besluitendatabank/services/mbp-embed';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

export default class DataQualityRoute extends Route {
  @service declare store: Store;
  @service declare features: FeaturesService;
  @service declare mbpEmbed: MbpEmbedService;

  @action
  loading(transition: Transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(
      'data-quality',
    ) as DataQualityController;
    controller.currentlyLoading = true;
    transition.promise.finally(() => {
      controller.currentlyLoading = false;
    });
  }

  queryParams = {
    municipalityLabel: {
      as: 'gemeentes',
      refreshModel: true,
    },
  };

  beforeModel() {
    this.mbpEmbed.setLoadingStateFalse();
  }

  async model(params: { municipalityLabel: string[] }) {
    if (this.features.isEnabled('statistics-page-feature')) {
      let agendaItemsPerGoverningBodyClassification = [];

      const totalAgendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
        await this.store.query('agenda-item', {
          filter: {
            sessions: {
              'governing-body': {
                'administrative-unit': {
                  location: {
                    label: params.municipalityLabel || undefined,
                  },
                },
              },
            },
          },
          size: 1,
        });

      const totalCountAgendaItems = getCount(totalAgendaItems) || 0;

      const totalCountAgendaItemsWithTitleAndDescription: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
        await this.store.query('agenda-item', {
          filter: {
            ':has:title': true,
            ':has:description': true,
            sessions: {
              'governing-body': {
                'administrative-unit': {
                  location: {
                    label: params.municipalityLabel || undefined,
                  },
                },
              },
            },
          },
          size: 1,
        });

      const percentageAgendaItemsWithTitleAndDescriptionToTotal = Math.round(
        ((getCount(totalCountAgendaItemsWithTitleAndDescription) || 0) /
          (totalCountAgendaItems || 1)) *
          100,
      );

      const totalCountAgendaItemsTreated: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
        await this.store.query('agenda-item', {
          filter: {
            ':or:': {
              sessions: {
                ':has:started-at': true,
                ':has:ended-at': true,
              },
            },
            sessions: {
              'governing-body': {
                'administrative-unit': {
                  location: {
                    label: params.municipalityLabel || undefined,
                  },
                },
              },
            },
          },
          size: 1,
        });

      const percentageAgendaItemsTreatedToTotal = Math.round(
        ((getCount(totalCountAgendaItemsTreated) || 0) /
          (totalCountAgendaItems || 1)) *
          100,
      );

      // get all classifications (governing bodies) from the store and dont get duplicates
      const allGoverningBodyClassifications = await this.store.findAll(
        'governing-body-classification-code',
      );

      // put all of the classifications through a loop to get the count of agenda items per classification

      const agendaItemsPromises = allGoverningBodyClassifications
        .filter(
          // filter out duplicates
          (classification, index, self) =>
            self.findIndex((c) => c.label === classification.label) === index,
        )
        .map(async (governingBody) => {
          const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
            await this.store.query('agenda-item', {
              filter: {
                sessions: {
                  'governing-body': {
                    'administrative-unit': {
                      location: {
                        label: params.municipalityLabel || undefined,
                      },
                    },
                    classification: {
                      label: governingBody.label,
                    },
                  },
                },
              },
              size: 1,
            });

          return {
            classification: governingBody.label,
            count: getCount(agendaItems) || 0,
          };
        });

      // resolve the promises
      agendaItemsPerGoverningBodyClassification =
        await Promise.all(agendaItemsPromises);

      agendaItemsPerGoverningBodyClassification =
        agendaItemsPerGoverningBodyClassification.map((item) => ({
          ...item,
          percentage: ((item.count || 0) / (totalCountAgendaItems || 1)) * 100,
        }));

      // first sort by label then sort by count descending set total at the begining of the array
      agendaItemsPerGoverningBodyClassification.sort((a, b) => {
        const countComparison = (b.count || 0) - (a.count || 0);
        if (countComparison !== 0) {
          return countComparison;
        }
        return (a.classification || '').localeCompare(b.classification || '');
      });

      // get the total count of agenda items which have a vote or voters

      const agendaItemsWithVoteOrVoters: AdapterPopulatedRecordArrayWithMeta<VoteModel> =
        await this.store.query('vote', {
          'filter[:or:][handled-by][subject][sessions][governing-body][is-time-specialization-of][administrative-unit][location][label]':
            params.municipalityLabel || undefined,
          'filter[:or:][handled-by][subject][sessions][governing-body][administrative-unit][location][label]':
            params.municipalityLabel || undefined,
          size: 1,
        });

      const percentageAgendaItemsWithVoteOrVotersToTotal = Math.round(
        ((getCount(agendaItemsWithVoteOrVoters) || 0) /
          (totalCountAgendaItems || 1)) *
          100,
      );

      return {
        totalCountAgendaItems,
        percentageAgendaItemsTreatedToTotal,
        percentageAgendaItemsWithTitleAndDescriptionToTotal,
        agendaItemsPerGoverningBodyClassification,
        percentageAgendaItemsWithVoteOrVotersToTotal,
      };
    }
  }
}
