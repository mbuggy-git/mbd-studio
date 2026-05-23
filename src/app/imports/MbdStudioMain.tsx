import svgPaths from "./svg-fftza7262k";

function Group() {
  return (
    <div className="absolute contents inset-[28.02%_1.13%_5.61%_17.28%]" data-name="Group">
      <div className="absolute inset-[30.94%_73.18%_6.73%_17.28%]" data-name="Vector_2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 44">
          <path d={svgPaths.p227a6300} fill="var(--fill-0, white)" id="Vector_2" />
        </svg>
      </div>
      <div className="absolute inset-[44.04%_62.11%_5.87%_27.93%]" data-name="Vector_3">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 36">
          <path d={svgPaths.p30171700} fill="var(--fill-0, white)" id="Vector_3" />
        </svg>
      </div>
      <div className="absolute inset-[28.02%_48.68%_5.61%_40.47%]" data-name="Vector_4">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 47">
          <path d={svgPaths.p4ea3480} fill="var(--fill-0, white)" id="Vector_4" />
        </svg>
      </div>
      <div className="absolute inset-[43.09%_36.27%_5.79%_53.05%]" data-name="Vector_5">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 36">
          <path d={svgPaths.p2027bb00} fill="var(--fill-0, white)" id="Vector_5" />
        </svg>
      </div>
      <div className="absolute inset-[30.95%_26.04%_6.73%_66.02%]" data-name="Vector_6">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 44">
          <path d={svgPaths.p2c5ce000} fill="var(--fill-0, white)" id="Vector_6" />
        </svg>
      </div>
      <div className="absolute inset-[43.09%_14.55%_5.62%_74.59%]" data-name="Vector_7">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 37">
          <path d={svgPaths.p1abd5c00} fill="var(--fill-0, white)" id="Vector_7" />
        </svg>
      </div>
      <div className="absolute inset-[28.02%_1.13%_5.61%_88.02%]" data-name="Vector_8">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 47">
          <path d={svgPaths.p3fd89d00} fill="var(--fill-0, white)" id="Vector_8" />
        </svg>
      </div>
    </div>
  );
}

