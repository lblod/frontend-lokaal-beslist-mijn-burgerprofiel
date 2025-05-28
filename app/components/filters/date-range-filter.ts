import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import { cached, tracked } from '@glimmer/tracking';
import {
  endOfMonth,
  endOfWeek as endOfWeekDateFns,
  endOfYear,
  formatISO,
  startOfMonth,
  startOfWeek as startOfWeekDateFns,
  startOfYear,
  sub,
} from 'date-fns';
type ISODateString = string;

interface Signature {
  Args: {
    startQueryParam: string;
    endQueryParam: string;
    start?: ISODateString;
    end?: ISODateString;
    updateSelected: (
      start: ISODateString | null,
      end: ISODateString | null,
    ) => void;
  };
}

enum Preset {
  Future = 'Toekomst',
  ThisWeek = 'Deze week',
  LastWeek = 'Vorige week',
  ThisMonth = 'Deze maand',
  LastMonth = 'Vorige maand',
  ThisYear = 'Dit jaar',
  LastYear = 'Vorig jaar',
}

export default class DateRangeFilterComponent extends Component<Signature> {
  readonly MIN = '2015-01-01';
  readonly MAX = '2100-12-31';
  readonly MIN_DATE = new Date(this.MIN);
  readonly MAX_DATE = new Date(this.MAX);

  @service declare router: RouterService;
  @tracked start: ISODateString | null;
  @tracked end: ISODateString | null;
  @tracked selectedPreset: Preset | null = null;
  @tracked isChoosingPresets = true;
  @tracked endDateError?: string[];
  @tracked startDateError?: string[];

  presets = [
    Preset.Future,
    Preset.ThisWeek,
    Preset.LastWeek,
    Preset.ThisMonth,
    Preset.LastMonth,
    Preset.ThisYear,
    Preset.LastYear,
  ];

  @cached
  get presetDateRanges() {
    const today = new Date();
    return {
      [Preset.Future]: [toIsoDateString(today), this.MAX],
      [Preset.ThisWeek]: [
        toIsoDateString(startOfWeek(today)),
        toIsoDateString(endOfWeek(today)),
      ],
      [Preset.LastWeek]: [
        toIsoDateString(startOfWeek(sub(today, { weeks: 1 }))),
        toIsoDateString(endOfWeek(sub(today, { weeks: 1 }))),
      ],
      [Preset.ThisMonth]: [
        toIsoDateString(startOfMonth(today)),
        toIsoDateString(endOfMonth(today)),
      ],
      [Preset.LastMonth]: [
        toIsoDateString(startOfMonth(sub(today, { months: 1 }))),
        toIsoDateString(endOfMonth(sub(today, { months: 1 }))),
      ],
      [Preset.ThisYear]: [
        toIsoDateString(startOfYear(today)),
        toIsoDateString(endOfYear(today)),
      ],
      [Preset.LastYear]: [
        toIsoDateString(startOfYear(sub(today, { years: 1 }))),
        toIsoDateString(endOfYear(sub(today, { years: 1 }))),
      ],
    };
  }

  get hasBothDates(): boolean {
    return Boolean(this.start) && Boolean(this.end);
  }

  get hasNoDates(): boolean {
    return !this.start && !this.end;
  }

  get isInvalidDateRange(): boolean {
    return (
      !!this.start && !!this.end && new Date(this.start) > new Date(this.end)
    );
  }

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);

    const { start, end } = this.args;
    this.start = start ? start : null;
    this.end = end ? end : null;
    this.setInitialPreset();
  }

  @action handleSelectionChange(selectedPreset: Preset | null): void {
    this.selectedPreset = selectedPreset;

    if (selectedPreset) {
      const presetDates = this.presetDateRanges[selectedPreset];

      if (presetDates) {
        const [presetStart = null, presetEnd = null] = presetDates;
        this.start = presetStart;
        this.end = presetEnd;
        this.updateQueryParams();
        this.args.updateSelected(presetStart, presetEnd);
      }
    } else {
      this.resetQueryParams();
    }
  }

  @action handleStartDateChange(newDate: ISODateString | null): void {
    this.start = newDate;

    if (this.isDateComplete(newDate)) {
      this.updateQueryParamsIfValid();
    }
  }

  @action handleEndDateChange(newDate: ISODateString | null): void {
    this.end = newDate;

    if (this.isDateComplete(newDate)) {
      this.updateQueryParamsIfValid();
    }
  }

  isDateComplete(date: ISODateString | null): boolean {
    return date === null || date.length === 10;
  }

  @action chooseCustomRange() {
    this.isChoosingPresets = false;
    this.selectedPreset = null;
  }

  @action choosePresets() {
    this.isChoosingPresets = true;

    if (this.hasNoDates) {
      return;
    }

    const maybePreset = this.findPreset(this.start, this.end);
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else {
      // If the dates don't match a preset we clear the dates. Otherwise the UI would show an empty select while
      // there is still a date filter applied in the background.
      this.resetQueryParams();
    }
  }

  setInitialPreset(): void {
    if (this.hasNoDates) {
      return;
    }

    const maybePreset = this.findPreset(this.start, this.end);
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else {
      // The dates don't match a preset, so we switch to the custom date inputs instead
      this.isChoosingPresets = false;
    }
  }

  findPreset(
    start: ISODateString | null,
    end: ISODateString | null,
  ): Preset | null {
    const NO_PRESET = null;

    const couldMatchPreset = start && end;
    if (couldMatchPreset) {
      const maybePreset = this.presets.find((preset) => {
        const presetDates = this.presetDateRanges[preset];

        if (presetDates) {
          const [presetStart, presetEnd] = presetDates;
          return start === presetStart && end === presetEnd;
        }
      });

      return maybePreset ? maybePreset : NO_PRESET;
    } else {
      return NO_PRESET;
    }
  }

  updateQueryParamsIfValid(): void {
    const startDate = this.start ? new Date(this.start) : new Date();
    const endDate = this.end ? new Date(this.end) : new Date();
    this.startDateError = [];
    this.endDateError = [];
    let isBlocked = false;

    if (startDate > this.MAX_DATE || startDate < this.MIN_DATE) {
      this.startDateError.push(
        'De startdatum moet tussen 1 januari 2015 en 31 december 2100 liggen',
      );
    }
    if (endDate > this.MAX_DATE || endDate < this.MIN_DATE) {
      this.endDateError.push(
        'De einddatum moet tussen 1 januari 2015 en 31 december 2100 liggen',
      );
    }
    if (this.isInvalidDateRange) {
      this.endDateError.push('De startdatum moet voor de einddatum liggen');
      isBlocked = true;
    }
    if (!isBlocked) this.updateQueryParams();
  }

  resetQueryParams(): void {
    this.start = null;
    this.end = null;
    this.updateQueryParams();
    this.args.updateSelected(null, null);
  }

  updateQueryParams(): void {
    this.router.transitionTo({
      queryParams: {
        [this.args.startQueryParam || 'start']: !this.startDateError?.length
          ? this.start
          : null,
        [this.args.endQueryParam || 'end']: !this.endDateError?.length
          ? this.end
          : null,
      },
    });
  }
}

function toIsoDateString(date: Date): ISODateString {
  return formatISO(date, { representation: 'date' });
}

function startOfWeek(date: Date) {
  return startOfWeekDateFns(date, { weekStartsOn: 1 });
}

function endOfWeek(date: Date) {
  return endOfWeekDateFns(date, { weekStartsOn: 1 });
}
