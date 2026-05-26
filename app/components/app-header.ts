import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type SessionService from 'frontend-burgernabije-besluitendatabank/services/session';

export default class AppHeaderComponent extends Component {
  @service declare session: SessionService;

  @action
  async logout() {
    await this.session.logout();
  }
}
