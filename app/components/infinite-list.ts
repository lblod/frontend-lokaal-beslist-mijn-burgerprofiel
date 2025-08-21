import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { restartableTask, timeout } from 'ember-concurrency';

interface ArgsInterface {
  loadMore: () => void;
  isLoading: boolean;
  itemsShown: number;
  itemsAmount: number;
}

export default class InfiniteList extends Component<ArgsInterface> {
  isScrolling = false;
  @tracked showScrollToTopButton = false;
  @tracked currentScrollTop = 0;

  @action
  scroll(event: Event) {
    if (!this.isScrolling) {
      this.isScrolling = true;
      requestAnimationFrame(() => {
        this._onScroll(event);
        this.isScrolling = false;
      });
    }
  }

  get moreDataToLoad() {
    return this.args.itemsShown < this.args.itemsAmount;
  }

  _onScroll(event: Event) {
    const { scrollTop, scrollHeight, clientHeight } =
      event.target as HTMLElement;
    const scrollTopMax = scrollHeight - clientHeight;
    const scrollPercentage = scrollTop / scrollTopMax;

    // trigger loadMore when > 60% is scrolled
    if (scrollPercentage >= 0.6 && !this.args.isLoading) {
      this.loadMore();
    }
    this.manageScrollToTopButton.perform(scrollTop, clientHeight);
    this.setPagePositionLine(scrollPercentage);
  }

  manageScrollToTopButton = restartableTask(
    async (scrollTop: number, clientHeight: number) => {
      const isScrollingToTop = scrollTop < this.currentScrollTop;
      this.currentScrollTop = scrollTop;
      if (!isScrollingToTop) {
        await timeout(500);
        this.showScrollToTopButton = false;
        return;
      }
      const scrollTriggerOnPage = 4;
      this.showScrollToTopButton =
        scrollTop > clientHeight * scrollTriggerOnPage;
    },
  );

  setPagePositionLine(scrollPercentage: number) {
    const absoluteItemPosition = this.args.itemsShown * scrollPercentage;
    const totalPercentage = absoluteItemPosition / this.args.itemsAmount;
    const pixels = totalPercentage * window.innerWidth;
    const line = document.getElementById('page-position-line');
    if (line) {
      line?.style.setProperty('width', `${pixels}px`);
    }
  }

  @action
  scrollToTop() {
    document
      .getElementsByClassName('c-infinite-list')[0]
      ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  @action
  loadMore() {
    if (this.moreDataToLoad && !this.args.isLoading) {
      this.args.loadMore();
    }
  }
}
