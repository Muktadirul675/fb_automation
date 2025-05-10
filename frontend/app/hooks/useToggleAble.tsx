import { useState } from "react";

export interface ToggleHook {
    state: boolean,
    toggle: (val?:boolean|null) => void,
}

export function useToggle(initial:boolean=false) : ToggleHook {
    const [state, setState] = useState(initial)
    function toggle(val:boolean|null=null) {
        if(val === null){
            setState((prev) => !prev)
        }else{
            setState(val)
        }
    }
    return {
        state,
        toggle: () => toggle()
    }
}