const TEHRAN_TIME_ZONE = "Asia/Tehran";

const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const tehranPartsFormatter = new Intl.DateTimeFormat(
  "en-CA-u-ca-gregory-nu-latn",
  {
    timeZone: TEHRAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  },
);

function tehranParts(value: Date) {
  const parts = Object.fromEntries(
    tehranPartsFormatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localValue(parts: ReturnType<typeof tehranParts>) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function offsetAt(instant: number) {
  const parts = tehranParts(new Date(instant));
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  ) - instant;
}

export function quotationIsoToTehranLocal(value: string) {
  const instant = new Date(value);
  return Number.isNaN(instant.getTime()) ? "" : localValue(tehranParts(instant));
}

export function quotationTehranLocalToIso(value: string) {
  const match = localDateTimePattern.exec(value);
  if (!match) throw new Error("QUOTATION_INVALID_VALID_UNTIL");
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  const validation = new Date(wallClock);
  if (
    validation.getUTCFullYear() !== year ||
    validation.getUTCMonth() !== month - 1 ||
    validation.getUTCDate() !== day ||
    validation.getUTCHours() !== hour ||
    validation.getUTCMinutes() !== minute
  ) {
    throw new Error("QUOTATION_INVALID_VALID_UNTIL");
  }

  let instant = wallClock - offsetAt(wallClock);
  instant = wallClock - offsetAt(instant);
  const result = new Date(instant);
  if (localValue(tehranParts(result)) !== value) {
    throw new Error("QUOTATION_INVALID_VALID_UNTIL");
  }
  return result.toISOString();
}

export function formatQuotationDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeZone: TEHRAN_TIME_ZONE,
  }).format(new Date(value));
}
