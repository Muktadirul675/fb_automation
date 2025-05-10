import { CiWarning } from "react-icons/ci";

export default function Warnings({ warnings, header = "Warning!" }: { warnings: string[], header?: string }) {
    if(warnings.length === 0){
        return null
    }
    return <div className="p-5">
        <div className="flex w-full items-center">
            <CiWarning className="text-yellow-700 text-2xl" />
            <div className="mx-1"></div>
            <div className="text-xl font-semibold">
                {header}
            </div>
        </div>
        <div className="my-1"></div>
        <ul className="ps-5">
            {warnings.map((w) => {
                return <li key={w} className="list-decimal ms-3 mb-1.5">{w}</li>
            })}
        </ul>
    </div>
}