const path = require('path');
const rollup = require('rollup');
// const rollup_ts = require('@rollup/plugin-typescript');
const rollup_ts = require('rollup-plugin-typescript2');
const { nodeResolve: rollup_noderesolve } = require('@rollup/plugin-node-resolve');
const fs = require('fs');
const fsPromises = require('fs/promises');

function standard_prebuild({infile, outfile}) {
	return fsPromises.mkdir( path.dirname(outfile), {recursive: true} );
}

const build_copyfile = async ({infile, outfile}) => {
	await standard_prebuild({infile, outfile});
	await fsPromises.copyFile(infile, outfile);
	console.log(`${infile} -> ${outfile}`);
};

function build_rollup(input_cfg, output_cfg) {
	return async ({infile, outfile}) => {
		await standard_prebuild({infile, outfile});
		const bundle = await rollup.rollup({...input_cfg, input: infile});
		await bundle.write({...output_cfg, file: outfile});
		await bundle.close();
		console.log(`${infile} -> ${outfile}`);
	};
}

const clean_deletefile = ({outfile}) => fsPromises.unlink(outfile);

const targets = [
	{
		infile: './src/ts/main.ts',
		outfile: './build/js.js',
		build: build_rollup({
			plugins: [
				rollup_ts({
					// verbosity:3,
				}),
				rollup_noderesolve(),
			],
		}, {
			format: 'es'
		}), // not cached b/c depends on other files and i havent implemented that yet
		clean: clean_deletefile,
	},
	...(['css.css', 'html.html', 'fields.json', 'data.json'].map(f=>({
		infile: `./src/${f}`,
		outfile: `./build/${f}`,
		build: build_copyfile,
		clean: clean_deletefile,
	}))),
];

const run_task = (task) => Promise.all( targets.map( target=>target?.[task]?.(target) ) );

run_task('build');


