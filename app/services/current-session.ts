import Service from '@ember/service';

export default class CurrentSessionService extends Service {
  get isVlaanderenLogin() {
    return true;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:current-session')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('current-session') declare altName: CurrentSessionService;`.
declare module '@ember/service' {
  interface Registry {
    'current-session': CurrentSessionService;
  }
}
