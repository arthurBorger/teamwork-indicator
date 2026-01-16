export const Columns = {
  GroupNumber: 'Gruppenummer',
  ID: 'ID',
  Start: 'Starttidspunkt',
  End: 'Fullføringstidspunkt',
  Email: 'E-postadresse',
  Name: 'Navn',
  LastChanged: 'Tidspunkt for siste endring',
} as const;

export type ColumnName = (typeof Columns)[keyof typeof Columns];
