import * as path from 'path';
import * as rollup from 'rollup';
const rollup_ts = require('rollup-plugin-typescript2');
import { nodeResolve as rollup_noderesolve } from '@rollup/plugin-node-resolve';
const rollup_commonjs = require('@rollup/plugin-commonjs');
import * as fsPromises from 'fs/promises';
import generate_fields from './src/ts/generate_fields';

type Target = {
	infile: string;
	outfile: string;
} & {
	[taskname: string]: ((t: Target) => Promise<unknown>) | string | undefined;
};

function standard_prebuild(target: Target) {
	return fsPromises.mkdir( path.dirname(target.outfile), {recursive: true} );
}

const build_copyfile = async (target: Target) => {
	await fsPromises.copyFile(target.infile, target.outfile);
	console.log(`${target.infile} -> ${target.outfile}`);
};

function build_rollup(input_cfg: rollup.RollupOptions, output_cfg: rollup.OutputOptions) {
	return async (target: Target) => {
		const bundle = await rollup.rollup({...input_cfg, input: target.infile});
		await bundle.write({...output_cfg, file: target.outfile});
		await bundle.close();
		console.log(`${target.infile} -> ${target.outfile}`);
	};
}

const clean_deletefile = ({outfile}) => fsPromises.unlink(outfile);

const targets: Target[] = [
	{
		infile: './src/ts/main.ts',
		outfile: './build/js.js',
		build: build_rollup({
			plugins: [
				rollup_ts({
					// verbosity:3,
				}),
				rollup_noderesolve(),
				rollup_commonjs(),
			],
		}, {
			format: 'es'
		}),
		prebuild: standard_prebuild,
		clean: clean_deletefile,
	},
	{
		infile: null,
		outfile: './build/fields.json',
		build: generate_fields,
		prebuild: standard_prebuild,
		clean: clean_deletefile,
	},
	...(['css.css', 'html.html', 'data.json'].map(f=>({
		infile: `./src/${f}`,
		outfile: `./build/${f}`,
		build: build_copyfile,
		prebuild: standard_prebuild,
		clean: clean_deletefile,
	}))),
];

const task_prereqs: Record<string, string[]> = {
	build: ['prebuild'],
};


const tasks_ran = [];

const run_task = async (task: string) => {
	for(const prereq of task_prereqs[task] ?? []) {
		if(!(prereq in tasks_ran)) {
			await run_task(prereq);
			tasks_ran.push(prereq);
		}
	}
	console.log(`task '${task}'`);
	await Promise.all( targets.map( target=>{
		const f = target?.[task];
		if(f !== undefined && typeof f === 'function') return f(target);
	}) );
};

run_task('build');

