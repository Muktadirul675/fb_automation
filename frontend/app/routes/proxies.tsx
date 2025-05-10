import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import CompHeaderText from "~/components/CompHeaderText";
import Modal from "~/components/Modal";
import ProxyTable from "~/components/ProxyTable";
import Spinner from "~/components/Spinner";
import { useToggle } from "~/hooks/useToggleAble";
import { useProxy } from "~/stores/proxies";
import type { Proxy } from "~/types";

export default function Proxies() {
    const editProxyToggler = useToggle()
    const proxies = useProxy()
    const activeProxies = useMemo(() => proxies.proxies.filter((p) => p.active), [proxies.proxies])

    const [hostname, setHostname] = useState<string>('')
    const [port, setPort] = useState<number>(0)
    const [password, setPassword] = useState<string>('')
    const [active, setActive] = useState<boolean>(true)

    const [adding, setAdding] = useState<boolean>(false)

    async function add(){
        setAdding(true)
        let invalid = false;
        if(hostname.trim() === ''){
            toast.error("Please provide a valid hostname")
            invalid = true;
        }
        if(password.trim() === ''){
            toast.error("Please provide a hostname")
            invalid = true;
        }
        if(port === 0){
            toast.error("Please provide a valid port")
            invalid = true;
        }
        if(!invalid){
            await proxies.addProxy({
                hostname,
                port,
                password,
                active
            })
        }
        setAdding(false)
    }

    return <div className="w-full flex justify-center p-3 min-h-screen bg-slate-50">
        <div className="w-2/3">
            <div className="w-full  rounded text-white bg-blue-500 flex">
                <div className="w-1/2 border-r p-3">
                    <h3 className="text-2xl">{proxies.proxies.length}</h3>
                    <h3 className="text-">Proxies</h3>
                </div>
                <div className="w-1/2 border-l p-3">
                    <h3 className="text-2xl">{activeProxies.length}</h3>
                    <h3 className="text-">Active Proxies</h3>
                </div>
            </div>
            <div className="my-2"></div>
            <div className="w-full flex gap-2 items-end bg-white p-3 rounded shadow-sm">
                <div className="flex flex-col">
                    <label htmlFor="hostname" className="label">Hostname</label>
                    <input value={hostname} onChange={(e)=>setHostname(e.target.value)} type="text" id="hostname" name="hostname" className="input" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="port" className="label">Port</label>
                    <input value={port} onChange={(e)=>setPort(parseInt(e.target.value))} type="number" id="port" name="port" className="input" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="password" className="label">Password</label>
                    <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" id="password" name="password" className="input" />
                </div>
                <div>
                    <div>
                        <input type="checkbox" name="" checked={active} onChange={(e)=>setActive(e.target.checked)} id="" /> Active
                    </div>
                    {adding ? <Spinner/> : <button onClick={add} className="btn">Add</button>}
                </div>
            </div>
            <div className="my-2"></div>
            <ProxyTable />
        </div>
    </div>
}