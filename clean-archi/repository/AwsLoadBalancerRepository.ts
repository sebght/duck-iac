import * as aws from "@pulumi/aws";
import * as variables from "../variables";
import { LoadBalancer } from "../domain/loadbalancer/LoadBalancer";
import { TargetGroup } from "../domain/loadbalancer/TargetGroup";
import { Listener } from "../domain/loadbalancer/Listener";
import { ILoadBalancerRepository } from "./ILoadBalancerRepository";
import { AwsVpcRepository } from "./AwsVpcRepository";
import { Certificate } from "../domain/loadbalancer/Certificate";

export class AwsLoadBalancerRepository implements ILoadBalancerRepository{    
    private lbResourceMap: Map<string, any>;
    constructor() { this.lbResourceMap = new Map<string, any>(); }

    private AddResource(resourceName: string, resourceType: any): void {
        this.lbResourceMap.set(resourceName, resourceType);
    }

    public GetDeployedResource(resourceName: string): any {
        // gerer les exceptions, par exemple, s'il n'existe pas une resource avec ce nom (resourceMap.has())
        return this.lbResourceMap.get(resourceName);
    }

    private CreateLoadBalancer(lb: LoadBalancer, vpcRepository: AwsVpcRepository): void {
        let securityGroupIds: string[] = [];
        let subnetIds: string[] = [];
        
        // 1. On obtient les IDs des Security Groups liés au Load Balancer
        lb.getSecurityGroups().forEach(sg => {
            let deployedSG = vpcRepository.GetDeployedResource(sg.getName());
            securityGroupIds.push(deployedSG.id);
        });

        // 2. On obtient les IDs des subnets liés au Load Balancer
        lb.getSubnets().forEach(subnet => {
            let deployedSubnet = vpcRepository.GetDeployedResource(subnet.getName());
            subnetIds.push(deployedSubnet.id);
        })

        // 3. Si on recupere bien ces resources, on deploie le load balancer
        if (securityGroupIds != null && subnetIds != null) {
            let loadBalancerDeployed = new aws.lb.LoadBalancer(lb.getName(), {
                name: lb.getName(),
                idleTimeout: 4000,
                loadBalancerType: lb.getLoadBalancerType(),
                securityGroups: securityGroupIds,
                subnets: subnetIds,
                tags: variables.GetTagWithResourceName(lb.getName())
            });
            this.AddResource(lb.getName(), loadBalancerDeployed);
        }
    }

    private CreateDNS(lb: LoadBalancer) {
        const workadventureDNSZone = aws.route53.getZone({
            name: "aws.ocho.ninja",
            privateZone: false,
        });

        const workAdventureUrl = "workadventure.aws.ocho.ninja";
        const lbDeployed = this.GetDeployedResource(lb.getName());
        const rootUrl = new aws.route53.Record(workAdventureUrl, {
            zoneId: workadventureDNSZone.then(workadventureDNSZone => workadventureDNSZone.zoneId),
            name: workAdventureUrl,
            type: "A",
            aliases: [{
                name: lbDeployed.dnsName,
                zoneId: lbDeployed.zoneId,
                evaluateTargetHealth: false
            }]
        })
        
        const urlPrefixes = [
            "play",
            "chat",
            "map-storage",
            "api",
            "maps",
            "icon",
            "uploader",
            "ejabberd"
        ]

        urlPrefixes.forEach(urlPrefix => {
            const subDomain = urlPrefix + "." + workAdventureUrl
            new aws.route53.Record(subDomain, {
                zoneId: workadventureDNSZone.then(workadventureDNSZone => workadventureDNSZone.zoneId),
                name: subDomain,
                type: "A",
                aliases: [{
                    name: lbDeployed.dnsName,
                    zoneId: lbDeployed.zoneId,
                    evaluateTargetHealth: true
                }]
            })
        });
    }

    private CreateTargetGroup(targetGroup: TargetGroup, vpcRepository: AwsVpcRepository): void {
        let deployedVpc = vpcRepository.GetDeployedResource(targetGroup.getVpc().getName());
        let targetGroupTraefik = new aws.lb.TargetGroup(targetGroup.getName(), {
            name: targetGroup.getName(),
            port: targetGroup.getPort(),
            protocol: targetGroup.getProtocol(),
            //protocolVersion: "HTTP2",
            vpcId: deployedVpc.id,
            targetType: targetGroup.getTargetType(),
            healthCheck: targetGroup.getHealthCheck(),
            tags: variables.GetTagWithResourceName(targetGroup.getName())
        });
        this.AddResource(targetGroup.getName(), targetGroupTraefik);
    }

