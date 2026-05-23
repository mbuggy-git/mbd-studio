import svgPaths from "./svg-lt0qaqcn50";
import imgContainer from "figma:asset/c18032896c669b52257857422397d61b2796421f.png";
import imgImageWithFallback from "figma:asset/d94dbda84acdc4afd78b14017a0bb2dadbb74dba.png";
import imgMbdBkndDark3 from "figma:asset/d347e35eeef9c4b77c4a69ee3fea9e166951b330.png";
import { imgMbdBkndDark2 } from "./svg-uuph3";
import MbdStudioLight from "./MbdStudioLight";

function ImageWithFallback() {
  return (
    <div className="h-[130.009px] relative shrink-0 w-[232.161px]" data-name="ImageWithFallback">
      <MbdStudioLight />
    </div>
  );
}

function H() {
  return (
    <div className="absolute h-[47.248px] left-[28.99px] top-0 w-[559.002px]" data-name="h1">
      <p className="absolute font-['DM_Sans:Bold',sans-serif] font-bold leading-[47.25px] left-0 text-[31.5px] text-white top-[-0.22px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Unleash Your Creativity
      </p>
    </div>
  );
}

function P() {
  return (
    <div className="absolute h-[41.997px] left-[28.99px] top-[50.75px] w-[559.002px]" data-name="p">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-[rgba(255,255,255,0.95)] top-[0.11px] w-[557px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Learn how to make your design process faster, and discover how design applications work together. Master these tools, and you can focus on unleashing your creativity.
      </p>
    </div>
  );
}

function Download() {
  return (
    <div className="absolute left-[124.97px] size-[13.993px] top-[13.99px]" data-name="Download">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9931 13.9931">
        <g id="Download">
          <path d="M6.99653 8.74566V1.74913" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16609" />
          <path d={svgPaths.p191cff00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16609" />
          <path d={svgPaths.p14180c80} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16609" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[rgba(255,93,228,0.95)] h-[41.988px] relative rounded-[8.75px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 w-[159.965px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-[21px] text-[14px] text-white top-[10.61px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
          Get the Goods
        </p>
        <Download />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex h-[41.988px] items-start left-[28.99px] top-[113.74px] w-[559.002px]" data-name="Container">
      <Link />
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] h-[155.729px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <H />
        <P />
        <Container3 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex gap-[20.998px] h-[167.995px] items-center left-[27.99px] pr-[269.644px] top-[27.99px] w-[1299.792px]" data-name="Container">
      <div className="h-[130.009px] relative shrink-0 w-[232.161px]">
        <MbdStudioLight />
      </div>
      <Container2 />
    </div>
  );
}

function MbdStudioUrl() {
  return (
    <a 
      href="https://www.youtube.com/@mbd-studio-design"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute left-[1043px] top-[27.51px] w-[169.363px] h-[169.363px] cursor-pointer hover:opacity-90 transition-opacity"
      data-name="mbd-studio-url"
      aria-label="Visit MBD Studio on YouTube"
    >
      <MbdStudioLight />
    </a>
  );
}

export default function Container() {
  return (
    <div className="overflow-clip relative rounded-[8.75px] size-full" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8.75px] size-full" src={imgContainer} />
      <Container1 />
      <MbdStudioUrl />
    </div>
  );
}