function TubeLabLogo() {
  return (
    <div className="absolute contents inset-[9.23%_1.13%_5.61%_2.67%]" data-name="TubeLab-Logo">
      <div className="absolute inset-[9.23%_81.39%_6.75%_2.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 60">
          <path d={svgPaths.p1dc85c00} fill="var(--fill-0, #D60303)" id="Vector" />
        </svg>
      </div>
      <Group />
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[70.336px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <TubeLabLogo />
    </div>
  );
}

function TubeLabLogo1() {
  return (
    <div className="h-[70.336px] relative shrink-0 w-[309.664px]" data-name="TubeLabLogo">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col h-[70.336px] items-start relative w-[309.664px]">
        <Icon />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[31.5px] relative rounded-[6.75px] shrink-0 w-[60.711px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[6.75px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[31.5px] items-center justify-center px-[15px] py-[8px] relative w-[60.711px]">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] relative shrink-0 text-[12.25px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Login
        </p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="basis-0 bg-white grow h-[31.5px] min-h-px min-w-px relative rounded-[6.75px] shrink-0" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[31.5px] items-center justify-center px-[14px] py-[7px] relative w-full">
          <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] relative shrink-0 text-[#5928cb] text-[12.25px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
            Start Free Trial
          </p>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[31.5px] relative shrink-0 w-[183.828px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10.5px] h-[31.5px] items-start relative w-[183.828px]">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex h-[73.5px] items-center justify-between left-[116px] px-[14px] py-0 top-[45px] w-[896px]" data-name="Header">
      <TubeLabLogo1 />
      <Container />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[42px] left-[14px] top-[70px] w-[868px]" data-name="Heading 1">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[42px] left-[434.05px] text-[42px] text-center text-nowrap text-white top-[0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Smarter YouTube Insights
      </p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[24.5px] left-[154px] top-[133px] w-[588px]" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-[293.97px] text-[17.5px] text-[rgba(255,255,255,0.9)] text-center text-nowrap top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Turn your YouTube analytics into action.
      </p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white h-[42px] left-[319.66px] rounded-[6.75px] top-[185.5px] w-[256.664px]" data-name="Button">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-[128.5px] text-[#5928cb] text-[15.75px] text-center text-nowrap top-[8.75px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Get Started Free - 30 Days
      </p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[17.5px] left-[14px] top-[241.5px] w-[868px]" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[17.5px] left-[434.49px] text-[12.25px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        No credit card required • Full access while testing the beta for 30 days
      </p>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute h-[329px] left-[138.5px] top-[119px] w-[896px]" data-name="Section">
      <Heading />
      <Paragraph />
      <Button2 />
      <Paragraph1 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[31.5px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[31.5px] left-[434.26px] text-[26.25px] text-center text-nowrap text-white top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Everything You Need to Grow Your Channel
      </p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
        <g id="Icon">
          <path d="M28 12.25H38.5V22.75" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d={svgPaths.p34f06498} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
        </g>
      </svg>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-[231.328px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[24.5px] relative w-[231.328px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-0 text-[17.5px] text-nowrap text-white top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Track Your Growth
        </p>
      </div>
    </div>
  );
}

function LandingPage1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[231.328px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-full relative w-[231.328px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.8)] top-0 w-[208px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Monitor views, likes, comments, CTR, retention, and more - all in one place
        </p>
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="absolute bg-[rgba(10,10,10,0.1)] content-stretch flex flex-col gap-[35px] h-[236.5px] items-start left-0 pl-[22px] pr-px py-[22px] rounded-[12.75px] top-0 w-[275.328px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12.75px]" />
      <Icon1 />
      <LandingPage />
      <LandingPage1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
        <g id="Icon">
          <path d="M14 3.5V10.5" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d="M28 3.5V10.5" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d={svgPaths.p1759f7f0} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d="M5.25 17.5H36.75" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
        </g>
      </svg>
    </div>
  );
}

function LandingPage2() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-[231.336px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[24.5px] relative w-[231.336px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-0 text-[17.5px] text-nowrap text-white top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Automated Milestones
        </p>
      </div>
    </div>
  );
}

function LandingPage3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[231.336px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-full relative w-[231.336px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.8)] top-0 w-[216px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Automatic snapshots at Day 4, 7, 30, and more to track performance over time
        </p>
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="absolute bg-[rgba(10,10,10,0.1)] content-stretch flex flex-col gap-[35px] h-[236.5px] items-start left-[296.33px] pl-[22px] pr-px py-[22px] rounded-[12.75px] top-0 w-[275.336px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12.75px]" />
      <Icon2 />
      <LandingPage2 />
      <LandingPage3 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
        <g id="Icon">
          <path d={svgPaths.p21a39f80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d={svgPaths.p3598ab0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d={svgPaths.p35a11600} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
        </g>
      </svg>
    </div>
  );
}

function LandingPage4() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-[231.336px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[24.5px] relative w-[231.336px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-0 text-[17.5px] text-nowrap text-white top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Performance Goals
        </p>
      </div>
    </div>
  );
}

function LandingPage5() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[231.336px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-full relative w-[231.336px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.8)] top-0 w-[224px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Set targets, identify winners, and understand which videos perform best
        </p>
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="absolute bg-[rgba(10,10,10,0.1)] content-stretch flex flex-col gap-[35px] h-[236.5px] items-start left-[592.66px] pl-[22px] pr-px py-[22px] rounded-[12.75px] top-0 w-[275.336px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12.75px]" />
      <Icon3 />
      <LandingPage4 />
      <LandingPage5 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[236.5px] relative shrink-0 w-full" data-name="Container">
      <Card />
      <Card1 />
      <Card2 />
    </div>
  );
}

function Section1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[42px] h-[422px] items-start left-[138.5px] pb-0 pt-[56px] px-[14px] top-[402.5px] w-[896px]" data-name="Section">
      <Heading1 />
      <Container1 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute h-[31.5px] left-[14px] top-[56px] w-[868px]" data-name="Heading 2">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[31.5px] left-[434.12px] text-[26.25px] text-center text-nowrap text-white top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Simple Setup, Powerful Insights
      </p>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white relative rounded-[1.67772e+07px] shrink-0 size-[42px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-[42px]">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] relative shrink-0 text-[#5928cb] text-[17.5px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          1
        </p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-0 text-[17.5px] text-nowrap text-white top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Connect Your Channel
      </p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.8)] text-nowrap top-0 whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Link your YouTube account in seconds using the YouTube Data API
      </p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[52.5px] relative shrink-0 w-[435.813px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7px] h-[52.5px] items-start relative w-[435.813px]">
        <Heading2 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[21px] h-[52.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white relative rounded-[1.67772e+07px] shrink-0 size-[42px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-[42px]">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] relative shrink-0 text-[#5928cb] text-[17.5px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          2
        </p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-0 text-[17.5px] text-nowrap text-white top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Sync Your Videos
      </p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.8)] text-nowrap top-0 whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Import your videos and start tracking analytics automatically
      </p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[52.5px] relative shrink-0 w-[402.359px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7px] h-[52.5px] items-start relative w-[402.359px]">
        <Heading4 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[21px] h-[52.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-white relative rounded-[1.67772e+07px] shrink-0 size-[42px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-[42px]">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] relative shrink-0 text-[#5928cb] text-[17.5px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          3
        </p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-0 text-[17.5px] text-nowrap text-white top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Watch Your Growth
      </p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.8)] text-nowrap top-0 whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Track performance, set goals, and make data-driven decisions
      </p>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[52.5px] relative shrink-0 w-[409.953px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7px] h-[52.5px] items-start relative w-[409.953px]">
        <Heading5 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[21px] h-[52.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[28px] h-[213.5px] items-start left-[112px] top-[129.5px] w-[672px]" data-name="Container">
      <Container4 />
      <Container7 />
      <Container10 />
    </div>
  );
}

function Section2() {
  return (
    <div className="absolute h-[399px] left-[138.5px] top-[824.5px] w-[896px]" data-name="Section">
      <Heading3 />
      <Container11 />
    </div>
  );
}

function LandingPage6() {
  return (
    <div className="h-[31.5px] relative shrink-0 w-[502px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[31.5px] relative w-[502px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[31.5px] left-[251.07px] text-[26.25px] text-center text-nowrap text-white top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Ready to Level Up Your Channel?
        </p>
      </div>
    </div>
  );
}

function LandingPage7() {
  return (
    <div className="h-[24.5px] relative shrink-0 w-[502px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[24.5px] relative w-[502px]">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] left-[251.13px] text-[17.5px] text-[rgba(255,255,255,0.8)] text-center text-nowrap top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Join beta testers and get 30 days of full access
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[6.75px] shrink-0 w-[502px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center px-[28px] py-[21px] relative w-[502px]">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[24.5px] relative shrink-0 text-[#5928cb] text-[15.75px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Start Your Free Trial
        </p>
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="absolute bg-[rgba(11,11,11,0.1)] content-stretch flex flex-col gap-[35px] h-[268px] items-start left-[292.5px] pl-[43px] pr-px py-[43px] rounded-[12.75px] top-[1279.5px] w-[588px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12.75px]" />
      <LandingPage6 />
      <LandingPage7 />
      <Button3 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-[434.48px] text-[14px] text-[rgba(255,255,255,0.6)] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        © 2025 TubeLab. All rights reserved.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute content-stretch flex flex-col h-[78px] items-start left-[138.5px] pb-0 pt-[29px] px-[14px] top-[1603.5px] w-[896px]" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none" />
      <Paragraph5 />
    </div>
  );
}

function LandingPage8() {
  return (
    <div className="absolute bg-gradient-to-b from-[#0a070d] h-[1681.5px] left-0 to-[#5928cb] to-[50.962%] top-0 w-[1173px]" data-name="LandingPage">
      <Header />
      <Section />
      <Section1 />
      <Section2 />
      <Card3 />
      <Footer />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[21px] left-0 top-[-20000px] w-[20.742px]" data-name="Text">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        0.8
      </p>
    </div>
  );
}

export default function MbdStudioMain() {
  return (
    <div className="bg-white relative size-full" data-name="MBD-Studio main">
      <LandingPage8 />
      <Text />
    </div>
  );
}