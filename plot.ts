import { maxBy } from 'lodash';
import { plot } from './src/plot/plot';
import { buildPath, getAvgHealth } from './src/utils';
import { countSigma, readData } from './src/sheet/utils';
import { FUNCTIONS, POPULATION_SIZES, SELECTION_OPTIONS } from './src/constants';
import { FunctionSpec } from './src/functions/interfaces';
import { IterationStats } from './src/interfaces';

POPULATION_SIZES.forEach((N: number) => {
	SELECTION_OPTIONS.forEach((selection) => {
		FUNCTIONS.forEach(async(func: FunctionSpec) => {
			const path = buildPath(func, N, `${selection.type}_${selection.param}`)
			const stats = await readData(path);
			stats.forEach((runStats: IterationStats[], run: number) => {
				plot({
					title: 'Avg health',
					data: [runStats.map(({ population }) => getAvgHealth(population))],
					path: `${path}/run_${run}`
				});

				plot({
					title: 'Difference & Intensity',
					data: [
						runStats.map(({ selection_difference }) => selection_difference),
						runStats.map(({ intensity }) => intensity)
					],
					path: `${path}/run_${run}`
				});

				plot({
					title: 'Sigma_Health',
					data: [
						runStats.map(({ population }) => countSigma(population.map(({health}) => health))),
					],
					path: `${path}/run_${run}`
				});

				plot({
					title: '% of the best individual',
					data: [runStats.map(({ population }) => {
						const bestIndividual = maxBy(population, 'health')?.chromosome;
						const copiesOfBestIndividual = population.filter(({chromosome}) => chromosome === bestIndividual);
						return copiesOfBestIndividual.length/population.length;
					})],
					path: `${path}/run_${run}`
				});

				plot({
					title: 'Growth rate',
					data: [runStats.map(({ growth_rate }) => growth_rate)],
					path: `${path}/run_${run}`
				});

				plot({
					title: 'Reproduction rate & Loss of diversity',
					data: [
						runStats.map(({ reproduction_rate }) => reproduction_rate),
						runStats.map(({ loss_of_diversity }) => loss_of_diversity)
					],
					path: `${path}/run_${run}`
				});
			});
		});
	});
});
