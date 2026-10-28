import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  getAllInterviewReports, getAllResumes, deleteInterviewReport, deleteResume,
} from '../../resume/services/resume.api';
import '../style/history.scss';

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day > 1 ? 's' : ''} ago`;
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const fullDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const DocIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" />
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
  </svg>
);

const ScoreRing = ({ value, label }) => (
  <div className="ring" style={{ '--p': Math.max(0, Math.min(100, value)) }} title={label}>
    <div className="ring__inner">
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  </div>
);

/**
 * Every previous record (interview plans + resumes) of the logged in user.
 *  - limit:     show only the newest N (home page)
 *  - controls:  show filter tabs + search (history page)
 */
const HistoryList = ({ limit, controls = false }) => {
  const [reports, setReports] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllInterviewReports(), getAllResumes()])
      .then(([r, c]) => {
        if (cancelled) return;
        setReports(r.interviewReports || []);
        setResumes(c.resumes || []);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load your previous records.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}" permanently?`)) return;
    try {
      if (item.kind === 'report') {
        await deleteInterviewReport(item._id);
        setReports((p) => p.filter((x) => x._id !== item._id));
      } else {
        await deleteResume(item._id);
        setResumes((p) => p.filter((x) => x._id !== item._id));
      }
    } catch {
      setError('Could not delete that record. Please try again.');
    }
  };

  const all = useMemo(() => {
    const merged = [
      ...reports.map((r) => ({ ...r, kind: 'report', title: r.title || 'Interview plan' })),
      ...resumes.map((r) => ({ ...r, kind: 'resume' })),
    ];
    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, resumes]);

  const visible = useMemo(() => {
    let list = all;
    if (filter !== 'all') list = list.filter((i) => i.kind === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((i) => i.title.toLowerCase().includes(q));
    return limit ? list.slice(0, limit) : list;
  }, [all, filter, query, limit]);

  if (loading) {
    return (
      <div className="hx__grid" aria-busy="true">
        {[0, 1, 2].map((i) => <div className="hx__skeleton" key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="hx__notice hx__notice--error">
        {error} <button type="button" onClick={retry}>Try again</button>
      </div>
    );
  }

  if (all.length === 0) {
    return (
      <div className="hx__empty">
        <div className="hx__empty-art" aria-hidden="true">✦</div>
        <h3>Nothing here yet</h3>
        <p>Your interview plans and resumes will show up here as soon as you create them.</p>
        <div className="hx__empty-actions">
          <Link to="/" className="hx__btn hx__btn--primary">Create interview plan</Link>
          <Link to="/resume" className="hx__btn">Build a resume</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All', count: all.length },
    { id: 'report', label: 'Interview Plans', count: reports.length },
    { id: 'resume', label: 'Resumes', count: resumes.length },
  ];

  return (
    <div className="hx">
      {controls && (
        <div className="hx__controls">
          <div className="hx__tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                className={filter === t.id ? 'is-active' : ''}
                onClick={() => setFilter(t.id)}
              >
                {t.label} <span>{t.count}</span>
              </button>
            ))}
          </div>
          <input
            className="hx__search"
            type="search"
            placeholder="Search by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="hx__notice">No records match your search.</p>
      ) : (
        <div className="hx__grid">
          {visible.map((item) => {
            const isReport = item.kind === 'report';
            const score = isReport ? item.matchScore : item.atsScore;
            return (
              <article className={`hx__card hx__card--${item.kind}`} key={`${item.kind}-${item._id}`}>
                <Link
                  to={isReport ? `/interview/${item._id}` : `/resume/${item._id}`}
                  className="hx__link"
                  aria-label={`Open ${item.title}`}
                />
                <div className="hx__top">
                  <span className="hx__icon">{isReport ? <TargetIcon /> : <DocIcon />}</span>
                  <span className="hx__kind">{isReport ? 'Interview Plan' : 'Resume'}</span>
                  <button
                    type="button"
                    className="hx__delete"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => remove(item)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                </div>

                <div className="hx__body">
                  <h3>{item.title}</h3>
                  <p title={fullDate(item.createdAt)}>{timeAgo(item.createdAt)}</p>
                </div>

                <div className="hx__foot">
                  {typeof score === 'number' ? (
                    <ScoreRing value={score} label={isReport ? 'match' : 'ATS'} />
                  ) : <span />}
                  <span className="hx__open">Open <i>→</i></span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
