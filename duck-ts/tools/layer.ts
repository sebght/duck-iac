import { LocalWorkspace, PulumiFn, Stack } from "@pulumi/pulumi/automation";
import process = require('process');
import { IProgram } from "./program";


export type StackDependency = {
  name: string
  version: string
  url?: string
}

type StackConfig = {
  stackName: string
  projectName: string
  plugins: StackDependency[]
}

interface ILayer<I, O> {
  init(): void
  installPlugins(): void

  up(): void
  down(): void
  refresh(): void
  preview(): void

  setInputs(input: I): Promise<void>
  getOuputs(): Promise<O>
}

function customOutput() {
  return (output: any) => {
    process.stdout.write(output)
  };
}

export class Layer<I, O> implements ILayer<I, O> {
  private stackConfig: StackConfig;
  private program: PulumiFn;
  private stack: Stack;

  constructor(stackName: string, program: IProgram) {
    this.stackConfig = {
      stackName,
      projectName: program.name(),
      plugins: program.plugins()
    }
    this.program = program.run
  }

  async init() {
    this.stack = await LocalWorkspace.createOrSelectStack({
      stackName: this.stackConfig.stackName,
      projectName: this.stackConfig.projectName,
      program: this.program
    });
  }

  async installPlugins() {
    console.info("installing plugins...");
    for (const plugin of this.stackConfig.plugins) {
      await this.stack.workspace.installPluginFromServer(plugin.name, plugin.version, plugin.url);
    }
  }

  async up() {
    console.info("updating stack...");
    return await this.stack.up({ onOutput: customOutput(), color: "always" });
  }

  async down() {
    console.info("destroying stack...");
    await this.stack.destroy({ onOutput: customOutput(), color: "always" });
    console.info("stack destroy complete");
  }

  async refresh() {
    console.info("refreshing stack...");
    await this.stack.refresh({ onOutput: customOutput(), color: "always" });
    console.info("refresh complete");
  }

  async preview() {
    await this.stack.preview({ onOutput: customOutput(), color: "always" })
  }

  async setInputs(inputs: I): Promise<void> {
    const v = JSON.stringify(inputs)
    await this.stack.setConfig("inputs", { value: v })
  }

  async getOuputs(): Promise<O> {
    const plmOut = await this.stack.outputs()

    console.log(plmOut)

    let o: { [key: string]: any } = {}

    Object.entries(plmOut).map((v) => {
      o[v[0]] = v[1].value
    })
    return o as O
  }
}
