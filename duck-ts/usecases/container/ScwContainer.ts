import { Layer } from "../../tools/layer";
import { IProgram } from "../../tools/program";
import { RequireInputs } from "../../tools/input"
import * as scw from "@pulumiverse/scaleway"
import * as pulumi from "@pulumi/pulumi"
import { ContainerInput, ContainerOutput } from "./inout";

export function NewScwContainerProgram(stackName: string): Layer<ContainerInput, ContainerOutput> {
  const p = new ScwContainer()
  const l = new Layer<ContainerInput, ContainerOutput>(stackName, p)
  l.init()

  return l
}

export class ScwContainer implements IProgram {
  constructor() { }

  public plugins() {
    return [
      {
        name: "scaleway",
        version: "1.15.0",
        url: "github://api.github.com/pulumiverse",
      },
    ]
  }

  public name(): string {
    return "scw-container"
  };

  public async run(): Promise<pulumi.Output<ContainerOutput>> {
    const inputs = RequireInputs<ContainerInput>()

    const main = new scw.ContainerNamespace("main", {
      name: "duck",
    });

    const container = new scw.Container("duck", {
      name: inputs.project,
      description: inputs.project,
      namespaceId: main.id,
      registryImage: inputs.image,
      port: inputs.port,
      cpuLimit: 140,
      memoryLimit: 256,
      minScale: 3,
      maxScale: 5,
      timeout: 600,
      maxConcurrency: 80,
      privacy: "public",
      protocol: "http1",
      deploy: true,
    });

    return pulumi.output({
      url: container.domainName
    })

  };
}
