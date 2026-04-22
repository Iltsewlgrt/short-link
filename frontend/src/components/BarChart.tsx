function BarChart({ title, data, valueKey }) {
  const maxValue = Math.max(...data.map((item) => item[valueKey]), 1);

  return (
    <section className="panel chart-panel">
      <h3>{title}</h3>
      <div className="chart-list">
        {data.length === 0 ? <p className="muted">No data</p> : null}
        {data.map((item) => {
          const percentage = Math.round((item[valueKey] / maxValue) * 100);
          return (
            <div className="chart-row" key={item.label}>
              <div className="chart-label">
                <span>{item.label}</span>
                <strong>{item[valueKey]}</strong>
              </div>
              <div className="chart-track">
                <div className="chart-bar" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BarChart;
