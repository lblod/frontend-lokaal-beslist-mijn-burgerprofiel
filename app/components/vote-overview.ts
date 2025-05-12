import Component from '@glimmer/component';
import type MandataryModel from 'frontend-burgernabije-besluitendatabank/models/mandatary';
import type VoteModel from 'frontend-burgernabije-besluitendatabank/models/vote';

interface ArgsInterface {
  numberOfAbstentions: number;
  numberOfOpponents: number;
  numberOfProponents: number;
  vote: VoteModel;
}

const strokeDashArray = 158;

const sortByFamilyName = (a: MandataryModel, b: MandataryModel) => {
  const aFamilyName = (a?.aliasValue?.familyName || '').toLowerCase();
  const bFamilyName = (b?.aliasValue?.familyName || '').toLowerCase();

  return aFamilyName.localeCompare(bFamilyName);
};

export default class VoteOverview extends Component<ArgsInterface> {
  get abstainers() {
    return this.args.vote.hasAbstainers.slice().sort(sortByFamilyName);
  }

  get opponents() {
    return this.args.vote.hasOpponents.slice().sort(sortByFamilyName);
  }

  get proponents() {
    return this.args.vote.hasProponents.slice().sort(sortByFamilyName);
  }

  get hasVotersData() {
    const abstainers = this.args.vote.hasAbstainers;
    const opponents = this.args.vote.hasOpponents;
    const proponents = this.args.vote.hasProponents;

    const hasAbstainers = Array.isArray(abstainers) && abstainers.length > 0;
    const hasOpponents = Array.isArray(opponents) && opponents.length > 0;
    const hasProponents = Array.isArray(proponents) && proponents.length > 0;

    return hasAbstainers || hasOpponents || hasProponents;
  }

  get numberOfAbstentions() {
    return this.args.vote.numberOfAbstentions || 0;
  }

  get numberOfOpponents() {
    return this.args.vote.numberOfOpponents || 0;
  }

  get numberOfProponents() {
    return this.args.vote.numberOfProponents || 0;
  }

  private get totalVoters() {
    return (
      this.numberOfAbstentions +
      this.numberOfOpponents +
      this.numberOfProponents
    );
  }

  get numberOfAbstentionsGraphValue() {
    return this.totalVoters > 0
      ? (this.numberOfAbstentions / this.totalVoters) * strokeDashArray
      : 0;
  }

  get numberOfOpponentsGraphValue() {
    return this.totalVoters > 0
      ? (this.numberOfOpponents / this.totalVoters) * strokeDashArray
      : 0;
  }

  get numberOfProponentsGraphValue() {
    return this.totalVoters > 0
      ? (this.numberOfProponents / this.totalVoters) * strokeDashArray
      : 0;
  }

  get hasContentToShow() {
    return (
      !this.totalVoters && !this.args.vote.consequence && !this.hasVotersData
    );
  }
}
