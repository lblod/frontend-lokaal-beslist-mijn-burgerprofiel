import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class KeywordStoreService extends Service {
  @tracked keyword = '';
}
