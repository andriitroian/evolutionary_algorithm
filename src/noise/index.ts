import { NUMBER_OF_RUNS, POPULATION_SIZES, SELECTION_OPTIONS } from '../constants';
import { run } from '../index';
import { times, shuffle } from 'lodash';
import { FConst } from './function';
import { FunctionSpec } from '../functions/interfaces';
import { createSheet } from './sheet';

const generatePopulation = ({ chromosomeLength }: FunctionSpec, N: number) => {
	const zeroGenotype = new Array(chromosomeLength).fill(0).join('');
	const oneGenotype = new Array(chromosomeLength).fill(1).join('');
	return shuffle([
		...times(N/2, () => zeroGenotype),
		...times(N/2, () => oneGenotype),
	]).map((chromosome) => ({ chromosome, health: 0 }));
};

const fn = FConst;

export const countSelectionNoise = () => {
	const runDataArgs = [];
	const { addRunResults, writeSheetData } = createSheet();
	POPULATION_SIZES.forEach((N: number) => {
		let population = generatePopulation(fn, N);
		SELECTION_OPTIONS.forEach((selection) => {
			times(NUMBER_OF_RUNS, (i) => {
				run(
					fn,
					null,
					population,
					selection,
					i
				);
			});
			runDataArgs.push([ fn, N, selection ]);
		});
		population = null;
	});
	Promise.all(runDataArgs.map(([ func, N, selection ]) => addRunResults(func, N, selection)))
		.then(() => {
			writeSheetData();
		});
};
