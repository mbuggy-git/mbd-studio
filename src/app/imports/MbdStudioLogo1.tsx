import svgPaths from "./svg-shhqavu2ab";

function Group() {
  return (
    <div
      className="absolute bottom-[24.655%] left-[-0.009%] right-[0.005%] top-[0.011%]"
      data-name="Group"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 1037 437"
      >
        <g id="Group">
          <path
            d={svgPaths.p23463000}
            fill="var(--fill-0, white)"
            id="Vector"
          />
          <path
            d={svgPaths.pf483f70}
            fill="var(--fill-0, white)"
            id="Vector_2"
          />
          <path
            d={svgPaths.p4d78780}
            fill="var(--fill-0, white)"
            id="Vector_3"
          />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div
      className="absolute bottom-[-0.061%] left-[29.627%] right-[29.57%] top-[80.041%]"
      data-name="Group"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 423 116"
      >
        <g id="Group">
          <path
            d={svgPaths.p35e60c00}
            fill="var(--fill-0, white)"
            id="Vector"
          />
          <path
            d={svgPaths.p1e5b8e80}
            fill="var(--fill-0, white)"
            id="Vector_2"
          />
          <path
            d={svgPaths.p2a5398f0}
            fill="var(--fill-0, white)"
            id="Vector_3"
          />
          <path
            d={svgPaths.p2ed88b72}
            fill="var(--fill-0, white)"
            id="Vector_4"
          />
          <path
            d={svgPaths.p338e8500}
            fill="var(--fill-0, white)"
            id="Vector_5"
          />
          <path
            d={svgPaths.p1e9b7600}
            fill="var(--fill-0, white)"
            id="Vector_6"
          />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div
      className="absolute bottom-[-0.061%] contents left-[-0.009%] right-[0.005%] top-[0.011%]"
      data-name="Group"
    >
      <Group />
      <Group1 />
    </div>
  );
}

function Layer12() {
  return (
    <div
      className="absolute bottom-[-0.061%] contents left-[-0.009%] right-[0.005%] top-[0.011%]"
      data-name="Layer_1-2"
    >
      <Group2 />
    </div>
  );
}

export default function MbdStudioLogo1() {
  return (
    <div className="relative size-full" data-name="MBD-Studio-Logo 1">
      <Layer12 />
    </div>
  );
}