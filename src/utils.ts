import { Individual, Population } from './interfaces';
import path from 'path';
import fs from 'fs';
import { sumBy } from 'lodash';
import { FunctionSpec } from './functions/interfaces';

export const getAvgHealth = (population: Population) => sumBy(population, 'health') / population.length;

export const calculateHealth = ({ fn, decode }: FunctionSpec) => (chromosome: string): Individual => ({
	chromosome,
	health: fn(decode(chromosome))
});

export const buildPath = (fnSpec: FunctionSpec, N: number, selection: string, run?: number): string => path.resolve(
	path.dirname(require.main.filename),
	`results`,
	fnSpec.name,
	`N${N}`,
	selection,
	typeof run !== 'undefined' ? `run_${run}` : ''
);

export const saveFile = (dirPath: string, filename: string, data) => {
	fs.mkdirSync(dirPath, {recursive: true});
	fs.writeFileSync(path.resolve(dirPath, filename), data);
};

export const clearResults = () => {
	fs.rmSync(path.resolve(path.dirname(require.main.filename), 'results'), { recursive: true, force: true });
}
