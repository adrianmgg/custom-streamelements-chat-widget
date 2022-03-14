import * as path from 'path';
import * as rollup from 'rollup';
const rollup_ts = require('rollup-plugin-typescript2');
import { nodeResolve as rollup_noderesolve } from '@rollup/plugin-node-resolve';
const rollup_commonjs = require('@rollup/plugin-commonjs');
import * as fsPromises from 'fs/promises';
import generate_fields from './src/ts/generate_fields';
// const postcss = require('postcss');
import postcss from 'postcss';
const postcss_import = require('postcss-import');

type Target = {
	infile: string;
	outfile: string;
	generate_tasks?: (t: Target) => Promise<Target[]>,
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

const build_postcss = async (target: Target) => {
	const content = await fsPromises.readFile(target.infile);
	const result = await (
		postcss()
			.use(postcss_import())
			.process(content, {
				from: target.infile,
			})
	);
	fsPromises.writeFile(target.outfile, result.css);
	console.log(`${target.infile} -> ${target.outfile}`);
	for(const warning of result.warnings()) {
		console.warn(`\tWARNING: ${warning}`);
	}
};

const clean_deletefile = ({outfile}) => fsPromises.unlink(outfile);

const generate_theme_tasks = async (target: Target): Promise<Target[]> => (await Promise.all(
		await fsPromises.readdir(target.infile)
			.then(files=>files.flatMap( async(file): Promise<Target[]> => {
				const fullpath = path.join(target.infile, file);
				const stat = await fsPromises.stat(fullpath);
				if(stat.isDirectory) {
					return [
						{
							infile: path.join(fullpath, 'css.css'),
							outfile: `./build/${file}.css.css`,
							build: build_postcss,
							prebuild: standard_prebuild,
							clean: clean_deletefile,
						},
						{
							infile: path.join(fullpath, 'html.html'),
							outfile: `./build/${file}.html.html`,
							build: build_copyfile,
							prebuild: standard_prebuild,
							clean: clean_deletefile,
						},
					];
				} else return [];
			} ))
	)).flat();

const targets: Target[] = [
	{
		infile: './src/themes/',
		outfile: null,
		generate_tasks: generate_theme_tasks,
	},
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
	{
		infile: './src/data.json',
		outfile: './build/data.json',
		build: build_copyfile,
		prebuild: standard_prebuild,
		clean: clean_deletefile,
	},
];

const task_prereqs: Record<string, string[]> = {
	build: ['prebuild'],
};


let generators_ran = false;
const tasks_ran = [];

const run_task = async (task: string) => {
	if(!generators_ran) {
		generators_ran = true;
		for(const target of targets) {
			if('generate_tasks' in target) targets.push(...await target.generate_tasks(target));
		}
	}
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

