import { NatGateway } from "./NatGateway";

export type AvailabilityZone = "eu-west-3a" | "eu-west-3b" | "eu-west-3c";

export class Subnet {
    private name: string;
    private publicSubnet: boolean;
    private cidrBlock: string | undefined;
    private availabilityZone: AvailabilityZone;
    public natGateways: NatGateway[];

    /**
     * Create a Subnet object with the given unique name and CIDR block.
     *
     * @param name The _unique_ name of the object.
     * @param publicSubnet True if the subnet is public (true by default)
     * @param cidrBlock The IPv4 CIDR block for the subnet.
     */
    constructor(name: string, publicSubnet: boolean = true, cidrBlock?: string, availabilityZone: AvailabilityZone = "eu-west-3a") {
        this.name = name;
        this.publicSubnet = publicSubnet;
        this.cidrBlock = cidrBlock;
        this.availabilityZone = availabilityZone;
        this.natGateways = [];
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public isPublic(): boolean {
        return this.publicSubnet;
    }

    public getCidrBlock(): string | undefined {
        return this.cidrBlock;
    }

    public getAvailabilityZone(): string {
        return this.availabilityZone.toString();
    }

    public getNatGateways(): NatGateway[] {
        return this.natGateways;
    }

    // Setters
    public addNatGateway(natGateway: NatGateway) {
        this.natGateways.push(natGateway);
    }
}
