import svgPaths from "./svg-v5maxaw2di";
import imgNav from "figma:asset/7012de65c475324130ed21a4b4aacf14e5a41228.png";

function TubeLabLogo() {
  return (
    <div className="h-[38px] relative shrink-0 w-[199px]" data-name="TubeLabLogo">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 199 38">
        <g id="TubeLabLogo">
          <path d={svgPaths.p12cb32c0} fill="var(--fill-0, #6C52FF)" id="Vector" />
          <g id="Vector_2">
            <path d={svgPaths.p1ee61400} fill="var(--fill-0, #E5E5E5)" />
            <path d={svgPaths.p2d002e00} fill="var(--fill-0, #E5E5E5)" />
            <path d={svgPaths.p108dac80} fill="var(--fill-0, #E5E5E5)" />
            <path d={svgPaths.p36baa700} fill="var(--fill-0, #E5E5E5)" />
            <path d={svgPaths.p1ab35d00} fill="var(--fill-0, #E5E5E5)" />
            <path d={svgPaths.p3b1cb600} fill="var(--fill-0, #E5E5E5)" />
            <path d={svgPaths.pdc45d00} fill="var(--fill-0, #E5E5E5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Nav() {
  return (
    <div className="flex-[1_0_0] h-[68px] min-h-px min-w-px relative rounded-[12px]" data-name="Nav">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgNav} />
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between p-[15px] relative size-full m-[0px]">
          <TubeLabLogo />
          <p className="font-['DM_Sans',sans-serif] font-normal leading-[48px] relative shrink-0 text-[#e3e3e5] text-[33px] text-center tracking-[0.5px] whitespace-nowrap">
            Smarter Insights for Creators — Now in Beta
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TubeLabAd() {
  return (
    <div className="bg-white content-stretch flex items-start overflow-clip relative rounded-[1px] size-full" data-name="TubeLab Ad">
      <Nav />
    </div>
  );
}