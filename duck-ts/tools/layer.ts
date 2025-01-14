import {LocalWorkspace, PulumiFn, Stack} from "@pulumi/pulumi/automation";

const process = require('process');
export interface IProgram {
    name: () => string
    plugins: StackDependency[]
    run: PulumiFn
}

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

type Config = {
	key: string
	value: string
}

interface ILayer {
	init: () => void
	installPlugins: () => void
	up: () => void
	down: () => void
	refresh: () => void
	preview: () => void
}

function customOutput() {
	return (output) => {
		process.stdout.write(output)
	};
}

export class Layer implements ILayer {
	private stackConfig: StackConfig;
	private program: PulumiFn;
	private stack: Stack;
	constructor(stackName: string, program: IProgram) {
		this.stackConfig = {
			stackName,
			projectName: program.name(),
			plugins: program.plugins
		}
		this.program = program.run
	}
    async init () {
		this.stack= await LocalWorkspace.createOrSelectStack({
			stackName: this.stackConfig.stackName,
			projectName: this.stackConfig.projectName,
			program: this.program
		});
	}
    async installPlugins () {
		console.info("installing plugins...");
		for (const plugin of this.stackConfig.plugins) {
			await this.stack.workspace.installPlugin(plugin.name, plugin.version);
		}
	}

	async setConfig (configs: Config[]) {
		console.info("setting up config");
		for (const config of configs) {
			await this.stack.setConfig(config.key, { value: config.value });
		}
	}

    async up () {
		console.info("updating stack...");
		return await this.stack.up({ onOutput: customOutput(), color: "always" });
	}

    async down () {
		console.info("destroying stack...");
		await this.stack.destroy({ onOutput: customOutput(), color: "always" });
		console.info("stack destroy complete");
	}

    async refresh () {
		console.info("refreshing stack...");
		await this.stack.refresh({ onOutput: customOutput(), color: "always" });
		console.info("refresh complete");
	}

    async preview () {
		await this.stack.preview({ onOutput: customOutput(), color: "always" })
	}
}
