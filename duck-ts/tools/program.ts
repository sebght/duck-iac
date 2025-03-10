import { PulumiFn } from "@pulumi/pulumi/automation";
import { StackDependency } from "./layer";

export interface IProgram {
  name: () => string
  plugins: () => StackDependency[]
  run: PulumiFn
}
