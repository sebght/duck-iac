import { Layer } from "../../tools/layer"
import { NewAwsContainerLayer } from "./AContainerOnAwsFargate"
import { NewGcpContainerLayer } from "./AContainerOnGcpCloudRun"
import { NewScwContainerLayer } from "./AContainerOnScw"
import { ContainerInput, ContainerOutput } from "./inout"

export type ContainerLayerFactoryFuncType = (project: string, env: string) => Promise<Layer<ContainerInput, ContainerOutput>>

export function ContainerFactory(cloud: string): ContainerLayerFactoryFuncType {
  return async (project: string, env: string) => {
    const stackName = `${project}-${env}`
    switch (cloud) {
      case "scw":
        return NewScwContainerLayer(stackName)
      case "aws":
        return NewAwsContainerLayer(stackName)
      case "gcp":
        return NewGcpContainerLayer(stackName)
    }
  }
}
