
import * as pulumi from "@pulumi/pulumi"

import { Layer } from "../../tools/layer";
import { IProgram } from "../../tools/program";
import { RequireInputs } from "../../tools/input"

import { DatabaseInput, DatabaseOutput } from "./inout";
import { ScwDatabaseRepository, ScwDatabaseSize } from "../../repository/scw/ScwDatabaseRepository";

export async function NewScwDatabaseLayer(stackName: string): Promise<Layer<DatabaseInput, DatabaseOutput>> {
  const p = new ScwDatabaseProgram()
  const l = new Layer<DatabaseInput, DatabaseOutput>(stackName, p)
  await l.init()

  return l
}

export class ScwDatabaseProgram implements IProgram {
  constructor() { }

  public plugins() {
    return [
      {
        name: "scaleway",
        version: "1.15.0",
        url: "github://api.github.com/pulumiverse",
      },
      {
        name: "random",
        version: "4.18.0",
        url: "github.com/pulumi/pulumi-random",
      }
    ]
  }

  public name(): string {
    return "scw-db"
  };

  public async run() {
    const inputs = RequireInputs<DatabaseInput>()

    const scwDatabaseRepository = new ScwDatabaseRepository()
    scwDatabaseRepository.newDatabase(inputs.name, ScwDatabaseSize.DB_DEV_S)

    const dbString = scwDatabaseRepository.publicConnectionString

    return { dbString }
  };
}
