import type { data } from "../classes/data"
import { accept, refuse } from "../api/api";

export const VisitorLabel = ({visitor}: {visitor: data}) => {
    return (
        <>
            <div className='text'>`${visitor.name} ${visitor.second_name} ${visitor.patronim} ${visitor.phone}`</div>
            <button onClick={() => accept(visitor.id)}></button>
            <button onClick={() => refuse(visitor.id)}></button>
        </>
    );
    
}