    private CreateCertificate(cert: Certificate, zone53Name: string, privateZone: boolean) {
        const zone53 = aws.route53.getZone({
            name: zone53Name,
            privateZone: privateZone,
        });

        const deployedCertificate = new aws.acm.Certificate("certificate - " + cert.getDomainName(), {
            domainName: cert.getDomainName(),
            validationMethod: cert.getValidationMethod(),
            tags: variables.GetTagWithResourceName("certificate - Workadventure")
        });
        
        const certValidation = new aws.route53.Record("record - " + cert.getDomainName(), {
            name: deployedCertificate.domainValidationOptions[0].resourceRecordName,
            records: [deployedCertificate.domainValidationOptions[0].resourceRecordValue],
            ttl: 60,
            type: deployedCertificate.domainValidationOptions[0].resourceRecordType,
            zoneId: zone53.then(x => x.zoneId),
        });
        
        const certificateValidation = new aws.acm.CertificateValidation("certValidation - " + cert.getDomainName(), {
            certificateArn: deployedCertificate.arn,
            validationRecordFqdns: [certValidation.fqdn],
        });

        return certificateValidation;
    }

    private CreateListenerHttps(listener: Listener, certValidation: any): void {
        let deployedLoadBalancer = this.GetDeployedResource(listener.getLoadBalancer().getName());
        let deployedTargetGroup = this.GetDeployedResource(listener.getDefaultAction().targetGroup!.getName());

        let deployedListener = new aws.lb.Listener(listener.getName(), {
            loadBalancerArn: deployedLoadBalancer.arn,
            port: listener.getPort(),
            protocol: listener.getProtocol(),
            sslPolicy: "ELBSecurityPolicy-2016-08",
            certificateArn: certValidation.certificateArn,
            defaultActions: [{
                type: listener.getDefaultAction().type,
                targetGroupArn: deployedTargetGroup.arn
            }],
            tags: variables.GetTagWithResourceName(listener.getName())
        }, {
            dependsOn: certValidation,
        });
        this.AddResource(listener.getName(), deployedListener);

        // Fonction qui genere les ListenerRules à partir d'un array.
        const listenerRules: string[] = ["chat", "icon", "map-storage", "ejabberd"];
        for (let rule of listenerRules) {
            const deployedTargetGroup = this.GetDeployedResource(rule + "-target-group");
            const listenerRule = new aws.lb.ListenerRule(rule + "ListenerRule", {
                listenerArn: deployedListener.arn,
                actions: [{
                    type: "forward",
                    targetGroupArn: deployedTargetGroup.arn,
                }],
                conditions: [{
                    hostHeader: {
                        values: [rule + ".workadventure.aws.ocho.ninja"]
                    }
                }],
            });
        }
    }

    private CreateListenerForward(listener: Listener): void {
        let deployedLoadBalancer = this.GetDeployedResource(listener.getLoadBalancer().getName());
        let deployedTargetGroup = this.GetDeployedResource(listener.getDefaultAction().targetGroup!.getName());

        let deployedListener = new aws.lb.Listener(listener.getName(), {
            loadBalancerArn: deployedLoadBalancer.arn,
            port: listener.getPort(),
            protocol: listener.getProtocol(),
            defaultActions: [{
                type: listener.getDefaultAction().type,
                targetGroupArn: deployedTargetGroup.arn
            }],
            tags: variables.GetTagWithResourceName(listener.getName())
        });
        this.AddResource(listener.getName(), deployedListener);
    }

    private CreateListenerRedirect(listener: Listener): void {
        let deployedLoadBalancer = this.GetDeployedResource(listener.getLoadBalancer().getName());
        
        let deployedListener = new aws.lb.Listener(listener.getName(), {
            loadBalancerArn: deployedLoadBalancer.arn,
            port: listener.getPort(),
            protocol: listener.getProtocol(),
            defaultActions: [{
                type: listener.getDefaultAction().type,
                redirect: listener.getDefaultAction().redirect
            }],
            tags: variables.GetTagWithResourceName(listener.getName())
        });
        this.AddResource(listener.getName(), deployedListener);
    }

    public deploy(vpcRepository: AwsVpcRepository, loadBalancers: LoadBalancer[], targetGroups: TargetGroup[], listeners: Listener[]): void { 
        loadBalancers.forEach(lb => {
            this.CreateLoadBalancer(lb, vpcRepository);
            // ATTENTION ! à modifier, on ne veut pas de records DNS pour tous les LB à deployer
            this.CreateDNS(lb);
        }); 
        targetGroups.forEach(targetGroup => this.CreateTargetGroup(targetGroup, vpcRepository));
        listeners.forEach(listener => {
            if(listener.getCertificate() != null) {
                let certificateValidation = this.CreateCertificate(listener.getCertificate()!, "aws.ocho.ninja", false);
                this.CreateListenerHttps(listener, certificateValidation);
            }
            else {
                switch(listener.getDefaultAction().type) {
                    case "forward":
                        this.CreateListenerForward(listener);
                        break;
                    case "redirect":
                        this.CreateListenerRedirect(listener);
                        break;
                }
            }
        });
    }
}
 