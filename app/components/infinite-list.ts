import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface ArgsInterface {
  loadMore: () => void;
  isLoading: boolean;
  itemsShown: number;
  itemsAmount: number;
}

export default class InfiniteList extends Component<ArgsInterface> {
  isScrolling = false;
  @tracked showScrollToTopButton = false;

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

    // trigger loadMore when >80% is scrolled
    if (scrollPercentage > 0.9 && !this.args.isLoading) {
      this.loadMore();
    }
    this.showScrollToTopButton = scrollTop > clientHeight / 2;
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
