import svgPaths from "./svg-va07a6z3m6";
import imgContainer from "figma:asset/c18032896c669b52257857422397d61b2796421f.png";
import mbdStudioLogo from "../../assets/MBD-studio-logo-wht.svg";
import { Link } from "react-router-dom";

function H() {
  return (
    <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-tight text-[24px] sm:text-[28px] xl:text-[24px] 2xl:text-[28px] text-white" style={{ fontVariationSettings: "'opsz' 14" }} data-name="H">
      Design smarter and faster.
    </p>
  );
}

function P() {
  return (
    <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[20px] text-[14px] text-[rgba(255,255,255,0.95)]" style={{ fontVariationSettings: "'opsz' 14" }} data-name="P">
      AI workflows and design tutorials to help you unleash your creativity.
    </p>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[21px] left-[21px] top-[10.61px] w-[96.977px]" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-white top-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Get the Goods
      </p>
    </div>
  );
}

function Download1() {
  return (
    <div className="absolute contents inset-[12.5%]" data-name="Download">
      <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-8.33%_-0.58px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.16601 8.16254">
            <path d="M0.583007 7.57954V0.583007" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16601" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[62.5%_12.5%_12.5%_12.5%]" data-name="Vector_2">
        <div className="absolute inset-[-16.67%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6608 4.66425">
            <path d={svgPaths.p361a6100} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16601" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.67%_29.16%_37.5%_29.17%]" data-name="Vector_3">
        <div className="absolute inset-[-20%_-10%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.99645 4.08123">
            <path d={svgPaths.p1f2bde00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16601" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[13.992px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Download1 />
    </div>
  );
}

function Download() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[124.97px] size-[13.992px] top-[13.98px]" data-name="Download">
      <Icon />
    </div>
  );
}

function GetTheGoodsButton() {
  return (
    <Link
      to="/get-the-goods"
      className="relative block bg-[rgba(255,93,228,0.95)] h-[41.984px] rounded-[8.75px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] w-[159.961px] hover:opacity-90 transition-opacity cursor-pointer"
      data-name="Link"
    >
      <Paragraph />
      <Download />
    </Link>
  );
}

function Container1() {
  return (
    <div className="h-full relative shrink-0 w-full max-w-[757px] flex flex-col xl:flex-row items-center xl:items-center gap-4 xl:gap-6" data-name="Container1">
      <img
        src={mbdStudioLogo}
        alt="mbd studio"
        className="shrink-0 h-[90px] sm:h-[110px] xl:h-[130px] 2xl:h-[150px] w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
      />
      <div className="flex flex-col justify-center gap-2 flex-1 min-w-0 w-full items-start" data-name="Container2">
        <H />
        <P />
        <div className="pt-1">
          <GetTheGoodsButton />
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[24px] sm:p-[30px] relative size-full" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgContainer} />
      <Container1 />
    </div>
  );
}