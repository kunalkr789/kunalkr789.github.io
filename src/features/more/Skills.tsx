import { FlowNode, Reveal } from '../../components/FlowNode';
import { Tags } from '../../components/Tags';
import { skillGroups } from '../../data/profile';

const envName = (title: string) => title.toUpperCase().replace(/[^A-Z]+/g, '_').replace(/_$/, '');

export function Skills() {
  return (
    <FlowNode
      id="skills"
      title={
        <>
          Deep on the frontend, <em>fluent across the stack</em>
        </>
      }
      sub="These are the variables every later step in this flow can read."
    >
      <Reveal>
        <div className="vars">
          <div className="vars-head mono">
            <span>Name</span>
            <span>Value</span>
          </div>
          {skillGroups.map((g) => (
            <div key={g.title} className="var">
              <code className="var-name mono">
                <span className="var-dollar">$</span>
                {envName(g.title)}
              </code>
              <Tags items={g.items} />
            </div>
          ))}
        </div>
      </Reveal>
    </FlowNode>
  );
}
