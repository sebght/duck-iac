import { Layer } from "../../tools/layer";
import { IProgram } from "../../tools/program";
import { RequireInputs } from "../../tools/input"
import * as pulumi from "@pulumi/pulumi"
import { ContainerInput, ContainerOutput } from "./inout";
import { GcpCloudRunRepository } from "../../repository/gcp/GcpCloudRunRepository";

export async function NewGcpContainerLayer(stackName: string): Promise<Layer<ContainerInput, ContainerOutput>> {
  const p = new GcpContainerProgram()
  const l = new Layer<ContainerInput, ContainerOutput>(stackName, p)
  await l.init()

  return l
}

export class GcpContainerProgram implements IProgram {
  constructor() { }

  public plugins() {
    return [
      {
        name: "gcp",
        version: "8.21.0",
        url: "github.com/pulumi/pulumi-gcp",
      },
    ]
  }

  public name(): string {
    return "gcp-container"
  };

  public async run(): Promise<pulumi.Output<ContainerOutput>> {
    const inputs = RequireInputs<ContainerInput>()

    const gcpCloudRunRepository = new GcpCloudRunRepository()
    const publiclyExposed = true
    gcpCloudRunRepository.newService(
      inputs.project,
      inputs.image,
      inputs.port,
      publiclyExposed
    )
    return pulumi.output({
      url: gcpCloudRunRepository.domain
    })
  };
}
