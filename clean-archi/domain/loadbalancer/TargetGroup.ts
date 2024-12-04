import { Vpc } from "../vpc/vpc";

export type Protocol = "GENEVE" | "HTTP" | "HTTPS" | "TCP" | "TCP_UDP" | "TLS" | "UDP";
export type TargetType = "instance" | "ip" | "alb" | "lambda";
export interface TargetGroupHealthCheck {
    enabled: boolean;
    matcher?: string;
    path?: string;
}

export class TargetGroup {
    private name: string;
    private port: number;
    private protocol: Protocol;
    private vpc: Vpc;
    private targetType: TargetType;
    private healthCheck: TargetGroupHealthCheck;

    constructor(
        name: string, 
        port: number,
        protocol: Protocol,
        vpc: Vpc,
        targetType: TargetType,
        healthCheck: TargetGroupHealthCheck
    ) {
        this.name = name;
        this.port = port;
        this.protocol = protocol;
        this.vpc = vpc;
        this.targetType = targetType;
        this.healthCheck = healthCheck;
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getPort(): number {
        return this.port;
    }

    public getProtocol(): string {
        return this.protocol;
    }

    public getVpc(): Vpc {
        return this.vpc;
    }

    public getTargetType(): string {
        return this.targetType;
    }

    public getHealthCheck(): TargetGroupHealthCheck {
        return this.healthCheck;
    }

   
    

    // Setters
   
      
}
