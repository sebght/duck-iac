import { Eip } from "./Eip";

export class NatGateway {
    private name: string;
    private isPublic: boolean;
    private eip: Eip | undefined;
 
    constructor(name: string, isPublic: boolean = true, eip?: Eip) {
        this.name = name;
        this.isPublic = isPublic;
        if (isPublic) {
            if (eip != null) {
                this.eip = eip;
            }
            else {
                this.eip = new Eip("eip-" + this.name, true);
            }
        }
    }

    public getName(): string {
        return this.name;
    }

    public IsPublic(): boolean {
        return this.isPublic;
    }

    public getEip(): Eip | undefined {
        return this.eip;
    }
}

