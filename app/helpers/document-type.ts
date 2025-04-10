import { helper } from '@ember/component/helper';

type DocumentTypeArgs = [string];

export default helper(function documentType([url]: DocumentTypeArgs): string {
  if (typeof url !== 'string') {
    return 'Onbekend Type';
  }

  if (url.includes('agenda')) {
    return 'Agenda';
  } else if (url.includes('besluitenlijst') || url.includes('besluit')) {
    return 'Besluitenlijst';
  } else if (url.includes('notulen') || url.includes('notule')) {
    return 'Notule';
  } else {
    return 'Onbekend Type';
  }
});
