import { useEffect } from "react";
import { VisitorLabel } from "../components/visitorLabel";
import { getList } from "../api/api";
import type {data} from "../classes/data"

export default function monitor() {
    let visitors: data[] = [];

    useEffect(() => {
        getList().then((res) => {
            visitors = JSON.parse(res);
        });
    }, []);

    let list:any

    if(visitors.length == 0) {
        list = visitors.map((vis) => {return <VisitorLabel visitor={vis}></VisitorLabel>})
    } else {
        list = <div>Ожидающих нет</div>
    }

    return (
        <div>
            <>Ожидающие разрешения</>
            <>{list}</>
        </div>
    );
}