import { useEffect } from "react";
import { useLocation } from "react-router";
import PostTable from "~/components/PostTable";
import { usePosts } from "~/stores/posts";

export default function Posts() {
  const location = useLocation()
  const queries = new URLSearchParams(location.search)
  const page = parseInt(queries.get('page') || '1')
  const limit = parseInt(queries.get('limit') || '10')

  const posts = usePosts()

  // useEffect(()=>{
  //   posts.fetchPage(page, limit)
  // },[page,limit])

  return <div className="flex justify-center items-center p-4">
    <div className="w-full md:w-2/3 mx-auto">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl"></div>
            <div className="text-md">Total Posts</div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 p-2">
          <div className="rounded p-3 bg-blue-500 text-white">
            <div className="text-2xl"></div>
            <div className="text-md">Success</div>
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
      
      <PostTable />
    </div>
  </div>
}