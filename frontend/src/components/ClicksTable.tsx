import { formatDateTime } from "../utils/format";

function formatRegion(item) {
  const country = item.country || "Unknown";
  const region = item.region || "Unknown";
  const city = item.city || "Unknown";

  if (country === "Unknown" && region === "Unknown" && city === "Unknown") {
    return "Not specified";
  }

  return `${country}, ${region}, ${city}`;
}

function ClicksTable({ clicks }) {
  return (
    <section className="panel">
      <h3>Clicks</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>IP</th>
              <th>Region</th>
              <th>Browser</th>
              <th>OS</th>
            </tr>
          </thead>
          <tbody>
            {clicks.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted-cell">
                  No clicks yet
                </td>
              </tr>
            ) : (
              clicks.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.timestamp)}</td>
                  <td>{item.ip}</td>
                  <td>{formatRegion(item)}</td>
                  <td>{`${item.browserName} ${item.browserVersion}`}</td>
                  <td>{`${item.osName} ${item.osVersion}`}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ClicksTable;
