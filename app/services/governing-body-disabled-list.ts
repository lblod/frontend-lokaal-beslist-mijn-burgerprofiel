import Service from '@ember/service';

export default class GoverningBodyDisabledList extends Service {
  list: Array<string> = [];

  get disabledList(): Array<string> {
    return this.list;
  }

  set disabledList(value: Array<string>) {
    this.list = value;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:government-list')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('government-list') declare altName: GovernmentListService;`.
declare module '@ember/service' {
  interface Registry {
    'governing-body-disabled-list': GoverningBodyDisabledList;
  }
}
