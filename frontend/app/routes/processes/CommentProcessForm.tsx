import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BiPlus } from "react-icons/bi";
import { BackButton } from "~/components/BackButton";
import Spinner from "~/components/Spinner";
import { ai } from "~/lib/axios-clients";
import { getRandomItems } from "~/lib/utils";
import { useAI as useAICtx, type AIContextType } from "~/stores/ai";
import { useUsers } from "~/stores/users";
import type { User } from "~/types";

interface ListUser extends User{
    checked: boolean
}

function SelectAI({
    useAI,
    setUseAI,
    setAIModel,
    aiModel,
    aiCtx,
    text
}: {
    useAI: boolean,
    setUseAI: React.Dispatch<React.SetStateAction<boolean>>,
    setAIModel: React.Dispatch<React.SetStateAction<string>>,
    aiModel: string,
    aiCtx: AIContextType,
    text: string
}) {
    const [completion, setCompletion] = useState<string>('')
    const [completionError, setCompletionError] = useState<string>('')

    const [checking, setChecking] = useState<boolean>(false)

    async function checkResponse() {
        if (aiModel === '') {
            toast.error("No AI Model Selected")
            return;
        }
        if (text.trim() === '') {
            toast.error("Prompt can't be empty")
            return
        }
        setChecking(true)
        try {
            const res = await ai.post("/v1/chat/completions", {
                model: aiModel,
                messages: [
                    {
                        role: 'user',
                        content: text
                    }
                ]
            })
            // alert(JSON.stringify(res.data,null,2))
            setCompletion(res.data['choices'][0]['message']['content'])
            setCompletionError('')
        } catch (e) {
            setCompletion('')
            setCompletionError(`Error: ${e}`)
        }
        setChecking(false)
    }

    return <div className="w-full bg-white flex flex-col rounded-md shadow p-5">
        <h3 className="text-lg text-gray-800 font-semibold mb-1">Choose AI Model (Only available if using AI)</h3>
        <h3 className="text-sm text-gray-600 mb-2">Give a prompt in the text field, Select 'Use AI' and an AI model to check the response.</h3>
        <div className="flex flex-row items-center">
            <div>
                <input type="checkbox" name="useAI" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} id="" />
                <span className="mx-1"></span>
                Use AI
            </div>
            <div className="mx-2"></div>
            {useAI && <select value={aiModel} onChange={(e) => setAIModel(e.target.value)} className="px-2 py-1 rounded border border-gray-300">
                <option value="">Select AI Model</option>
                {aiCtx.models.map((model) => {
                    return <option value={model.id} key={model.id}>
                        {`${model.id} [${model.owned_by}]`}
                    </option>
                })}
            </select>}
        </div>
        {aiModel !== '' && text !== '' && <div className="mt-2">
            {checking ? <Spinner /> : <button onClick={checkResponse} className="btn">Check Response</button>}
        </div>}
        {completion.trim() !== '' && <>
            <h3 className="text-lg mt-2 text-gray-800 font-semibold mb-2">AI Response</h3>
            <div className="px-2 py-1 rounded border border-gray-400 bg-slate-100 text-gray-800">
                {completion}
            </div>
        </>
        }
        {completionError.trim() !== '' && <>
            <div className="mt-2 rounded border px-2 py-1 border-red-400 bg-red-100 text-red-800">
                {completionError}
            </div>
        </>
        }
    </div>
}

function SelectUsers({
    UserSearch,
    setUserSearch,
    filteredUsers,
    setListUsers,
    listUsers,
    selectedUsers
}: {
    UserSearch: string,
    setUserSearch: React.Dispatch<React.SetStateAction<string>>,
    filteredUsers: ListUser[],
    setListUsers: React.Dispatch<React.SetStateAction<ListUser[]>>,
    listUsers: ListUser[],
    selectedUsers: ListUser[]
}) {
    const [selectAll, setSelectAll] = useState<boolean>(false)
    const [selectRandom, setSelectRandom] = useState<boolean>(false)
    const [randomCount, setRandomCount] = useState<number>(listUsers.length / 2)

    useEffect(() => {
        if (selectAll && selectRandom) {
            setSelectRandom(false)
            setListUsers((prev) => prev.map((p) => {
                return { ...p, checked: selectAll }
            }))
        }
        if (!selectRandom) {
            setListUsers((prev) => prev.map((p) => {
                return { ...p, checked: selectAll }
            }))
        }
    }, [selectAll])

    useEffect(() => {
        if (!selectRandom) return
        if (selectRandom && selectAll) {
            setSelectAll(false)
        }
        const arr = getRandomItems<ListUser>(listUsers, randomCount)?.map((a) => a.id)
        if (arr) {
            setListUsers((prev) => prev.map((p) => {
                return { ...p, checked: arr.includes(p.id) }
            }))
        }
    }, [selectRandom, randomCount])

    return <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow max-h-[50vh] overflow-auto relative">
        <div className="px-5 py-3 flex flex-col items-start w-full sticky top-0 bg-white border-b border-gray-400">
            <div className="flex flex-row w-full">
                <h3 className="text-xl font-semibold text-gray-800 ">Select Users
                    <span className="text-sm mx-1">
                        ({listUsers.length})
                    </span>
                </h3>
                <input value={UserSearch} onChange={(e) => setUserSearch(e.target.value)} type="text" placeholder="Search Users" className="input ms-auto" />
            </div>
            <div className="flex flex-row w-full items-center">
                <div>
                    <input type="checkbox" name="" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} id="" /> <span className="mx-1"></span>
                    Select All
                </div>
                <div className="mx-2"></div>
                <div>
                    <input type="checkbox" name="" checked={selectRandom} onChange={(e) => setSelectRandom(e.target.checked)} id="" /> <span className="mx-1"></span>
                    Select Random
                </div>
                {selectRandom && <input placeholder="Random Users Count" type="number" min={1} max={listUsers.length} value={randomCount} onChange={(e) => setRandomCount(parseInt(e.target.value))} className="ms-2 input" />}
                <div className="ms-auto text-sm text-gray-700">Selected: {selectedUsers.length}</div>
            </div>
        </div>
        {filteredUsers.map((User) => {
            return <div key={User.id} className="pb-3 px-5 divide-y">
                <input type="checkbox" onChange={(e) => {
                    setListUsers((prev) => prev.map((g) => {
                        if (g.id === User.id) {
                            return { ...g, checked: e.target.checked }
                        }
                        return g
                    }))
                }} checked={User.checked} name="User" id={`${User.id}`} />
                <span className="mx-2"></span>
                {User.name}
            </div>
        })}
    </div>
}


