import { SecurityGroup } from "../vpc/SecurityGroup";
import { Subnet } from "../vpc/subnet";


export type LoadBalancerType = "application" | "gateway" | "network";

export class LoadBalancer {
    private name: string;
    private loadBalancerType: LoadBalancerType;
    private securityGroups: SecurityGroup[];
    private subnets: Subnet[];

    constructor(name: string, loadBalancerType: LoadBalancerType = "application") {
        this.name = name;
        this.loadBalancerType = loadBalancerType;
        this.securityGroups = [];
        this.subnets = [];
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getLoadBalancerType(): string {
        return this.loadBalancerType;
    }

    public getSecurityGroups(): SecurityGroup[] {
        return this.securityGroups;
    }

    public getSubnets(): Subnet[] {
        return this.subnets;
    }

    // Setters
    public addSecurityGroup(sg: SecurityGroup): void {
        this.securityGroups.push(sg);
    }

    public addSubnet(subnet: Subnet): void {
        this.subnets.push(subnet);
    }        
}