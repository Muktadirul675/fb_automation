import CommentTable from "~/components/CommentTable";

export default function Comments(){
    return <div className="flex justify-center items-center p-4">
    <div className="w-full md:w-2/3 mx-auto">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl"></div>
            <div className="text-md">Total Comments</div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl"></div>
            <div className="text-md">Uploaded</div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl"></div>
            <div className="text-md">Queued</div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl"></div>
            <div className="text-md">Error</div>
          </div>
        </div>
      </div>
      <div className="my-2"></div>
      <CommentTable/>
    </div>
  </div>
}