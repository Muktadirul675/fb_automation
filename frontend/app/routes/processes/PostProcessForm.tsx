import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { BiArrowBack, BiInfoCircle, BiPlus } from "react-icons/bi"
import { MdDelete } from "react-icons/md"
import { useNavigate } from "react-router"
import { BackButton } from "~/components/BackButton"
import Spinner from "~/components/Spinner"
import Warnings from "~/components/Warnings"
import { promptUser } from "~/components/prompt"
import { useToggle } from "~/hooks/useToggleAble"
import api, { ai } from "~/lib/axios-clients"
import { getRandomItems } from "~/lib/utils"
import { useAI as useAICtx, type AIContextType } from "~/stores/ai"
import { useGroups } from "~/stores/groups"
import { usePages } from "~/stores/pages"
import { Status, type Group, type Page } from "~/types"

interface ListGroup extends Group {
    checked: boolean
}

interface ListPage extends Page {
    checked: boolean
}

interface PreviewMedia {
    id: number,
    preview: string,
    file: File
}

let lastId = 0;

function SelectGroups({
    groupSearch,
    setGroupSearch,
    filteredGroups,
    setListGroups,
    listGroups,
    selectedGroups
}: {
    groupSearch: string,
    setGroupSearch: React.Dispatch<React.SetStateAction<string>>,
    filteredGroups: ListGroup[],
    setListGroups: React.Dispatch<React.SetStateAction<ListGroup[]>>,
    listGroups: ListGroup[],
    selectedGroups: ListGroup[]
}) {
    const [selectAll, setSelectAll] = useState<boolean>(false)
    const [selectRandom, setSelectRandom] = useState<boolean>(false)
    const [randomCount, setRandomCount] = useState<number>(listGroups.length / 2)

    useEffect(() => {
        if (selectAll && selectRandom) {
            setSelectRandom(false)
            setListGroups((prev) => prev.map((p) => {
                return { ...p, checked: selectAll }
            }))
        }
        if (!selectRandom) {
            setListGroups((prev) => prev.map((p) => {
                return { ...p, checked: selectAll }
            }))
        }
    }, [selectAll])

    useEffect(() => {
        if (!selectRandom) return
        if (selectRandom && selectAll) {
            setSelectAll(false)
        }
        const arr = getRandomItems<ListGroup>(listGroups, randomCount)?.map((a) => a.id)
        if (arr) {
            setListGroups((prev) => prev.map((p) => {
                return { ...p, checked: arr.includes(p.id) }
            }))
        }
    }, [selectRandom, randomCount])

    return <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow max-h-[50vh] overflow-auto relative">
        <div className="px-5 py-3 flex flex-col items-start w-full sticky top-0 bg-white border-b border-gray-400">
            <div className="flex flex-row w-full">
                <h3 className="text-xl font-semibold text-gray-800 ">Select Groups
                    <span className="text-sm mx-1">
                        ({listGroups.length})
                    </span>
                </h3>
                <input value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} type="text" placeholder="Search Groups" className="input ms-auto" />
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
                {selectRandom && <input placeholder="Random Groups Count" type="number" min={1} max={listGroups.length} value={randomCount} onChange={(e) => setRandomCount(parseInt(e.target.value))} className="ms-2 input" />}
                <div className="ms-auto text-sm text-gray-700">Selected: {selectedGroups.length}</div>
            </div>
        </div>
        {filteredGroups.map((group) => {
            return <div key={group.id} className="pb-3 px-5 divide-y">
                <input type="checkbox" onChange={(e) => {
                    setListGroups((prev) => prev.map((g) => {
                        if (g.id === group.id) {
                            return { ...g, checked: e.target.checked }
                        }
                        return g
                    }))
                }} checked={group.checked} name="group" id={`${group.id}`} />
                <span className="mx-2"></span>
                {group.name}
            </div>
        })}
    </div>
}

