import type { Project, ProjectVisual } from '../content/site';

const researchDataHubVisual = `
  <svg class="project-svg" viewBox="0 0 640 400" fill="none" focusable="false">
    <defs>
      <pattern id="rdh-dots" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.8" fill="#C7C8C1"/>
      </pattern>
      <marker id="rdh-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0L8 4L0 8" stroke="#202321" stroke-width="1"/>
      </marker>
    </defs>
    <rect width="640" height="400" fill="#F6F5F1"/>
    <rect x="30" y="30" width="580" height="340" fill="url(#rdh-dots)" opacity=".42"/>
    <path class="svg-rule" d="M48 70H592M48 330H592"/>
    <text class="svg-kicker" x="48" y="52">ACQUISITION / ROUTING / DELIVERY</text>
    <text class="svg-kicker" x="592" y="52" text-anchor="end">RDH—01</text>

    <g class="svg-node-group">
      <rect class="svg-box" x="68" y="103" width="108" height="36"/>
      <text class="svg-label" x="82" y="125">SOURCE A</text>
      <rect class="svg-box" x="68" y="181" width="108" height="36"/>
      <text class="svg-label" x="82" y="203">SOURCE B</text>
      <rect class="svg-box" x="68" y="259" width="108" height="36"/>
      <text class="svg-label" x="82" y="281">SOURCE C</text>
    </g>

    <g class="svg-routes">
      <path d="M176 121H224C238 121 238 199 252 199" marker-end="url(#rdh-arrow)"/>
      <path d="M176 199H252" marker-end="url(#rdh-arrow)"/>
      <path d="M176 277H224C238 277 238 199 252 199" marker-end="url(#rdh-arrow)"/>
      <path d="M340 199H386" marker-end="url(#rdh-arrow)"/>
      <path d="M446 199H496" marker-end="url(#rdh-arrow)"/>
    </g>

    <g class="svg-core">
      <rect class="svg-box svg-box--sage" x="252" y="168" width="88" height="62"/>
      <text class="svg-kicker" x="296" y="189" text-anchor="middle">ROUTER</text>
      <circle cx="296" cy="211" r="7" fill="#A7B59A"/>
    </g>

    <g class="svg-verify">
      <circle class="svg-box" cx="416" cy="199" r="30"/>
      <path d="M405 199L412 206L428 190" stroke="#202321" stroke-width="1.5"/>
      <text class="svg-kicker" x="416" y="251" text-anchor="middle">VERIFY</text>
    </g>

    <g>
      <rect class="svg-box" x="496" y="174" width="77" height="50"/>
      <path class="svg-flow-line" d="M510 191H559M510 200H548M510 209H555"/>
      <text class="svg-kicker" x="534" y="246" text-anchor="middle">DELIVER</text>
    </g>

    <text class="svg-footnote" x="68" y="362">RESUMABLE TASK STATE</text>
    <path class="svg-dimension" d="M68 344V350M68 347H221M221 344V350"/>
    <text class="svg-footnote" x="572" y="362" text-anchor="end">INTEGRITY / AUDIT TRAIL</text>
  </svg>
`;

