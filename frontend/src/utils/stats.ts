function aggregate(clicks, keySelector) {
  const map = new Map();

  clicks.forEach((item) => {
    const key = keySelector(item) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);
}

export function aggregateByBrowser(clicks) {
  return aggregate(clicks, (item) => item.browserName);
}

export function aggregateByRegion(clicks) {
  return aggregate(clicks, (item) => {
    const country = item.country || "Unknown";
    const region = item.region || "Unknown";

    if (country === "Unknown" && region === "Unknown") {
      return "Not specified";
    }

    return `${country}, ${region}`;
  });
}
