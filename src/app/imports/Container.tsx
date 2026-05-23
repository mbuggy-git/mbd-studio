import svgPaths from "./svg-7ij5hu2j7k";

function Icon() {
  return (
    <div className="relative shrink-0 size-[17.5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p3924400} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
          <path d={svgPaths.p28e8c000} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[17.5px] relative shrink-0 w-[189.25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-0 text-[#008236] text-[12.25px] text-nowrap top-[-0.5px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Connected to YouTube Analytics
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[#f0fdf4] h-[31px] relative rounded-[6.75px] shrink-0 w-[242px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b9f8cf] border-solid inset-0 pointer-events-none rounded-[6.75px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7px] items-center pl-[11.5px] pr-px py-px relative size-full">
        <Icon />
        <Text />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[31px] relative rounded-[6.75px] shrink-0 w-[153px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[6.75px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[15px] py-[8px] relative size-full">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] relative shrink-0 text-[#0a0a0a] text-[12.25px] text-center text-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
          Disconnect Analytics
        </p>
      </div>
    </div>
  );
}

export default function Container1() {
  return (
    <div className="content-stretch flex gap-[10.5px] items-center relative size-full" data-name="Container">
      <Container />
      <Button />
    </div>
  );
}