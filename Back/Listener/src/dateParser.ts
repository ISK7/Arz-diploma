export function parseDate(dateStr: string): Date {
  if(dateStr == undefined || dateStr.trim() == "") throw new Error("Invalid date string");
  const [year, month, day] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day, 0, 0, 0);
}

export function yesterdayDate(): Date {
    const now = new Date();
    const yesterday = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 1,
        0, 0, 0
    );
    return yesterday;
}