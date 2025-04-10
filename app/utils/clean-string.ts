export const cleanString = (value?: string) => {
  // Replace all occurrences of whitespace, newlines, and commas at beginning and end
  return value?.replace(/^[\s\n\r,]+|[\s\n\r,]+$/g, '');
};
