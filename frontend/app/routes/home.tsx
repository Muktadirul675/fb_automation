import { useProcesses } from "~/stores/processes";
import type { Route } from "./+types/home";
import { usePostProcesses } from "~/stores/postProcesses";
import { useCommentProcesses } from "~/stores/commentProcesses";
import { useReactionProcesses } from "~/stores/reactionProcesses";
import ProcessTabs from "~/components/ProcessTabs";
import { BiPlus } from "react-icons/bi";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const postProcesses = usePostProcesses()
  const commentProcesses = useCommentProcesses()
  const reactionProcesses = useReactionProcesses()

  return <div className="flex justify-center items-center p-4">
    <div className="w-full md:w-1/2 mx-auto">
      <div className="flex items-start flex-wrap">
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl">{postProcesses.totalCount + reactionProcesses.totalCount + commentProcesses.totalCount}</div>
            <div className="text-md">All Processes</div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 relative text-white">
            <div className="text-2xl">{postProcesses.totalCount}</div>
            <div className="text-md">Post Processes</div>
            <div className="text-white absolute bottom-0 right-0 p-2">
              <Link to="/processes/new/post">
                <BiPlus className="cursor-pointer text-xl" />
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 relative text-white">
            <div className="text-2xl">{commentProcesses.totalCount}</div>
            <div className="text-md">Comment Processes</div>
            <div className="text-white absolute bottom-0 right-0 p-2">
              <Link to="/processes/new/comment">
                <BiPlus className="cursor-pointer text-xl" />
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 relative text-white">
            <div className="text-2xl">{reactionProcesses.totalCount}</div>
            <div className="text-md">Reaction Processes</div>
            <Link to="/processes/new/reaction">
              <BiPlus className="cursor-pointer text-xl" />
            </Link>
          </div>
        </div>
      </div>
      <div className="my-2"></div>
      <ProcessTabs />
    </div>
  </div>
}
