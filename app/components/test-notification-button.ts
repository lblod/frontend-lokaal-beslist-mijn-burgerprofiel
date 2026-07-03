import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type SessionService from 'frontend-burgernabije-besluitendatabank/services/session';

// TEMPORARY: manual button to verify the end-to-end notification chain.
// Only rendered for authenticated users. Safe to remove once verified.
export default class TestNotificationButton extends Component {
  @service declare session: SessionService;

  @tracked status: 'idle' | 'sending' | 'sent' | 'error' = 'idle';

  get label() {
    switch (this.status) {
      case 'sending':
        return 'Versturen…';
      case 'sent':
        return 'Verstuurd ✓';
      case 'error':
        return 'Mislukt — opnieuw';
      default:
        return 'Stuur testnotificatie';
    }
  }

  @action
  async send() {
    if (this.status === 'sending') return;
    this.status = 'sending';
    const ok = await this.session.sendTestNotification();
    this.status = ok ? 'sent' : 'error';
  }
}