function SelectPages({
    PageSearch,
    setPageSearch,
    filteredPages,
    setListPages,
    listPages,
    selectedPages
}: {
    PageSearch: string,
    setPageSearch: React.Dispatch<React.SetStateAction<string>>,
    filteredPages: ListPage[],
    setListPages: React.Dispatch<React.SetStateAction<ListPage[]>>,
    selectedPages: ListPage[],
    listPages: ListPage[],
}) {
    const [selectAll, setSelectAll] = useState<boolean>(false)
    const [selectRandom, setSelectRandom] = useState<boolean>(false)
    const [randomCount, setRandomCount] = useState<number>(listPages.length / 2)

    useEffect(() => {
        if (selectAll && selectRandom) {
            setSelectRandom(false)
            setListPages((prev) => prev.map((p) => {
                return { ...p, checked: selectAll }
            }))
        }
        if (!selectRandom) {
            setListPages((prev) => prev.map((p) => {
                return { ...p, checked: selectAll }
            }))
        }
    }, [selectAll])

    useEffect(() => {
        if (!selectRandom) return
        if (selectRandom && selectAll) {
            setSelectAll(false)
        }
        const arr = getRandomItems<ListPage>(listPages, randomCount)?.map((a) => a.id)
        if (arr) {
            setListPages((prev) => prev.map((p) => {
                return { ...p, checked: arr.includes(p.id) }
            }))
        }
    }, [selectRandom, randomCount])

    return <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow max-h-[50vh] overflow-auto relative">
        <div className="px-5 py-3 flex flex-col items-start w-full sticky top-0 bg-white border-b border-gray-400">
            <div className="flex flex-row w-full">
                <h3 className="text-xl font-semibold text-gray-800 ">Select Pages
                    <span className="text-sm mx-1">
                        ({listPages.length})
                    </span>
                </h3>
                <input value={PageSearch} onChange={(e) => setPageSearch(e.target.value)} type="text" placeholder="Search Pages" className="input ms-auto" />
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
                {selectRandom && <input placeholder="Random Pages Count" type="number" min={1} max={listPages.length} value={randomCount} onChange={(e) => setRandomCount(parseInt(e.target.value))} className="ms-2 input" />}
                <div className="ms-auto text-sm text-gray-700">Selected: {selectedPages.length}</div>
            </div>
        </div>
        {filteredPages.map((Page) => {
            return <div key={Page.id} className="pb-3 px-5 divide-y">
                <input type="checkbox" onChange={(e) => {
                    setListPages((prev) => prev.map((g) => {
                        if (g.id === Page.id) {
                            return { ...g, checked: e.target.checked }
                        }
                        return g
                    }))
                }} checked={Page.checked} name="Page" id={`${Page.id}`} />
                <span className="mx-2"></span>
                {Page.name}
            </div>
        })}
    </div>
}

