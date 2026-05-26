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
    if (!handoverToken) return;

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

        const filterService = getOwner(this)?.lookup(
          'service:filter-service',
        ) as FilterService | undefined;
        try {
          await filterService?.reconcileWithBackend();
        } catch (e) {
          console.warn('saved-filter reconcile failed:', e);
        }
      } else {
        console.error('Handover token exchange failed:', response.status);
      }
    } catch (e) {
      console.error('Session initialization failed:', e);
    } finally {
      this.removeHandoverTokenFromUrl();
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
