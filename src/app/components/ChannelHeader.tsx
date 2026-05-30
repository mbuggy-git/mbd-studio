import { Link } from "react-router-dom";
import Container from "../imports/Container-2049-38";
import aiWorkflowHomeImage from "../../assets/ai-workflow-home-image.png";

interface ChannelHeaderProps {
  channelData: {
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
      customUrl?: string;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
      viewCount: string;
    };
  };
  channelUrl: string;
}

export function ChannelHeader({ channelData, channelUrl }: ChannelHeaderProps) {
  return (
    <div className="mb-8 flex flex-col xl:flex-row rounded-[8.75px] overflow-hidden shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]">
      <div className="relative h-[380px] sm:h-[360px] xl:h-[223.975px] flex-1 min-w-0">
        <Container />
      </div>
      <Link
        to="/get-the-goods/ai-workflows"
        className="relative block w-full aspect-[1000/450] xl:w-auto xl:h-[223.975px] xl:aspect-[1000/450] xl:shrink-0 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105"
        aria-label="Explore AI workflows"
      >
        <img
          src={aiWorkflowHomeImage}
          alt="AI workflows"
          className="absolute inset-0 size-full object-cover"
        />
      </Link>
    </div>
  );
}
