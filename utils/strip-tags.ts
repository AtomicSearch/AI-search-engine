export const stripHtmlTags = (str: string) => str.replace(/<[^>]*>?/gm, "");
