import type { ToggleHook } from "~/hooks/useToggleAble"

export default function Modal({ children, toggler }: { children: React.ReactNode, toggler: ToggleHook }) {
    if (toggler.state) {
        return <div className="fixed inset-0 flex justify-center items-start">
            <div onClick={()=>{
                toggler.toggle(false)
            }} className="fixed inset-0 bg-slate-100 opacity-50 z-10 min-w-[80vw] md:min-w-1/4"></div>
            <div className="p-6 rounded-2xl shadow-2xl mt-5 bg-white z-20 animate-fade">
                {children}
            </div>
        </div>
    } else {
        return null
    }
}