import { Layer } from "../../tools/layer"
import { NewScwDatabaseLayer } from "./ADatabaseOnScw"
import { DatabaseInput, DatabaseOutput } from "./inout"

export type DatabaseLayerFactoryFuncType = (project: string, env: string) => Promise<Layer<DatabaseInput, DatabaseOutput>>

export function DatabaseFactory(cloud: string): DatabaseLayerFactoryFuncType {
  return async (project: string, env: string) => {
    const stackName = `${project}-${env}`
    switch (cloud) {
      case "scw":
        return NewScwDatabaseLayer(stackName)
    }
  }
}
