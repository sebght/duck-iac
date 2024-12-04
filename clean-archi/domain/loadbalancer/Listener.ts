import { Certificate } from "./Certificate";
import { LoadBalancer } from "./LoadBalancer";
import { TargetGroup } from "./TargetGroup";

type Protocol = "HTTP" | "HTTPS";
type RoutingType = "forward" | "redirect"; // "fixed-response" | "authenticate-cognito" | "authenticate-oidc";
type StatusCode = "HTTP_301" | "HTTP_302"; 

interface Redirect {
    port: string;
    protocol: Protocol;
    /** HTTP_301: permanent redirect. HTTP_302: temporary redirect. */
    statusCode: StatusCode;
}

export interface ListenerDefaultAction {
    type: RoutingType
    targetGroup?: TargetGroup; // TargetGroup de destination
    redirect?: Redirect;
}

export class Listener {
    private name: string;
    private loadBalancer: LoadBalancer;
    private port: number;
    private protocol: Protocol;
    private certificate: Certificate | undefined;
    private defaultAction: ListenerDefaultAction;

    constructor(name: string, loadBalancer: LoadBalancer, port: number, protocol: Protocol, defaultAction: ListenerDefaultAction) {
        this.name = name;
        this.loadBalancer = loadBalancer;
        this.port = port;
        this.protocol = protocol;
        this.defaultAction = defaultAction;
    }

    public getName(): string {
        return this.name;
    }

    public getLoadBalancer(): LoadBalancer {
        return this.loadBalancer;
    }

    public getPort(): number {
        return this.port;
    }

    public getProtocol(): string {
        return this.protocol;
    }

    public getCertificate(): Certificate | undefined {
        return this.certificate;
    }

    public getDefaultAction(): ListenerDefaultAction {
        return this.defaultAction;
    }

    public setDefaultAction(action: ListenerDefaultAction): void {
        this.defaultAction = action;
    }

    public addCertificate(certificate: any): void {
        this.certificate = certificate;
    }
}