export type Rule = {
    cidrBlocks: string[];
    protocol: string;
    fromPort: number;
    toPort: number;
}

export class SecurityGroup {
    private name: string;
    private description: string;
    private inboundRules: Rule[];
    private outboundRules: Rule[];

    constructor(name: string, description: string = "", inboundRules: Rule[] = [], outboundRules: Rule[] = []) {
        this.name = name;
        this.description = description;
        this.inboundRules = inboundRules;
        this.outboundRules = outboundRules;
    }

    // Getters 
    public getName(): string {
        return this.name;
    }

    public getInboundRules(): Rule[] {
        return this.inboundRules;
    }

    public getOutboundRules(): Rule[] {
        return this.outboundRules;
    }

    // Setters
    public addInboundRule(rule: Rule): void {
        this.inboundRules.push(rule)
    }

    public addOutboundRule(rule: Rule): void {
        this.outboundRules.push(rule)
    }
}