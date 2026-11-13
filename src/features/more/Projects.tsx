import { FlowNode, Reveal } from '../../components/FlowNode';
import { Tags } from '../../components/Tags';
import Button from '@mui/material/Button';
import { Icon } from '../../components/Icon';
import { projects } from '../../data/profile';
import './more.css';

export function Projects() {
  return (
    <FlowNode
      id="projects"
      title={
        <>
          Built end to end, <em>on my own time</em>
        </>
      }
      sub="Products I designed and built on my own, from the data model to the last pixel."
    >
      <div className="loop-head mono">
        <span className="loop-kw">for</span> (const project <span className="loop-kw">of</span> projects) <span className="loop-dim">// {projects.length} iterations</span>
      </div>
      <div className="iters">
        {projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.05}>
            <article className="iter">
              <div className="iter-top mono">
                <span>iteration {i}</span>
                {p.live ? (
                  <span className="iter-live">
                    <i className="dot ok" /> live
                  </span>
                ) : (
                  <span className="iter-live oss">
                    <Icon name="github" size={11} /> open source
                  </span>
                )}
              </div>
              <div className="iter-main">
                <span className="iter-ico">
                  <Icon name={p.icon} size={20} />
                </span>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.blurb}</p>
                </div>
              </div>
              <Tags items={p.stack} />
              <div className="iter-foot">
                {p.live && (
                  <Button size="small" variant="contained" color="primary" href={p.live} target="_blank" rel="noopener noreferrer" endIcon={<Icon name="external" size={12} />}>
                    Open live site
                  </Button>
                )}
                {p.code && (
                  <Button size="small" href={p.code} target="_blank" rel="noopener noreferrer" startIcon={<Icon name="github" size={12} />}>
                    Source
                  </Button>
                )}
                {p.live && <span className="iter-url mono">{new URL(p.live).host}</span>}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </FlowNode>
  );
}
