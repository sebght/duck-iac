import { InternetGateway } from "./InternetGateway";
import { NatGateway } from "./NatGateway";
import { Subnet } from "./subnet";

export enum TargetType {
    NatGateway,
    InternetGateway
    // et plus...
}

export type Target = {
    targetNatGateway?: NatGateway;
    targetInternetGateway?: InternetGateway;
}

export type Route = {
    destinationCidr: string;
    targetType: TargetType;
    target: Target;
}

export type Association = {
    target: Subnet;
}

export class RouteTable {
    private name: string;
    private routes: Route[];
    private associations: Association[];

    constructor(name: string) {
        this.name = name,
        this.routes = [];
        this.associations = [];
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getRoutes(): Route[] {
        return this.routes;
    }

    public getAssociations(): Association[] {
        return this.associations;
    }

    // Setters
    public addRoute(route: Route): void {
        this.routes.push(route);
    }

    public addAssociation(association: Association): void {
        this.associations.push(association);

    }
}