function UploadMedias({ medias, setMedias }: { medias: PreviewMedia[], setMedias: React.Dispatch<React.SetStateAction<PreviewMedia[]>> }) {

    return <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow p-5">
        <h3 className="text-lg font-semibold mb-2">Upload Medias</h3>
        {medias.length > 0 && <div className="my-2 flex flex-wrap items-start flex-row">
            {medias.map((media) => {
                return <div key={media.id} className="group w-1/2 md:w-1/4 p-1 z-1 relative hover:scale-150 transition-all hover:z-3">
                    <img className="aspect-auto rounded-lg" src={media.preview} alt="" />
                    <div className="absolute top-0 right-0 p-2">
                        <div className="p-[2px] cursor-pointer rounded text-white bg-red-500 hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100">
                            <MdDelete />
                        </div>
                    </div>
                </div>
            })}
        </div>}
        <label htmlFor="media" className="my-1 rounded w-full h-[50px] border border-blue-300 bg-blue-100 cursor-pointer font-semibold text-gray-600 flex items-center justify-center">Select Images or Videos</label>
        <input onChange={(e) => {
            const files = e.target.files
            const uploads: PreviewMedia[] = []
            if (files) {
                for (const file of files) {
                    const preview = URL.createObjectURL(file)
                    uploads.push({
                        id: lastId++,
                        file: file,
                        preview: preview
                    })
                }
            }
            setMedias((prev) => [...prev, ...uploads])

        }} type="file" name="media" id="media" className="hidden" multiple />
    </div>
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

    return <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow p-5">
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

interface PostProcessRequestBody {
    text: string;
    scheduled_for: string; // ISO 8601 date string
    name: string;
    interval: number;
    interval_range_start: number;
    interval_range_end: number;
    use_ai: boolean;
    ai_model: string;
    status?: Status; // Extend as needed
    medias?: number[];  // Replace 'number' with a specific media type if available
    groups: number[];  // Replace 'number' with a specific group type if available
    pages: number[];   // Replace 'any' with a specific page type if available
}

export default function PostProcessForm() {
    const [name, setName] = useState<string>('')
    const [text, setText] = useState<string>('')
    const [useAI, setUseAI] = useState<boolean>(false)
    const [aiModel, setAIModel] = useState<string>('')

    const [medias, setMedias] = useState<PreviewMedia[]>([])

    const { groups } = useGroups()
    const { pages } = usePages()

    const [listGroups, setListGroups] = useState<ListGroup[]>([])
    const [listPages, setListPages] = useState<ListPage[]>([])

    const [filteredGroups, setFilteredGroups] = useState<ListGroup[]>([])
    const [filteredPages, setFilteredPages] = useState<ListPage[]>([])

    const [groupSearch, setGroupSearch] = useState<string>('')
    const [pageSearch, setPageSearch] = useState<string>('')

    const selectedGroups = useMemo(() => {
        return listGroups.filter((g) => g.checked)
    }, [listGroups])

    const selectedPages = useMemo(() => {
        return listPages.filter((p) => p.checked)
    }, [listPages])

    const [scheduledFor, setScheduledFor] = useState<string>('')
    const [interval, setInterval] = useState<number>(0)
    const [intervalStart, setIntervalStart] = useState<number>(0)
    const [intervalEnd, setIntervalEnd] = useState<number>(0)

    const aiCtx = useAICtx()

    const navigate = useNavigate();

    const [creating, setCreating] = useState<boolean>(false)

    useEffect(() => {
        setListGroups(groups.map((g) => {
            return { ...g, checked: false }
        }))
    }, [groups])

    useEffect(() => {
        setListPages(pages.map((p) => {
            return { ...p, checked: false }
        }))
    }, [pages])

    useEffect(() => {
        setFilteredGroups(() => {
            const search = groupSearch.trim()
            if (search === '') {
                return listGroups
            }

            return listGroups.filter((g) => {
                return g.name.toLowerCase().includes(search.toLowerCase())
            })
        })
    }, [groupSearch, listGroups])

    useEffect(() => {
        setFilteredPages(() => {
            const search = pageSearch.trim()
            if (search === '') {
                return listPages
            }

            return listPages.filter((g) => {
                return g.name.toLowerCase().includes(search.toLowerCase())
            })
        })
    }, [pageSearch, listPages])

    async function create() {
        let invalid = false;
        if (name.trim() === '') {
            toast.error("Name can't be empty")
            invalid = true
        }
        if (text.trim() === '') {
            toast.error("Text can't be empty")
            invalid = true
        } if (useAI && aiModel.trim() === '') {
            toast.error("Select an AI model")
            invalid = true
        }
        if (selectedGroups.length + selectedPages.length <= 0) {
            toast.error("At least one group or page should be selected")
            invalid = true
        }
        if (intervalStart > intervalEnd) {
            toast.error("Interval range invalid!")
            invalid = true;
        }
        if (invalid) {
            return
        }
        const warnings: string[] = []
        if (!useAI) {
            warnings.push("You are proceeding without using AI")
        }
        if (scheduledFor === '') {
            warnings.push("You have not scheduled the process")
        }
        if (interval === 0 || (intervalStart === 0 && intervalEnd === 0)) {
            warnings.push(`No ${interval === 0 ? 'interval' : 'interval range'} specified`)
        }
        let confirmed = true;
        if (warnings.length) {
            confirmed = await promptUser(
                <div>
                    <div className="flex items-center p-5 pb-0">
                        <BiInfoCircle className="text-2xl text-blue-500" />
                        <div className="mx-1"></div>
                        <h3 className="text-xl font-semibold">Summary</h3>
                    </div>
                    <div className="p-5 py-0 pt-3 ps-7">
                        <div className="mb-1">
                            Name : {name}
                        </div>
                        <div className="mb-1">
                            Text: {text}
                        </div>
                        <div className="mb-1">
                            AI : {useAI ? `${aiModel}` : "No AI Being used"}
                        </div>
                        <div className="mb-1">
                            Medias: {medias.length > 0 ? `${medias.length} medias selected` : "No media selected"}
                        </div>
                        {scheduledFor !== '' && <div className="mb-1">
                            Scheduled For: {scheduledFor}
                        </div>}
                        <div className="mb-1">
                            {interval > 0 ? <>
                                Interval: {interval} minutes
                            </> : (intervalStart > 0 && intervalEnd > 0) ? <>
                                Interval Range : {intervalStart} minutes to {intervalEnd} minutes
                            </> : null}
                        </div>
                        {selectedGroups.length > 0 && <div className="mb-1">
                            {selectedGroups.length} group(s) selected
                        </div>}
                        {selectedPages.length > 0 && <div className="mb-1">
                            {selectedPages.length} page(s) selected
                        </div>}
                    </div>
                    <div className="my-1"></div>
                    <Warnings warnings={warnings} header={'Please note that'} />
                </div>
            )
        }
        if (confirmed) {
            setCreating(true)
            const media_ids : number[] = []
            const mediaData = new FormData();

            // Append each file to the FormData object

            if(medias.length){
                for (const media of medias) {
                    mediaData.append('files', media.file);  // Assuming each `media` has a `.file` property
                }
                
                try {
                    const res = await api.post<{
                        files: {
                          id: number;
                          filename: string;
                          url: string;
                        }[];
                      }>("/upload", mediaData, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      });
                      
                      // Now access res.data.files instead of res.data
                      res.data.files.forEach((data) => {
                        media_ids.push(data.id);
                      });
                
                    toast("Medias uploaded")
                } catch (error) {
                    toast.error('Error uploading media:');
                    console.error('Error uploading media:', error);
                }
            }

            const req: PostProcessRequestBody = {
                ai_model: aiModel,
                groups: selectedGroups.map((g) => g.id) as number[],
                interval: interval,
                interval_range_end: intervalEnd,
                interval_range_start: intervalStart,
                name: name,
                scheduled_for: scheduledFor === ''
                    ? new Date().toISOString()
                    : new Date(scheduledFor).toISOString(),
                pages: selectedPages.map((p) => p.id) as number[],
                text: text,
                status: Status.pending,
                use_ai: useAI,
                medias: media_ids
            }
            try {
                const res = await api.post("/posts/process", req)
                toast.success(res.data.id)
                navigate("/")
            } catch (e) {
                toast.error(`${e}`)
            }
        }
        setCreating(false)
    }

    return <div className="w-full flex bg-slate-50 min-h-screen justify-center p-5">
        <div className="w-2/3">
            <div className="flex flex-row items-center">
                <BackButton />
                <div className="mx-2.5"></div>
                <div className="text-3xl font-semibold">Create Post Process</div>
                {creating ? <div className="ms-auto">
                    <Spinner />
                </div>
                    : <button onClick={create} className="btn ms-auto flex items-center">
                        <BiPlus className="text-xl me-2" /> Create
                    </button>}
            </div>
            <div className="w-full flex flex-wrap items-start my-2">
                <div className="w-1/2 p-3">
                    <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow p-5">
                        <label htmlFor="name" className="label">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="name" name="name" className="input" />
                        <div className="my-1"></div>
                        <label htmlFor="text" className="label">Text</label>
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} id="text" name="text" className="input" />
                    </div>
                    <SelectAI text={text} aiCtx={aiCtx} aiModel={aiModel} setAIModel={setAIModel} setUseAI={setUseAI} useAI={useAI} />
                    <UploadMedias medias={medias} setMedias={setMedias} />
                </div>
                <div className="w-1/2 flex flex-col items-start">
                    <div className="w-full bg-white flex mb-2 flex-col rounded-md shadow p-5">
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
                    <SelectGroups selectedGroups={selectedGroups} listGroups={listGroups} filteredGroups={filteredGroups} groupSearch={groupSearch} setGroupSearch={setGroupSearch} setListGroups={setListGroups} />
                    <SelectPages selectedPages={selectedPages} listPages={listPages} filteredPages={filteredPages} PageSearch={pageSearch} setPageSearch={setPageSearch} setListPages={setListPages} />
                </div>
            </div>
        </div>
    </div >
}