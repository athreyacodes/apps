export function weatherLabel(code: number): string {
  if (code === 0) {
    return 'Clear';
  }
  if (code <= 3) {
    return 'Cloudy';
  }
  if (code <= 48) {
    return 'Fog';
  }
  if (code <= 57) {
    return 'Drizzle';
  }
  if (code <= 67) {
    return 'Rain';
  }
  if (code <= 77) {
    return 'Snow';
  }
  if (code <= 82) {
    return 'Showers';
  }
  if (code <= 86) {
    return 'Snow showers';
  }
  return 'Thunderstorm';
}

export function formatTempC(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatWindKmh(value: number): string {
  return `${Math.round(value)} km/h`;
}
