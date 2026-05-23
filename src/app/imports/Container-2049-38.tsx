import svgPaths from "./svg-va07a6z3m6";
import imgContainer from "figma:asset/c18032896c669b52257857422397d61b2796421f.png";
import imgMbdBkndDark3 from "figma:asset/d347e35eeef9c4b77c4a69ee3fea9e166951b330.png";
import { imgMbdBkndDark2 } from "./svg-b2nep";
import { Link } from "react-router-dom";

function H() {
  return (
    <div className="absolute h-[47.25px] left-[0.12px] top-[0.9px] w-[360.977px]" data-name="H">
      <p className="absolute font-['DM_Sans:Bold',sans-serif] font-bold leading-[47.25px] left-0 text-[31.5px] text-white top-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Unleash Your Creativity
      </p>
    </div>
  );
}

function P() {
  return (
    <div className="absolute h-[42px] left-[0.12px] top-[51.98px] w-[557px]" data-name="P">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.95)] top-0 w-[557px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Learn how to make your design process faster, and discover how design applications work together. Master these tools, and you can focus on unleashing your creativity.
      </p>
    </div>
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
      className="absolute bg-[rgba(255,93,228,0.95)] h-[41.984px] left-0 rounded-[8.75px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-0 w-[159.961px] hover:opacity-90 transition-opacity cursor-pointer"
      data-name="Link"
    >
      <Paragraph />
      <Download />
    </Link>
  );
}

function ContactStudioParagraph() {
  return (
    <div className="absolute h-[21px] left-[21px] top-[10.61px] w-[120px]" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-white top-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Contact the Studio
      </p>
    </div>
  );
}

function ContactTheStudioButton() {
  return (
    <Link
      to="/training"
      className="absolute bg-[#22A8E1] h-[41.984px] left-[175px] rounded-[8.75px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-0 w-[185px] hover:opacity-90 transition-opacity cursor-pointer"
      data-name="ContactLink"
    >
      <ContactStudioParagraph />
    </Link>
  );
}

function Container3() {
  return (
    <div className="absolute h-[41.984px] left-[0.12px] top-[114.85px] w-[559px]" data-name="Container3">
      <GetTheGoodsButton />
      <ContactTheStudioButton />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[157px] left-[197px] top-0 w-[560px]" data-name="Container2">
      <H />
      <P />
      <Container3 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[0_0_24.7%_0]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 131.376 55.3291">
        <g id="Group">
          <path d={svgPaths.p23e32000} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p35faa300} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.pb037100} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[79.99%_29.56%_0_29.64%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 216.654 59.4284">
        <g id="Group">
          <path d={svgPaths.p32cf9780} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p2ad8f000} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p36ba7980} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p2c03c380} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p3f43e00} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p3b4eba80} fill="var(--fill-0, white)" id="Vector_6" />
        </g>
      </svg>
    </div>
  );
}

function MbdStudioLight() {
  return (
    <div className="absolute contents left-0 top-px drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" data-name="mbd-studio-light">
      <div className="absolute h-[166.152px] left-[-30.21px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[30.21px_7.429px] mask-size-[156px_156px] top-[-6.43px] w-[195.124px]" data-name="mbd-bknd-dark 2" style={{ maskImage: `url('${imgMbdBkndDark2}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMbdBkndDark3} />
      </div>
      <div className="absolute inset-[22.72%_81.04%_30.48%_1.6%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-12.133px_-34.667px] mask-size-[156px_156px] overflow-clip" data-name="MBD-logo-wht" style={{ maskImage: `url('${imgMbdBkndDark2}')` }}>
        <Group />
        <Group1 />
      </div>
      
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[157px] relative shrink-0 w-[757px]" data-name="Container1">
      <Container2 />
      <MbdStudioLight />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[30px] relative rounded-[8.75px] size-full" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8.75px] size-full" src={imgContainer} />
      <Container1 />
    </div>
  );
}