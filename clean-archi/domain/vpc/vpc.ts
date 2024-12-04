import { Eip } from "./Eip";
import { InternetGateway } from "./InternetGateway";
import { RouteTable } from "./RouteTable";
import { SecurityGroup } from "./SecurityGroup";
import { Subnet } from "./subnet";

export class Vpc {
    private name: string;
    private cidrBlock: string | undefined;
    public subnets: Subnet[];
    private internetGateway: InternetGateway | undefined;
    private routeTables: RouteTable[];
    private eips: Eip[];
    private securityGroups: SecurityGroup[];

    constructor(name: string, cidrBlock?: string) {
        this.name = name;
        this.cidrBlock = cidrBlock;
        this.subnets = [];
        this.routeTables = [];
        this.eips = [];
        this.securityGroups = []
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getCidrBlock(): string | undefined {
        return this.cidrBlock;
    }

    public getSubnets(): Subnet[] {
        return this.subnets;
    }

    public getInternetGateway(): InternetGateway | undefined {
        return this.internetGateway;
    }

    public getRouteTables(): RouteTable[] {
        return this.routeTables;
    }

    public getEips(): Eip[] {
        return this.eips;
    }

    public getSecurityGroups(): SecurityGroup[] {
        return this.securityGroups;
    }

    // Setters
    public addSubnet(subnet: Subnet) {
        this.subnets.push(subnet);
    }

    public addInternetGateway(gateway: InternetGateway) {
        this.internetGateway = gateway;
    }

    public addRouteTable(rt: RouteTable) {
        this.routeTables.push(rt);
    }

    public addEip(eip: Eip) {
        this.eips.push(eip);
    }

    public addSecurityGroup(sg: SecurityGroup) {
        this.securityGroups.push(sg);
    }
    
}