export default function CommentProcessForm() {
    const aiCtx = useAICtx()
    const usersCtx = useUsers()

    const [userSearch, setUserSearch] = useState<string>('')
    const [filteredUsers, setFilteredUsers] = useState<ListUser[]>([])
    const [listUsers, setListUsers] = useState<ListUser[]>([])
    const selectedUsers = useMemo(() => {
        return listUsers.filter((g) => g.checked)
    }, [listUsers])

    const [name, setName] = useState<string>('')
    const [text, setText] = useState<string>('')
    const [useAI, setUseAI] = useState<boolean>(false)
    const [aiModel, setAIModel] = useState<string>('')

    const [scheduledFor, setScheduledFor] = useState<string>('')
    const [interval, setInterval] = useState<number>(0)
    const [intervalStart, setIntervalStart] = useState<number>(0)
    const [intervalEnd, setIntervalEnd] = useState<number>(0)

    const [creating, setCreating] = useState<boolean>(false)

    useEffect(() => {
        setListUsers(usersCtx.users.map((g) => {
            return { ...g, checked: false }
        }))
    }, [usersCtx.users])

    useEffect(() => {
        setFilteredUsers(() => {
            const search = userSearch.trim()
            if (search === '') {
                return listUsers
            }

            return listUsers.filter((g) => {
                return g.name.toLowerCase().includes(search.toLowerCase())
            })
        })
    }, [userSearch, listUsers])

    async function create() {

    }
    return <div className="p-3 flex justify-center w-full min-h-screen bg-slate-50">
        <div className="w-2/3">
            <div className="flex flex-row items-center">
                <BackButton />
                <div className="mx-2.5"></div>
                <div className="text-3xl font-semibold">Create Comment Process</div>
                {creating ? <div className="ms-auto">
                    <Spinner />
                </div>
                    : <button onClick={create} className="btn ms-auto flex items-center">
                        <BiPlus className="text-xl me-2" /> Create
                    </button>}
            </div>
            <div className="w-full flex flex-wrap items-start my-2">
                <div className="w-1/2 p-3 flex flex-col">
                    <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow p-5">
                        <label htmlFor="name" className="label">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="name" name="name" className="input" />
                        <div className="my-1"></div>
                        <label htmlFor="text" className="label">Text</label>
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} id="text" name="text" className="input" />
                    </div>
                    <SelectAI aiCtx={aiCtx} aiModel={aiModel} setAIModel={setAIModel} setUseAI={setUseAI} text={text} useAI={useAI} />
                </div>
                <div className="w-1/2 p-3 flex flex-col gap-y-2">
                    <div className="w-full bg-white flex flex-col rounded-md shadow p-5">
                        <h3 className="text-lg text-gray-800 font-semibold mb-2">Scheduling</h3>
                        <div className="flex flex-row items-center flex-wrap my-2">
                            <label htmlFor="scheduledFor" className="label me-2">Schedule at</label>
                            <div>
                                <input type="datetime-local" className="border px-1 py-1 rounded border-gray-400" name="scheduledFor" id="scheduledFor" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
                            </div>
                        </div>
                        <label htmlFor="interval" className="label">Interval</label>
                        <input type="number" disabled={intervalStart > 0 || intervalEnd > 0} value={interval} onChange={(e) => setInterval(parseInt(e.target.value))} className="input w-fit" name="interval" id="interval" min={1} />
                        <div className="my-2"></div>
                        <div className="label">Interval Range</div>
                        <div className="flex flex-col justify-center items-center md:flex-row md:justify-start flex-wrap gap-2">
                            <input placeholder="Start" disabled={interval > 0} value={intervalStart} onChange={(e) => setIntervalStart(parseInt(e.target.value))} className="input" type="number" name="interval_start" id="interval_start" />
                            {/* <div className="mx-2">to</div> */}
                            <input placeholder="End" disabled={interval > 0} value={intervalEnd} onChange={(e) => setIntervalEnd(parseInt(e.target.value))} className="input" type="number" name="interval_end" id="interval_end" />
                        </div>
                    </div>
                    <SelectUsers UserSearch={userSearch} filteredUsers={filteredUsers} listUsers={listUsers} selectedUsers={selectedUsers} setListUsers={setListUsers} setUserSearch={setUserSearch}/>
                </div>
            </div>
        </div>
    </div>
}