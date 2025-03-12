import { Layer } from "../../tools/layer";
import { IProgram } from "../../tools/program";
import { RequireInputs } from "../../tools/input"
import * as pulumi from "@pulumi/pulumi"
import { ContainerInput, ContainerOutput } from "./inout";
import { ScwRepository } from "../../repository/scw/ScwRepository";

export async function NewScwContainerLayer(stackName: string): Promise<Layer<ContainerInput, ContainerOutput>> {
  const p = new ScwContainerProgram()
  const l = new Layer<ContainerInput, ContainerOutput>(stackName, p)
  await l.init()

  return l
}

export class ScwContainerProgram implements IProgram {
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

    const scwRepository = new ScwRepository()
    const publiclyExposed = true

    scwRepository.newContainer(
      inputs.project,
      inputs.image,
      inputs.port,
      publiclyExposed
    )

    return pulumi.output({
      url: scwRepository.domain,
    })
  };
}
