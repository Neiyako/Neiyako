export function renderFlowBand(): string {
  return `
    <aside class="flow-band" aria-labelledby="flow-title">
      <div class="flow-band__copy">
        <p class="eyebrow eyebrow--light">DATA-FLOW INTERLUDE</p>
        <h2 id="flow-title">Move data with a reason.</h2>
        <p>
          Scientific data moves through trust boundaries. Acquisition, verification, preservation,
          and query are treated as connected steps—not isolated scripts. ResearchDataHub and
          HydroWeave-DBAS make that movement explicit.
        </p>
        <ol class="flow-steps" aria-label="Scientific data movement stages">
          <li><span>01</span> Acquire</li>
          <li><span>02</span> Verify</li>
          <li><span>03</span> Preserve</li>
          <li><span>04</span> Query</li>
        </ol>
      </div>

      <div class="scene-frame scene-frame--flow" data-scene-frame="flow">
        <div class="scene-fallback flow-fallback" aria-hidden="true">
          <span class="flow-fallback__rail flow-fallback__rail--one"></span>
          <span class="flow-fallback__rail flow-fallback__rail--two"></span>
          <span class="flow-fallback__rail flow-fallback__rail--three"></span>
          <span class="flow-fallback__rail flow-fallback__rail--four"></span>
          <span class="flow-fallback__node flow-fallback__node--one"></span>
          <span class="flow-fallback__node flow-fallback__node--two"></span>
          <span class="flow-fallback__node flow-fallback__node--three"></span>
          <span class="flow-fallback__node flow-fallback__node--four"></span>
          <span class="flow-fallback__node flow-fallback__node--five"></span>
          <span class="flow-fallback__node flow-fallback__node--six"></span>
          <span class="flow-fallback__label flow-fallback__label--source">SOURCE</span>
          <span class="flow-fallback__label flow-fallback__label--field">FLOW FIELD</span>
          <span class="flow-fallback__label flow-fallback__label--output">OUTPUT</span>
        </div>
        <canvas class="scene-canvas" data-scene="flow" aria-hidden="true"></canvas>
      </div>
    </aside>
  `;
}
