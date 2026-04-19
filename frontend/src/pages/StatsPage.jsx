import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadStats } from "../store/statsSlice";
import ClicksTable from "../components/ClicksTable";
import BarChart from "../components/BarChart";
import { aggregateByBrowser, aggregateByRegion } from "../utils/stats";

function StatsPage() {
  const { shortCode } = useParams();
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state) => state.stats);

  useEffect(() => {
    if (shortCode) {
      dispatch(loadStats(shortCode));
    }
  }, [dispatch, shortCode]);

  const browserData = useMemo(() => {
    const clicks = data?.clicks || [];
    return aggregateByBrowser(clicks);
  }, [data]);

  const regionData = useMemo(() => {
    const clicks = data?.clicks || [];
    return aggregateByRegion(clicks);
  }, [data]);

  return (
    <section className="stats-layout">
      <div className="stats-header panel">
        <p className="eyebrow">Click Analytics</p>
        <h1 className="stats-title">Short Link Insights</h1>
      </div>

      {loading ? (
        <section className="panel loading-panel" aria-live="polite">
          <div className="loading-orb" />
          <div className="loading-lines">
            <span />
            <span />
            <span />
          </div>
          <p className="loading-text">Collecting click analytics...</p>
        </section>
      ) : null}
      {error ? <p className="panel error-text">{error}</p> : null}

      {data ? (
        <>
          <section className="panel kpi-grid">
            <div>
              <span className="kpi-label">Original URL</span>
              <a href={data.link.originalUrl} target="_blank" rel="noreferrer">
                {data.link.originalUrl}
              </a>
            </div>
            <div>
              <span className="kpi-label">Short link</span>
              <a href={data.link.shareUrl} target="_blank" rel="noreferrer">
                {data.link.shareUrl}
              </a>
            </div>
            <div>
              <span className="kpi-label">Total clicks</span>
              <strong className="kpi-value">{data.totalClicks}</strong>
            </div>
          </section>

          <div className="charts-grid">
            <BarChart title="Top browsers" data={browserData} valueKey="count" />
            <BarChart title="Top regions" data={regionData} valueKey="count" />
          </div>

          <ClicksTable clicks={data.clicks} />
        </>
      ) : null}
    </section>
  );
}

export default StatsPage;
