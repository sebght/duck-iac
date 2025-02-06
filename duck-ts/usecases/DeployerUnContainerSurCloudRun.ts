import {IProgram, StackDependency} from "../tools/layer";

export class ContainerSurCloudRun implements IProgram {
    public plugins: StackDependency[];
    constructor(plugins: StackDependency[]) {
        this.plugins = plugins
    }
    public name(): string {
        return "paas-gcp"
    };
    public async run() {
        const cloudRunRepo = new GcpCloudRunRepository()
        const monImageDocker = "registry.gitlab.com/duck/example-appli"
        const monTag = "latest"
        cloudRunRepo.creerUnService("name")
        cloudRunRepo.deploie(monImageDocker, monTag)
        const url = cloudRunRepo.exposeSurInternet()
        return {
            websiteUrl: url,
        };
    }
}