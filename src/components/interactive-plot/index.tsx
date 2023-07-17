import { Component } from "inferno";
import './style.less';


interface Props {
    yLabel?: string;
    xLabel?: string;
    plotLabel?: string;
    maxItemsCount: number;
    mode: InteractivePlotMode;
}

interface State {
    items: number[];
    ones: number[];
}

export enum InteractivePlotMode {
    CodeNRZ = 0,
    CodeСMI = 1,
    CodeHDB3 = 2,
    CodeRZ = 3,
    CodeABS = 4,
    CodeOBS = 5
}

export class InteractivePlot extends Component<Props, State> {
    static stepWidth = 50; //ось Х

    static stepHeight = 40; //ось У

    static tickHeight = 5;  //отсечка на оси х

    static xLineOffset = 160;

    static stepWidthAMI = 25;

    constructor(props: Props) {
        super(props);
        this.state = {
            items: [],
            ones: []
        };
        this.handleItemAdd = this.handleItemAdd.bind(this);
        document.addEventListener("keydown", this.handleItemAdd, false);
    }

    componentWillUnmount(): void {
        document.removeEventListener("keydown", this.handleItemAdd, false);
    }

    handleItemAdd(e: KeyboardEvent) {
        if (!e)
            return;
        const key = e.key;
        if (!this.state)
            return;
        const {mode, maxItemsCount} = this.props;
        const {items} = this.state;


        if (key == 'Backspace') {
            this.handleItemRemove();
            return;
        }
        if (items.length >= maxItemsCount)
            return;
        const newItems = Array.from(this.state.items);
        if (mode == InteractivePlotMode.CodeNRZ) {
            switch(key) {
            case '1':
                newItems.push(1);
                newItems.push(1);
                break;
            case '0':
                newItems.push(0);
                newItems.push(0);
                break;
            }
        } else if (mode == InteractivePlotMode.CodeRZ) {
            //
            switch(key) {
                case '1':
                    newItems.push(1);
                    newItems.push(0);
                    break;
                case '0':
                    newItems.push(0);
                    newItems.push(0);
                    break;
                }
        }
        else if (mode == InteractivePlotMode.CodeСMI) {
            //
            switch(key) {
                case '1':
                    newItems.push(1);
                    newItems.push(1);
                    break;
                case '0':
                    newItems.push(0);
                    newItems.push(1);
                    break;
                }
        }
        else if (mode == InteractivePlotMode.CodeABS) {
                    //
                    switch(key) {
                        case '1':
                            newItems.push(1);
                            newItems.push(-1);
                            break;
                        case '0':
                            newItems.push(-1);
                            newItems.push(-1);
                            break;
                    }
        }
        else if (mode == InteractivePlotMode.CodeOBS) {
                        //
                        switch(key) {
                            case '1':
                                newItems.push(1);
                                newItems.push(-1);
                                break;
                            case '0':
                                newItems.push(-1);
                                newItems.push(-1);
                                break;
                            }
                        
        } if (mode == InteractivePlotMode.CodeHDB3) {
            const key = e.key
            if (key == '1'){
                let mass = this.state.ones
                let onn = this.state.ones.push(1);
                if (onn % 2 == 0 && mass.length > 3){
                    //вставка 100V
                    newItems.splice(-4, 4, -1, 0, 0, -1)
                    console.log(this.state.items, 'вставка 100V')
                    this.state.ones.length = 0
                }
                else {
                    //вставка 000V
                    //newItems.splice(-4, 4, 0, 0, 0, -1)
                    console.log(this.state.ones, 'вставка 000V')
                    
                }
            }

            switch(key) {
                //отбить следующий прикол 
                case '1':
                    newItems.push(1);
                    //newItems.push(1);
                    break;
                case '0':
                    newItems.push(0);
                    //newItems.push(0);
                    break;
                }
        }
        this.setState({items: newItems});
    }

    handleItemRemove() {
        if (!this.state)
            return;
        const newItems = Array.from(this.state.items);
        newItems.pop();
        this.setState({items: newItems});
    }

    render() {
        if (!this.state)
            return;

        const {items} = this.state;
        const {maxItemsCount} = this.props;

        let pos = 0;

        const ticks: any[] = [];
        for (let i = 1; i <= maxItemsCount + 1 ; i++) {
            // я так полагаю вот это колдунство делает засечки на оси координат
            ticks.push(<path d={
                `M ${ i * InteractivePlot.stepWidth } ${InteractivePlot.xLineOffset} `
                + `l 1 -${InteractivePlot.tickHeight}`
            }/>);
        }
        return <svg className="interactive-plot">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                    refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>
            <line
                x1={InteractivePlot.stepWidth}
                y1={InteractivePlot.xLineOffset}
                x2={InteractivePlot.stepWidth}
                y2={InteractivePlot.stepHeight}
                stroke-width="2" marker-end="url(#arrowhead)" />
            <line
                x1={InteractivePlot.stepWidth}
                y1={InteractivePlot.xLineOffset}
                x2={InteractivePlot.stepWidth * (maxItemsCount + 2)}
                y2={InteractivePlot.xLineOffset}
                stroke-width="2" marker-end="url(#arrowhead)" />
            { ticks }
            {items.map(i => {
                const path = <InteractivePlotItemPath
                    item={i} pos={pos}
                    prevItem={pos >= 1 ? items[pos - 1] : undefined}
                    isLast={pos == items.length - 1}
                />;
                pos++;
                return path;
            })}
        </svg>;
    }
}

interface InteractivePlotItemPathProps {
    item: number;
    prevItem?: number;
    pos: number;
    isLast: boolean;
}

const InteractivePlotItemPath = ({item, prevItem, pos, isLast}: InteractivePlotItemPathProps) => {
    //console.log(item, prevItem);
    const startX = (pos + 1) * InteractivePlot.stepWidth;
    let d = "";

    const startHeight = prevItem == undefined
        ? InteractivePlot.xLineOffset
        : InteractivePlot.xLineOffset - InteractivePlot.stepHeight * prevItem;
    d = `M ${startX} ${startHeight} `;
    if (prevItem != undefined) {
        d += `l 0 ${InteractivePlot.stepHeight * (prevItem - item)} `;
    } else {
        d += `l 0 ${-InteractivePlot.stepHeight * item} `;
    }

    d += `l ${InteractivePlot.stepWidth} 0 `;
    if (isLast)
        d += `l 0 ${InteractivePlot.stepHeight * item}`;


    return <path d={d} className="by-user"/>;
};