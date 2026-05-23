import svgPaths from "./svg-fkeva4uqah";
import imgMbdBkndDark2 from "figma:asset/d347e35eeef9c4b77c4a69ee3fea9e166951b330.png";
import { imgMbdLogoWht } from "./svg-nits6";

function Group() {
  return (
    <div className="absolute inset-[0_0_24.7%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 30">
        <g id="Group">
          <path d={svgPaths.p3e9a0d00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p1478b100} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p473c600} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function MbdLogoWht() {
  return (
    <div className="[grid-area:1_/_1] h-[38.657px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.378px_-18.222px] mask-size-[82px_82px] ml-[6.38px] mt-[18.22px] overflow-clip relative w-[69.114px]" data-name="MBD-logo-wht" style={{ maskImage: `url('${imgMbdLogoWht}')` }}>
      <Group />
    </div>
  );
}

function MbdStudioLight() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="mbd-studio-light">
      <div className="[grid-area:1_/_1] h-[87.337px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[15.879px_3.905px] mask-size-[82px_82px] ml-[-15.88px] mt-[-3.9px] relative w-[102.565px]" data-name="mbd-bknd-dark 2" style={{ maskImage: `url('${imgMbdLogoWht}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgMbdBkndDark2} />
      </div>
      <MbdLogoWht />
      <p className="[grid-area:1_/_1] font-['Outfit:Medium',sans-serif] font-medium h-[22.648px] leading-[1.11] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.378px_-51.543px] mask-size-[82px_82px] ml-[40.93px] mt-[51.54px] relative text-[10.933px] text-center text-white translate-x-[-50%] w-[69.114px]" style={{ maskImage: `url('${imgMbdLogoWht}')` }}>
        STUDIO
      </p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[23.572px] left-[0.01px] text-[21.429px] text-white top-[-0.36px] w-[142px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        MBD Studio
      </p>
    </div>
  );
}

function Link() {
  return (
    <div className="h-[17.497px] relative shrink-0 w-[138.304px]" data-name="Link">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-0 text-[12.25px] text-[rgba(255,255,255,0.9)] top-[-1px] w-[139px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        @mbd-studio-design ↗
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7px] items-start justify-center relative w-full">
        <Container />
        <Link />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[82px] relative shrink-0 w-[319px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[13px] items-center justify-center relative size-full">
        <MbdStudioLight />
        <Frame />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20.995px] mb-[-2px] relative shrink-0 w-[86.043px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:ExtraBold',sans-serif] font-extrabold leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-[0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Subscribers:
        </p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20.995px] mb-[-2px] relative shrink-0 w-[21.816px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-[0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          219
        </p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center pb-[2px] pt-0 px-0 relative size-full">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[20.995px] mb-[-4px] relative shrink-0 w-[91.732px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:ExtraBold',sans-serif] font-extrabold leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-[0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Watch Hours:
        </p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[20.995px] mb-[-4px] relative shrink-0 w-[67.661px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-[0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          555 hours
        </p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center pb-[4px] pt-0 px-0 relative size-full">
        <Text2 />
        <Text3 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[20.995px] mb-[-1px] relative shrink-0 w-full" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:ExtraBold',sans-serif] font-extrabold leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-[0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Analytics (OAuth):
        </p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-0 size-[14px] top-[3.5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_649_111)" id="Icon">
          <path d={svgPaths.p1c52c100} id="Vector" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p13769680} id="Vector_2" stroke="var(--stroke-0, #05DF72)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
        </g>
        <defs>
          <clipPath id="clip0_649_111">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[20.995px] mb-[-1px] relative shrink-0 w-[94.429px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon />
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[21px] left-[19.25px] text-[14px] text-[rgba(255,255,255,0.9)] text-nowrap top-[0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Connected
        </p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[42px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center pb-px pt-0 px-0 relative size-full">
        <Text4 />
        <Text5 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] h-[144px] items-start relative shrink-0 w-[154px]" data-name="Container">
      <Container2 />
      <Container3 />
      <Container4 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[25.01px] size-[14px] top-[8.74px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p2b28500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p6036780} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p38bc3e00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p17840720} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#7c44ff] h-[32px] relative rounded-[2.2622e+07px] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[90.01px] text-[12.25px] text-center text-nowrap text-white top-[5.99px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
          YouTube Sync
        </p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[26.01px] size-[14px] top-[8.74px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_649_107)" id="Icon">
          <path d={svgPaths.p19f36a80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p3ba14380} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
        </g>
        <defs>
          <clipPath id="clip0_649_107">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#7c44ff] h-[31px] relative rounded-[2.2622e+07px] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon2 />
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[91.01px] text-[12.25px] text-center text-nowrap text-white top-[5.99px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Import Reach
        </p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[32.01px] size-[14px] top-[8.74px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d="M6.99998 8.74997V1.74999" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p1d77dac0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          <path d={svgPaths.p2d31cac0} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#7c44ff] h-[31px] relative rounded-[2.2622e+07px] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon3 />
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[91.01px] text-[12.25px] text-center text-nowrap text-white top-[5.99px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Export CSV
        </p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[10.492px] items-start relative self-stretch shrink-0 w-[156px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11px] items-start relative w-full">
        <Container5 />
        <Container6 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] h-[238px] items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Frame1 />
    </div>
  );
}

export default function Container8() {
  return (
    <div className="relative rounded-[5px] size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%), linear-gradient(90deg, rgb(89, 40, 203) 0%, rgb(89, 40, 203) 100%)" }}>
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-[20px] relative size-full">
          <Container7 />
        </div>
      </div>
    </div>
  );
}