interface WithTitle {
  title: string;
}

export const sortObjectsByTitle = (a: WithTitle, b: WithTitle) =>
  a.title.localeCompare(b.title, undefined, { numeric: true });
