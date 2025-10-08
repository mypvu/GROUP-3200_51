import { toNumber } from "@/logic/utils/utils.ts";

interface RegisteredElement {
    element: HTMLElement;
    getBackingValue: () => any;
    setBackingValue: (value: any) => void;
    getElementValue: (element: any) => any;
    setElementValue: (element: any, value: any) => void;
}

// How long to wait (after the last input was changed) before saving the inputs
const ELEMENT_SAVE_DELAY = 800;

export class AnalysisViewController {
    private elements: RegisteredElement[] = [];

    private timeout: any | undefined;

    private onSave: () => void = () => {};

    constructor(onSave: () => void) {
        this.onSave = onSave;
        this.resetTimer();
    }

    /**
     * Call this to queue a save to run whenever the user stops typing for a bit
     * @private
     */
    private markDirty() {
        this.resetTimer();
    }

    private resetTimer() {
        // Remove the old timer if possible
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }

        // Create the new timer
        this.timeout = setTimeout(() => {
            let _ = this.save();
        }, ELEMENT_SAVE_DELAY);
    }

    public async save() {
        this.elements.forEach((i) => {
            let newValue = i.getElementValue(i.element);
            i.setBackingValue(newValue);
        });

        this.onSave();
    }

    public load() {
        this.elements.forEach((i) => {
            let savedValue = i.getBackingValue();
            i.setElementValue(i.element, savedValue);
        });
    }

    public addInput<T extends HTMLElement>(
        id: string,
        getBackingValue: () => any,
        setBackingValue: (value: any) => void,
        getElementValue: (element: T) => any,
        setElementValue: (element: T, value: any) => void,
    ) {
        let element = document.getElementById(id)!;

        if (element instanceof HTMLInputElement) {
            (element as HTMLInputElement).oninput = () => {
                this.markDirty();
                console.log("changed");
            };
        }

        this.elements.push({
            element,
            getBackingValue,
            setBackingValue,
            getElementValue,
            setElementValue,
        });
    }

    public addNumberInput<T extends HTMLInputElement = HTMLInputElement>(
        id: string,
        getValue: () => number,
        setValue: (value: number) => void,
    ) {
        this.addInput<T>(
            id,

            () => getValue(),
            (value) => setValue(Number(value)),
            (element) => {
                let valueAsNumber = Number(element.value);
                return isNaN(valueAsNumber) ? 0 : valueAsNumber;
            },
            (element, value) => {
                element.value = value.toString();
            },
        );
    }
}
