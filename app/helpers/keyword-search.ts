import { helper } from '@ember/component/helper';

type ParsedResults = { [key: string]: string[] };

function getKeywordAdvancedSearch(
  query: string,
  searchField?: string[],
): ParsedResults | null {
  const operators = ['OR', 'NOT', 'MUST'];
  const queryParts = formatQueryToParts(query, operators);
  if (queryParts.length === 0) return null;
  const parsedResults: ParsedResults = {};
  let activeOperator: string | null = null;

  queryParts.forEach((partSegment) => {
    const segments = partSegment
      .split(/(OR|NOT|MUST|SKIP)/)
      .map((segment) => segment.trim())
      .filter(Boolean);
    segments.forEach((segment) => {
      if (operators.includes(segment)) {
        activeOperator = segment.toLowerCase();
        if (!parsedResults[activeOperator]) {
          parsedResults[activeOperator] = [];
        }
      } else if (segment === 'SKIP') {
        activeOperator = null;
      } else {
        if (!activeOperator) {
          activeOperator = 'or';
          parsedResults[activeOperator] = [];
        }
        if (Array.isArray(searchField)) {
          const searchFieldResult: string[] = [];
          searchField.forEach((field) => {
            if (activeOperator) {
              searchFieldResult.push(`${field}:"${segment}"`);
            }
          });
          if (activeOperator === 'not') {
            parsedResults[activeOperator]?.push(
              `(${searchFieldResult.join(' AND NOT ')})`,
            );
          } else {
            parsedResults[activeOperator]?.push(
              `(${searchFieldResult.join(' OR ')})`,
            );
          }
        } else {
          parsedResults[activeOperator]?.push(segment);
        }
      }
    });
  });
  return parsedResults;
}

function formatQueryToParts(query: string, operators: string[]): string[] {
  const formattedQuery = query
    .split(/(".*?")/g)
    .map((part) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return `MUST ${part.slice(1, -1)}`;
      } else {
        return part
          .replace(/-\w+/g, (match) => 'NOT ' + match.slice(1))
          .replace(/EN/g, 'SKIP')
          .replace(/OF/g, 'OR');
      }
    })
    .join('')
    .trim();

  if (
    !operators.some((operator) =>
      new RegExp(`\\b${operator}\\b`, 'i').test(formattedQuery),
    )
  ) {
    return [];
  }
  return formattedQuery.split(/ (SKIP) /);
}

export function keywordSearch([query, searchField]: [
  string,
  string[]?,
]): ParsedResults | null {
  const queryParts = formatQueryToParts(query, ['OR', 'NOT', 'MUST']);
  const exactOrFuzzy = {
    exact: 'or',
    fuzzy: 'randomKey',
  };

  let searchValueAs = exactOrFuzzy['fuzzy'];

  if (query.startsWith('"')) {
    searchValueAs = exactOrFuzzy['exact'];
  }

  if (queryParts.length === 0 && searchField && searchField.length >= 1) {
    return {
      [searchValueAs]: searchField?.map((field) => `${field}:"${query}"`) || [],
    };
  }

  return getKeywordAdvancedSearch(query, searchField);
}

export default helper(keywordSearch);
