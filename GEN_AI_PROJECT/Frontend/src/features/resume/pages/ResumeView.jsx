import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Navbar from '../../../components/Navbar';
import { getResumeById, deleteResume } from '../services/resume.api';
import { parseLink } from '../../../utils/links';
import '../style/resume.scss';

const Section = ({ title, children }) => (
  <section className="paper__section">
    <h2>{title}</h2>
    {children}
  </section>
);

const ResumeView = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResumeById(resumeId)
      .then((d) => setResume(d.resume))
      .catch((e) => setError(e?.response?.data?.message || 'Could not load this resume.'));
  }, [resumeId]);

  const onDelete = async () => {
    if (!window.confirm('Delete this resume permanently?')) return;
    await deleteResume(resumeId);
    navigate('/history');
  };

  if (error) return (<><Navbar /><p className="rm__error" style={{ margin: '2rem auto', maxWidth: 600 }}>{error}</p></>);
  if (!resume) return (<><Navbar /><p style={{ textAlign: 'center', marginTop: '3rem' }}>Loading resume…</p></>);

  const c = resume.content || {};
  const ct = c.contact || {};
  const contactItems = [
    ct.email && { key: 'email', label: ct.email, href: `mailto:${ct.email}` },
    ct.phone && { key: 'phone', label: ct.phone, href: `tel:${ct.phone.replace(/[^\d+]/g, '')}` },
    ct.location && { key: 'loc', label: ct.location },
    ...(ct.links || []).map((l, i) => {
      const p = parseLink(l);
      return p && { key: `l${i}`, ...p };
    }),
  ].filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="rv">
        <aside className="rv__side">
          <h3>{resume.title}</h3>
          <div className="rv__score">
            <strong>{resume.atsScore ?? '–'}</strong>
            <span>ATS score</span>
          </div>
          {resume.improvementTips?.length > 0 && (
            <>
              <h4>How to make it stronger</h4>
              <ul>{resume.improvementTips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </>
          )}
          <button className="rm__btn" onClick={() => window.print()}>⬇ Download as PDF</button>
          <small>In the print dialog choose “Save as PDF”.</small>
          <Link to="/resume" className="rv__link">+ Make another resume</Link>
          <button className="rv__danger" onClick={onDelete}>Delete resume</button>
        </aside>

        <article className="paper" id="resume-paper">
          <header className="paper__head">
            <h1>{c.fullName}</h1>
            {c.headline && <p className="paper__headline">{c.headline}</p>}
            {contactItems.length > 0 && (
              <p className="paper__contact">
                {contactItems.map((item, i) => (
                  <span key={item.key}>
                    {i > 0 && <span className="paper__sep"> • </span>}
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
                    ) : item.label}
                  </span>
                ))}
              </p>
            )}
          </header>

          {c.summary && <Section title="Summary"><p>{c.summary}</p></Section>}

          {c.skills?.length > 0 && (
            <Section title="Skills">
              {c.skills.map((s, i) => (
                <p key={i}><strong>{s.category}:</strong> {(s.items || []).join(', ')}</p>
              ))}
            </Section>
          )}

          {c.experience?.length > 0 && (
            <Section title="Experience">
              {c.experience.map((e, i) => (
                <div className="paper__entry" key={i}>
                  <div className="paper__row">
                    <strong>{e.role}{e.company ? ` — ${e.company}` : ''}</strong>
                    <span>{e.duration}</span>
                  </div>
                  {e.location && <em>{e.location}</em>}
                  <ul>{(e.bullets || []).map((b, j) => <li key={j}>{b}</li>)}</ul>
                </div>
              ))}
            </Section>
          )}

          {c.projects?.length > 0 && (
            <Section title="Projects">
              {c.projects.map((p, i) => (
                <div className="paper__entry" key={i}>
                  <div className="paper__row">
                    <strong>{p.name}</strong>
                    <span>{p.techStack}</span>
                  </div>
                  {p.link && (() => {
                    const pl = parseLink(p.link);
                    return pl?.href
                      ? <em><a href={pl.href} target="_blank" rel="noopener noreferrer">{p.link}</a></em>
                      : <em>{p.link}</em>;
                  })()}
                  <ul>{(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}</ul>
                </div>
              ))}
            </Section>
          )}

          {c.education?.length > 0 && (
            <Section title="Education">
              {c.education.map((e, i) => (
                <div className="paper__entry" key={i}>
                  <div className="paper__row">
                    <strong>{e.degree}{e.institution ? ` — ${e.institution}` : ''}</strong>
                    <span>{e.year}</span>
                  </div>
                  {e.details && <p>{e.details}</p>}
                </div>
              ))}
            </Section>
          )}

          {c.certifications?.length > 0 && (
            <Section title="Certifications"><ul>{c.certifications.map((x, i) => <li key={i}>{x}</li>)}</ul></Section>
          )}
          {c.achievements?.length > 0 && (
            <Section title="Achievements"><ul>{c.achievements.map((x, i) => <li key={i}>{x}</li>)}</ul></Section>
          )}
        </article>
      </main>
    </>
  );
};

export default ResumeView;
