import Service from '@ember/service';
import { getOwner } from '@ember/owner';
import { tracked } from '@glimmer/tracking';

import type FilterService from './filter-service';

export default class SessionService extends Service {
  @tracked isAuthenticated = false;
  @tracked firstName: string | null = null;
  @tracked lastName: string | null = null;

  get fullName() {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || null;
  }

  async initialize(handoverToken?: string) {
    if (handoverToken) {
      await this.exchangeHandoverToken(handoverToken);
    } else {
      await this.restoreSession();
    }
  }

  private async exchangeHandoverToken(handoverToken: string) {
    try {
      const response = await fetch('/auth/v1/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/vnd.api+json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token: handoverToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.firstName = data.data?.attributes?.firstName ?? null;
        this.lastName = data.data?.attributes?.lastName ?? null;
        this.isAuthenticated = true;
        await this.loadFilters();
      } else {
        console.error('Handover token exchange failed:', response.status);
      }
    } catch (e) {
      console.error('Session initialization failed:', e);
    } finally {
      this.removeHandoverTokenFromUrl();
    }
  }

  private async restoreSession() {
    try {
      const response = await fetch('/auth/v1/session', {
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        this.firstName = data.data?.attributes?.firstName ?? null;
        this.lastName = data.data?.attributes?.lastName ?? null;
        this.isAuthenticated = true;
        await this.loadFilters();
      }
    } catch (e) {
      console.warn('Session restore failed:', e);
    }
  }

  private async loadFilters() {
    const filterService = getOwner(this)?.lookup('service:filter-service') as
      | FilterService
      | undefined;
    try {
      await filterService?.reconcileWithBackend();
    } catch (e) {
      console.warn('saved-filter reconcile failed:', e);
    }
  }

  // Fires a simple test notification to the signed-in user via the
  // push-notification-service. Resolves to true on success (HTTP 2xx).
  async sendTestNotification(): Promise<boolean> {
    if (!this.isAuthenticated) return false;
    try {
      const response = await fetch('/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });
      if (!response.ok) {
        console.warn('test-notification failed:', response.status);
      }
      return response.ok;
    } catch (e) {
      console.warn('test-notification error:', e);
      return false;
    }
  }

  async logout() {
    try {
      await fetch('/auth/v1/session', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      this.isAuthenticated = false;
      this.firstName = null;
      this.lastName = null;
    }
  }

  private removeHandoverTokenFromUrl() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('token')) {
      url.searchParams.delete('token');
      history.replaceState(null, '', url.toString());
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    session: SessionService;
  }
}
