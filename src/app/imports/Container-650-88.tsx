import svgPaths from "./svg-1hx4vl74i4";
import imgMbdBkndDark2 from "figma:asset/d347e35eeef9c4b77c4a69ee3fea9e166951b330.png";
import { imgMbdLogoWht } from "./svg-5tqi8";

function Group() {
  return (
    <div className="absolute inset-[0_0_24.7%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71 30">
        <g id="Group">
          <path d={svgPaths.pf8e0800} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p204bbc00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p9fd9c00} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function MbdLogoWht() {
  return (
    <div className="absolute inset-[22.22%_7.94%_30.63%_7.78%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.533px_-18.667px] mask-size-[84px_84px] overflow-clip" data-name="MBD-logo-wht" style={{ maskImage: `url('${imgMbdLogoWht}')` }}>
      <Group />
    </div>
  );
}

function MbdStudioLight() {
  return (
    <div className="overflow-clip relative shrink-0 size-[84px]" data-name="mbd-studio-light">
      <div className="absolute h-[89.467px] left-[-16.27px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[16.267px_4px] mask-size-[84px_84px] top-[-4px] w-[105.067px]" data-name="mbd-bknd-dark 2" style={{ maskImage: `url('${imgMbdLogoWht}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgMbdBkndDark2} />
      </div>
      <MbdLogoWht />
      <p className="absolute font-['Outfit:Medium',sans-serif] font-medium h-[23.2px] leading-[1.11] left-[41.93px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.533px_-52.8px] mask-size-[84px_84px] text-[11.2px] text-center text-white top-[52.8px] translate-x-[-50%] w-[70.8px]" style={{ maskImage: `url('${imgMbdLogoWht}')` }}>
        STUDIO
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center px-0 py-px relative shrink-0">
      <div className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-[0px] text-white w-[161px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[36px] mb-0 text-[28px]">MBD Studio</p>
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[22px] text-[13px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          @mbd-studio-design↗
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center justify-end relative">
        <MbdStudioLight />
        <div className="flex flex-row items-center self-stretch">
          <Frame />
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[21px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:ExtraBold',sans-serif] font-extrabold leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
          Watch Hours:
        </p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[21px] relative shrink-0 w-[68.875px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
          460 hours
        </p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0 w-[167.367px]" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="basis-0 grow h-[21px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:ExtraBold',sans-serif] font-extrabold leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
          Subscribers:
        </p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[21px] relative shrink-0 w-[22.141px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
          191
        </p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0 w-[114.969px]" data-name="Container">
      <Text2 />
      <Text3 />
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[21px] relative shrink-0 w-[147px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:ExtraBold',sans-serif] font-extrabold leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
          YouTube Connection:
        </p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-0 size-[14px] top-[3.5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_645_223)" id="Icon">
          <path d={svgPaths.pc012c00} id="Vector" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p24f94f00} id="Vector_2" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_645_223">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[21px] relative shrink-0 w-[93px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon />
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[21px] left-[19.25px] text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
          Connected
        </p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0" data-name="Container">
      <Text4 />
      <Text5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-start relative">
        <Container1 />
        <Container2 />
        <Container3 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[10.5px] size-[14px] top-[8.75px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p3fb08a80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M12.25 1.75V4.66667H9.33333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p32253d00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M4.66667 9.33333H1.75V12.25" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#7c44ff] h-[31.5px] relative rounded-[1.67772e+07px] shrink-0 w-[131.891px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[79.5px] text-[12.25px] text-center text-nowrap text-white top-[7px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
          YouTube Sync
        </p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[10.5px] size-[14px] top-[8.75px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p3471a100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1977ee80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#7c44ff] h-[31.5px] relative rounded-[1.67772e+07px] shrink-0 w-[127.281px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon2 />
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[77.5px] text-[12.25px] text-center text-nowrap text-white top-[7px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Import Reach
        </p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[10.5px] size-[14px] top-[8.75px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d="M7 8.75V1.75" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p34aacb00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p27169580} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#7c44ff] h-[31.5px] relative rounded-[1.67772e+07px] shrink-0 w-[116.445px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon3 />
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[72.5px] text-[12.25px] text-center text-nowrap text-white top-[7px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Export CSV
        </p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[31.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10.5px] items-start justify-center pl-0 pr-[0.008px] py-0 relative size-full">
          <Button />
          <Button1 />
          <Button2 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[20px] items-start relative">
        <Frame1 />
        <Container4 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] h-[172px] items-center relative shrink-0 w-full" data-name="Container">
      <Container />
      <Container5 />
    </div>
  );
}

export default function Container7() {
  return (
    <div className="relative rounded-[5px] size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(178.735deg, rgba(0, 0, 0, 0) 3.857%, rgba(0, 0, 0, 0.4) 95.094%), linear-gradient(90deg, rgb(89, 40, 203) 0%, rgb(89, 40, 203) 100%)" }}>
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[28px] relative size-full">
          <Container6 />
        </div>
      </div>
    </div>
  );
}