const hydroWeaveVisual = `
  <svg class="project-svg" viewBox="0 0 640 400" fill="none" focusable="false">
    <defs>
      <pattern id="hw-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" stroke="#DEDED7" stroke-width=".7"/>
      </pattern>
      <clipPath id="hw-clip">
        <rect x="58" y="88" width="470" height="228"/>
      </clipPath>
    </defs>
    <rect width="640" height="400" fill="#F6F5F1"/>
    <text class="svg-kicker" x="48" y="48">TIBETAN PLATEAU / CLOUD-WATER SYSTEM</text>
    <text class="svg-kicker" x="592" y="48" text-anchor="end">FIELD MODEL</text>
    <rect x="58" y="88" width="470" height="228" fill="url(#hw-grid)"/>
    <g clip-path="url(#hw-clip)">
      <path class="svg-wave svg-wave--back" d="M48 254C91 254 101 180 147 185C198 190 218 263 267 257C315 251 326 163 377 171C427 179 451 259 538 237"/>
      <path class="svg-wave svg-wave--mid" d="M48 278C102 278 104 213 158 218C211 223 223 291 279 283C337 275 349 201 399 208C453 215 469 278 538 263"/>
      <path class="svg-wave svg-wave--front" d="M48 302C104 302 111 244 167 249C219 254 234 315 288 306C344 297 357 233 409 239C462 245 482 303 538 291"/>
    </g>
    <path class="svg-rule" d="M58 88V316H528V88"/>
    <g class="svg-annotations">
      <path d="M58 121H528"/>
      <path d="M58 178H528"/>
      <path d="M58 235H528"/>
      <path d="M58 292H528"/>
    </g>
    <text class="svg-label" x="70" y="111">PROXY</text>
    <text class="svg-label" x="70" y="168">BUDGET</text>
    <text class="svg-label" x="70" y="225">GCWR</text>
    <text class="svg-label" x="70" y="282">ERROR</text>

    <g transform="translate(548 92)">
      <text class="svg-kicker" x="0" y="0">MODEL</text>
      <path class="svg-rule" d="M0 13H44"/>
      <text class="svg-label" x="0" y="37">PW</text>
      <text class="svg-label" x="0" y="61">RH</text>
      <text class="svg-label" x="0" y="85">CFRAC</text>
      <path class="svg-dash" d="M0 101H44"/>
      <text class="svg-kicker" x="0" y="126">ERROR</text>
      <text class="svg-label" x="0" y="150">L1</text>
      <text class="svg-label" x="0" y="174">L2</text>
      <text class="svg-label" x="0" y="198">L3</text>
      <circle cx="38" cy="65" r="4" fill="#A7B59A"/>
    </g>
    <text class="svg-footnote" x="58" y="350">WATER-BUDGET / GCWR MODEL</text>
    <text class="svg-footnote" x="528" y="350" text-anchor="end">THREE-LAYER ERROR ANALYSIS</text>
  </svg>
`;

const hydroWeaveDbasVisual = `
  <svg class="project-svg" viewBox="0 0 640 400" fill="none" focusable="false">
    <defs>
      <pattern id="dbas-lines" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0V20" stroke="#DEDED7" stroke-width=".7"/>
      </pattern>
    </defs>
    <rect width="640" height="400" fill="#F6F5F1"/>
    <text class="svg-kicker" x="48" y="48">ERA5 / NETCDF / ZARR</text>
    <text class="svg-kicker" x="592" y="48" text-anchor="end">DATA ASSET SYSTEM</text>

    <g class="svg-stack">
      <path class="svg-layer" d="M116 120L266 77L439 125L289 170Z"/>
      <path class="svg-layer svg-layer--side" d="M116 120V147L289 198V170"/>
      <path class="svg-layer svg-layer--side" d="M439 125V152L289 198V170"/>
      <text class="svg-label" x="278" y="126" text-anchor="middle">CATALOG</text>

      <path class="svg-layer" d="M116 181L266 138L439 186L289 231Z"/>
      <path class="svg-layer svg-layer--side" d="M116 181V208L289 259V231"/>
      <path class="svg-layer svg-layer--side" d="M439 186V213L289 259V231"/>
      <text class="svg-label" x="278" y="187" text-anchor="middle">VERIFY / BACKUP</text>

      <path class="svg-layer" d="M116 242L266 199L439 247L289 292Z"/>
      <path class="svg-layer svg-layer--side" d="M116 242V269L289 320V292"/>
      <path class="svg-layer svg-layer--side" d="M439 247V274L289 320V292"/>
      <text class="svg-label" x="278" y="248" text-anchor="middle">QUERY LAYER</text>
    </g>

    <g transform="translate(484 102)">
      <rect x="0" y="0" width="76" height="76" fill="url(#dbas-lines)"/>
      <path class="svg-rule" d="M0 0H76V76H0Z"/>
      <circle class="svg-pulse" cx="38" cy="38" r="13"/>
      <path d="M31 38L36 43L46 32" stroke="#202321" stroke-width="1.3"/>
      <text class="svg-kicker" x="38" y="101" text-anchor="middle">CHECKSUM</text>
    </g>

    <g class="svg-queue">
      <path class="svg-dash" d="M484 236H560"/>
      <circle class="svg-dot" cx="492" cy="236" r="3.5"/>
      <circle class="svg-dot" cx="514" cy="236" r="3.5"/>
      <circle class="svg-dot" cx="536" cy="236" r="3.5"/>
      <circle class="svg-dot" cx="558" cy="236" r="3.5"/>
      <text class="svg-kicker" x="522" y="271" text-anchor="middle">TASK QUEUE</text>
    </g>

    <text class="svg-footnote" x="48" y="358">CATALOG → VERIFY → PRESERVE → QUERY</text>
    <text class="svg-footnote" x="592" y="358" text-anchor="end">RESUMABLE PIPELINE</text>
  </svg>
`;

