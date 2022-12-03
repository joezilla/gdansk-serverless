export const isEmptyString = (data: string | undefined): boolean => typeof data === "string" && data.trim().length == 0;
