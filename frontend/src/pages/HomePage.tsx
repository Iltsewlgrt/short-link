import { useState } from "react";
import { FormEvent } from "react";
import { clearCreatedLink, createShortLink } from "../store/linksSlice";
import { useAppDispatch, useAppSelector } from "../store";

function HomePage() {
  const [url, setUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const dispatch = useAppDispatch();
  const { loading, error, createdLink } = useAppSelector((state) => state.links);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(createShortLink(url));
  };

  const onCopyStatsLink = async () => {
    if (!createdLink?.statsUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdLink.statsUrl);
      setCopyStatus("Link copied");
    } catch {
      setCopyStatus("Failed to copy link");
    }
  };

  const onCopyShareLink = async () => {
    if (!createdLink?.shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdLink.shareUrl);
      setCopyStatus("Share link copied");
    } catch {
      setCopyStatus("Failed to copy link");
    }
  };

  return (
    <section className="home-grid">
      <div className="panel hero-panel">
        <p className="eyebrow">Link Shortening Service</p>
        <h1>Turn long URLs into compact links and track every click</h1>
        <p className="lead">
          After creation, you will get two links: one for sharing and one for viewing analytics.
        </p>

        <form className="link-form" onSubmit={onSubmit}>
          <label htmlFor="url-input">Paste URL</label>
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              if (createdLink) {
                dispatch(clearCreatedLink());
              }
            }}
            placeholder="https://example.com/very/long/link"
          />
          <button disabled={loading} type="submit">
            {loading ? (
              <span className="button-loading-wrap">
                <span className="button-loader" aria-hidden="true" />
                Creating...
              </span>
            ) : (
              "Shorten"
            )}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </div>

      <div className="panel result-panel">
        <h2>Result</h2>
        {!createdLink ? (
          <p className="muted">Your links will appear here after shortening.</p>
        ) : (
          <div className="result-content">
            <div className="result-item">
              <span>Share link</span>
              <a href={createdLink.shareUrl} target="_blank" rel="noreferrer">
                {createdLink.shareUrl}
              </a>
            </div>
            <button onClick={onCopyShareLink} type="button">
              Copy share link
            </button>
            <div className="result-item">
              <span>Stats link</span>
              <a href={createdLink.statsUrl} target="_blank" rel="noreferrer">
                {createdLink.statsUrl}
              </a>
            </div>
            <button onClick={onCopyStatsLink} type="button">
              Copy stats link
            </button>
            {copyStatus ? <p className="muted">{copyStatus}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomePage;