const mcmtoolsVisual = `
  <svg class="project-svg" viewBox="0 0 640 400" fill="none" focusable="false">
    <defs>
      <pattern id="mcm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" stroke="#DEDED7" stroke-width=".7"/>
      </pattern>
      <clipPath id="mcm-clip">
        <rect x="58" y="82" width="350" height="238"/>
      </clipPath>
    </defs>
    <rect width="640" height="400" fill="#F6F5F1"/>
    <text class="svg-kicker" x="48" y="48">REGRESSION / STATISTICS / FIGURES</text>
    <text class="svg-kicker" x="592" y="48" text-anchor="end">PYTHON TOOLCHAIN</text>
    <rect x="58" y="82" width="350" height="238" fill="url(#mcm-grid)"/>
    <g clip-path="url(#mcm-clip)">
      <path class="svg-regression" d="M78 286L390 118"/>
      <g class="svg-points">
        <circle cx="94" cy="274" r="4"/><circle cx="119" cy="249" r="4"/><circle cx="142" cy="259" r="4"/>
        <circle cx="169" cy="236" r="4"/><circle cx="196" cy="224" r="4"/><circle cx="219" cy="211" r="4"/>
        <circle cx="247" cy="201" r="4"/><circle cx="273" cy="192" r="4"/><circle cx="301" cy="174" r="4"/>
        <circle cx="329" cy="161" r="4"/><circle cx="359" cy="139" r="4"/>
        <circle cx="111" cy="226" r="4"/><circle cx="157" cy="214" r="4"/><circle cx="226" cy="180" r="4"/>
        <circle cx="285" cy="163" r="4"/><circle cx="337" cy="196" r="4"/><circle cx="368" cy="152" r="4"/>
      </g>
    </g>
    <path class="svg-rule" d="M58 82V320H408V82"/>
    <text class="svg-label" x="72" y="307">OBSERVATION</text>
    <text class="svg-label" x="394" y="101" text-anchor="end">FIT</text>

    <g transform="translate(446 84)">
      <text class="svg-kicker" x="0" y="0">OUTPUT</text>
      <path class="svg-rule" d="M0 13H146"/>
      <text class="svg-label" x="0" y="42">REGRESSION</text>
      <path class="svg-dash" d="M0 57H146"/>
      <text class="svg-label" x="0" y="82">STATISTICS</text>
      <path class="svg-dash" d="M0 97H146"/>
      <text class="svg-label" x="0" y="122">TABLES</text>
      <path class="svg-dash" d="M0 137H146"/>
      <text class="svg-label" x="0" y="162">FIGURES</text>

      <g transform="translate(0 203)">
        <text class="svg-kicker" x="0" y="0">ROADMAP</text>
        <path class="svg-rule" d="M0 25H146"/>
        <circle cx="7" cy="25" r="4" fill="#202321"/>
        <circle cx="61" cy="25" r="4" fill="#A7B59A"/>
        <circle cx="115" cy="25" r="4" fill="#F6F5F1" stroke="#878A82"/>
        <path d="M61 25H115" stroke="#878A82" stroke-dasharray="3 4"/>
        <text class="svg-micro" x="0" y="45">CURRENT</text>
        <text class="svg-micro" x="146" y="45" text-anchor="end">PLANNED</text>
      </g>
    </g>
    <text class="svg-footnote" x="58" y="358">SCOPE STAYS EXPLICIT</text>
    <text class="svg-footnote" x="592" y="358" text-anchor="end">MODULES / NOT MONOLITH</text>
  </svg>
`;

const visualMarkup: Record<ProjectVisual, string> = {
  'research-data-hub': researchDataHubVisual,
  'hydro-weave': hydroWeaveVisual,
  'hydro-weave-dbas': hydroWeaveDbasVisual,
  mcmtools: mcmtoolsVisual,
};

export function renderProjectVisual(project: Project): string {
  return `
    <figure class="project-figure" aria-hidden="true">
      ${visualMarkup[project.visual]}
    </figure>
  `;
}
