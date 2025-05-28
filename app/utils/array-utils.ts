interface WithTitle {
  title: string;
}

interface WithLabel {
  label: string;
}
export const sortObjectsByTitle = (a: WithTitle, b: WithTitle) =>
  a.title.localeCompare(b.title, undefined, { numeric: true });

export const sortObjectsByLabel = (a: WithLabel, b: WithLabel) =>
  a.label.localeCompare(b.label, undefined, { numeric: true });
