export function getRandomHexColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}
export function getCurrentZurichTime(): string {
  const now = new Date();

  // Get time in Europe/Zurich as parts
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Zurich",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || "00";

  const pad = (n: number, length = 2) => n.toString().padStart(length, "0");

  // Milliseconds remain same in local and other time zones
  const ms = pad(now.getMilliseconds(), 3);

  return `${getPart("hour")}:${getPart("minute")}:${getPart("second")}.${ms}`;
}
export function getAdjustedZurichTime(seconds: number = 0): string {
  const now = new Date();

  // Get current Zurich time as a local Date object
  const zurichNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Zurich" })
  );

  // Add seconds (can be negative too)
  zurichNow.setSeconds(zurichNow.getSeconds() + seconds);

  // Helper to pad numbers
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(zurichNow.getHours())}:${pad(zurichNow.getMinutes())}:${pad(zurichNow.getSeconds())}`;
}
export function getTimeDifference(time1: string, time2: string) {
  const toMilliseconds = (time: string) => {
    const [hms, msPart] = time.split(".");
    const [h, m, s] = hms.split(":").map(Number);

    const ms = msPart ? parseInt(msPart.padEnd(3, "0").slice(0, 3)) : 0;

    return ((h * 3600 + m * 60 + s) * 1000) + ms;
  };

  const diffInMilliseconds = toMilliseconds(time2) - toMilliseconds(time1);
  return diffInMilliseconds;
}
