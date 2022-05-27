import { times } from 'lodash';
import { run } from './src';
import { clearResults } from './src/utils';
import { createSheet } from './src/sheet';
import { FUNCTIONS, NUMBER_OF_RUNS, POPULATION_SIZES, SELECTION_OPTIONS } from './src/constants';
import { generatePopulation } from './src/generatePopulation';
import { FunctionSpec } from './src/functions/interfaces';
import { getMutation } from './src/mutation';
import { countSelectionNoise } from './src/noise';

clearResults();
const runDataArgs = [];
const { addRunResults, writeSheetData } = createSheet();
POPULATION_SIZES.forEach((N: number) => {
	SELECTION_OPTIONS.forEach((selection) => {
		FUNCTIONS.forEach((func: FunctionSpec) => {
			console.log(`${func.name} | ${N} | ${selection.name}`)
			const { population, last, optimal } = generatePopulation(func, N);
			const mutation = getMutation(func, selection.type, N);
			times(NUMBER_OF_RUNS, (i) => {
				const _population = [...population];
				if (!!mutation) {
					_population.push(i < 5 ? optimal : last);
				} else {
					_population.push(optimal);
				}
				run(
					func,
					mutation,
					_population,
					selection,
					i
				);
			});
			runDataArgs.push([ func, N, selection ]);
		});
	});
});
Promise.all(runDataArgs.map(([ func, N, selection ]) => addRunResults(func, N, selection)))
	.then(() => {
		writeSheetData();
	});
countSelectionNoise();
