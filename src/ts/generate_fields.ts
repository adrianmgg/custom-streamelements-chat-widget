import { fields } from './fields';
import * as fsPromises from 'fs/promises';

export default async function generate_fields({outfile}: {outfile: string}) {
	await fsPromises.writeFile(outfile, JSON.stringify(fields, undefined, '    '));
	console.log(`generated ${outfile}`);
}


