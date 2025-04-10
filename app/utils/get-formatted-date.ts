import { lightFormat } from 'date-fns';

export const getFormattedDate = (date: Date) =>
  date ? lightFormat(date, 'dd/MM/yyyy') : '';
