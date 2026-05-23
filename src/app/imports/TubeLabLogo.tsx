import svgPaths from "./svg-1ofsaut5hi";

interface TubeLabLogoProps {
  isDarkMode?: boolean;
  className?: string;
}

export default function TubeLabLogo({ isDarkMode = false, className = "" }: TubeLabLogoProps) {
  return (
    <div className={`relative ${className}`} data-name="TubeLab Logo">
      <svg className="block w-full h-auto" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 361 82">
        <g id="TubeLab-Logo">
          {/* Red beaker icon */}
          <path d={svgPaths.p1bfe4e40} fill="#D60303" id="Vector" />
          {/* Text - changes to white in dark mode */}
          <g id="Group">
            <path d={svgPaths.p10c71a00} fill={isDarkMode ? "white" : "black"} id="Vector_2" />
            <path d={svgPaths.p3c0f1800} fill={isDarkMode ? "white" : "black"} id="Vector_3" />
            <path d={svgPaths.p2b47e00} fill={isDarkMode ? "white" : "black"} id="Vector_4" />
            <path d={svgPaths.p31d49000} fill={isDarkMode ? "white" : "black"} id="Vector_5" />
            <path d={svgPaths.p13676240} fill={isDarkMode ? "white" : "black"} id="Vector_6" />
            <path d={svgPaths.p3652dc00} fill={isDarkMode ? "white" : "black"} id="Vector_7" />
            <path d={svgPaths.p3e873000} fill={isDarkMode ? "white" : "black"} id="Vector_8" />
          </g>
        </g>
      </svg>
    </div>
  );
}