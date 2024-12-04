import { LoadBalancer } from "../domain/loadbalancer/LoadBalancer";
import { TargetGroup } from "../domain/loadbalancer/TargetGroup";
import { Listener, ListenerDefaultAction } from "../domain/loadbalancer/Listener";
import { Vpc } from "../domain/vpc/vpc";
import { ILoadBalancerRepository } from "../repository/ILoadBalancerRepository";
import { IVpcRepository } from "../repository/IVpcRepository";
import { Certificate } from "../domain/loadbalancer/Certificate";

/**
 * Use case qui déploie la partie load-balancing de WorkAdventure (lb, target groups, listeners, etc)
 * @param loadBalancerRepository le repository à utiliser pour le deploiement
 * @param vpcRepository repository du VPC utilisé pour récupérer les resources déployés
 * @param vpc l'objet métier VPC qui contient l'infrastructure nécessaire pour heberger WorkAdventure
 */
export function DeployerLoadBalancer(loadBalancerRepository: ILoadBalancerRepository, vpcRepository: IVpcRepository, vpc: Vpc) {
    const loadBalancer = new LoadBalancer("loadbalancer-workadventure", "application");
    
    // On récupère le security group par défaut pour notre load balancer
    const securityGroup = vpc.getSecurityGroups().find(sg => sg.getName() === "default-sg");
    if (securityGroup != null) {
        loadBalancer.addSecurityGroup(securityGroup);
    }

    // On récupère les subnets publics du VPC (2 dans ce cas)
    const subnets = vpc.getSubnets().filter(subnet => subnet.isPublic())
    subnets.forEach(subnet => loadBalancer.addSubnet(subnet));

    // Conteneur bidon qu'on accede avec le port 8080
    const whoTargetGroup = new TargetGroup("who-target-group", 80, "HTTP", vpc, "ip", {enabled: true, matcher: "200-499", path: "/"});
    const whoListener = new Listener("who-listener", loadBalancer, 8080, "HTTP", {
        type: "forward",
        targetGroup: whoTargetGroup
    });

    // WorkAdventure (port HTTPS 443 et HTTP 80)
    // Target Groups
    const playTargetGroup = new TargetGroup("play-target-group", 3000, "HTTP", vpc, "ip", {enabled: true, matcher: "200-499", path: "/"});
    const chatTargetGroup = new TargetGroup("chat-target-group", 80, "HTTP", vpc, "ip", {enabled: true, matcher: "200-499", path: "/"});
    const iconTargetGroup = new TargetGroup("icon-target-group", 8080, "HTTP", vpc, "ip", {enabled: true, matcher: "200-499", path: "/"});
    const mapStorageTargetGroup = new TargetGroup("map-storage-target-group", 3000, "HTTP", vpc, "ip", {enabled: true, matcher: "200-499", path: "/"});
    const ejabberdTargetGroup = new TargetGroup("ejabberd-target-group", 5443, "HTTP", vpc, "ip", {enabled: true, matcher: "200-499", path: "/"});

    // Listeners
    const httpListener = new Listener("http-listener", loadBalancer, 80, "HTTP", {
        type: "redirect",
        redirect: {
            port: "443",
            protocol: "HTTPS",
            statusCode: "HTTP_301",
        }
    });
    const httpsListener = new Listener("https-listener", loadBalancer, 443, "HTTPS", {
        type: "forward",
        targetGroup: playTargetGroup
    });

    const certificate = new Certificate("*.workadventure.aws.ocho.ninja", "DNS");
    httpsListener.addCertificate(certificate);

    loadBalancerRepository.deploy(
        vpcRepository,
        [loadBalancer], 
        [whoTargetGroup, playTargetGroup, chatTargetGroup, iconTargetGroup, mapStorageTargetGroup, ejabberdTargetGroup],
        [whoListener, httpListener, httpsListener],
    );
}