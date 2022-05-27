import { IterationStats, Population } from '../interfaces';
import fs from 'fs';
import { times, maxBy, minBy, find, countBy, last, sum, flatten, sumBy, min, max } from 'lodash';
import { EACH_RUN_STATS_COLUMNS, EARLY_GR_ITERATION_NUMBER } from './constants';
import { getAvgHealth } from '../utils';
import { NUMBER_OF_RUNS } from '../constants';
import { FunctionSpec } from '../functions/interfaces';
const ndjson = require('ndjson');

const readRunData = async(path: string, run: number) => {
	const runStats = [];
	return new Promise((res) => {
		fs.createReadStream(`${path}/run_${run}/stats.ndjson`, { autoClose: true })
			.pipe(ndjson.parse())
			.on('data', (obj) => { runStats.push(obj); })
			.on('end', () => { res(runStats); });
	});
};

export const readData = async(resultsPath: string): Promise<IterationStats[][]> => Promise.all(times(NUMBER_OF_RUNS, (i) => readRunData(resultsPath, i)));

export const getColumns = () => times(NUMBER_OF_RUNS, (i) => EACH_RUN_STATS_COLUMNS.map((item) => ({...item, key: `${item.key}-${i}`, header: `Run ${i + 1}`}))).flat();

export const getRowTitles = () => Object.assign({}, ...times(NUMBER_OF_RUNS, (i) => ({
	[`ni-${i}`]: 'NI',
	[`f_found-${i}`]: 'F_found',
	[`f_avg-${i}`]: 'F_avg',
	[`i_min-${i}`]: 'I_min',
	[`ni_i_min-${i}`]: 'NI_I_min',
	[`i_max-${i}`]: 'I_max',
	[`ni_i_max-${i}`]: 'NI_I_max',
	[`i_avg-${i}`]: 'I_avg',
	[`gr_early-${i}`]: 'GR_early',
	[`gr_avg-${i}`]: 'GR_avg',
	[`gr_late-${i}`]: 'GR_late',
	[`ni_gr_late-${i}`]: 'NI_GR_late',
	[`rr_min-${i}`]: 'RR_min',
	[`ni_rr_min-${i}`]: 'NI_RR_min',
	[`rr_max-${i}`]: 'RR_max',
	[`ni_rr_max-${i}`]: 'NI_RR_max',
	[`rr_avg-${i}`]: 'RR_avg',
	[`teta_min-${i}`]: 'Teta_min',
	[`ni_teta_min-${i}`]: 'NI_Teta_min',
	[`teta_max-${i}`]: 'Teta_max',
	[`ni_teta_max-${i}`]: 'NI_Teta_max',
	[`teta_avg-${i}`]: 'Teta_avg',
	[`s_min-${i}`]: 's_min',
	[`ni_s_min-${i}`]: 'NI_s_min',
	[`s_max-${i}`]: 's_max',
	[`ni_s_max-${i}`]: 'NI_s_max',
	[`s_avg-${i}`]: 's_avg',
})));

const countAvgValue = (values: number[]) => (1/values.length) * sum(values);

export const countSigma = (values: number[]) => {
	const avg_x = countAvgValue(values);
	return Math.sqrt((1/(values.length - 1)) * sum(values.map(x => Math.pow(x - avg_x, 2))));
}

const getAvg = (data: IterationStats[], key: string) => data.reduce((acc, iterationData) => acc + iterationData[key], 0) / data.length;

const getLateGR = (data, optimal) => find(data, ({population}) => {
	const grouped = countBy(population, ({chromosome}) => chromosome);
	return grouped[optimal] ? grouped[optimal] >= population.length / 2 : {};
});

const populationConvergedToOptimal = (population: Population, optimal: string) => (
	population.every(({ chromosome }) => chromosome === optimal)
);

const populationContainsAcceptableIndividual = (population: Population, { optimal, decode, fn }) => {
	const beta = 0.01, gamma = 0.01;
	return population.some(({chromosome}) => {
		const healthInBounds = Math.abs(fn(decode(chromosome)) - fn(decode(optimal))) <= beta;
		const distanceInBounds = Math.abs(decode(chromosome) - decode(optimal)) <= gamma;
		return healthInBounds && distanceInBounds;
	});
};

export const getSingleRunRowDataFactory = (stats: IterationStats[][], {optimal}: FunctionSpec) => (run: number) => {
	const data = stats[run];
	return {
		[`ni-${run}`]: data.length,
		[`f_found-${run}`]: maxBy(data[data.length - 1].population, 'health').health,
		[`f_avg-${run}`]: getAvgHealth(data[data.length - 1].population),
		[`i_min-${run}`]: minBy(data, 'intensity').intensity,
		[`ni_i_min-${run}`]: minBy(data, 'intensity').iteration,
		[`i_max-${run}`]: maxBy(data, 'intensity').intensity,
		[`ni_i_max-${run}`]: maxBy(data, 'intensity').iteration,
		[`i_avg-${run}`]: getAvg(data, 'intensity'),
		[`gr_early-${run}`]: data[EARLY_GR_ITERATION_NUMBER].growth_rate,
		[`gr_avg-${run}`]: getAvg(data, 'growth_rate'),
		[`gr_late-${run}`]: getLateGR(data, optimal).growth_rate,
		[`ni_gr_late-${run}`]: getLateGR(data, optimal).iteration,
		[`rr_min-${run}`]: minBy(data, 'reproduction_rate').reproduction_rate,
		[`ni_rr_min-${run}`]: minBy(data, 'reproduction_rate').iteration,
		[`rr_max-${run}`]: maxBy(data, 'reproduction_rate').reproduction_rate,
		[`ni_rr_max-${run}`]: maxBy(data, 'reproduction_rate').iteration,
		[`rr_avg-${run}`]: getAvg(data, 'reproduction_rate'),
		[`teta_min-${run}`]: minBy(data, 'loss_of_diversity').loss_of_diversity,
		[`ni_teta_min-${run}`]: minBy(data, 'loss_of_diversity').iteration,
		[`teta_max-${run}`]: maxBy(data, 'loss_of_diversity').loss_of_diversity,
		[`ni_teta_max-${run}`]: maxBy(data, 'loss_of_diversity').iteration,
		[`teta_avg-${run}`]: getAvg(data, 'loss_of_diversity'),
		[`s_min-${run}`]: minBy(data, 'selection_difference').selection_difference,
		[`ni_s_min-${run}`]: minBy(data, 'selection_difference').iteration,
		[`s_max-${run}`]: maxBy(data, 'selection_difference').selection_difference,
		[`ni_s_max-${run}`]: maxBy(data, 'selection_difference').iteration,
		[`s_avg-${run}`]: getAvg(data, 'selection_difference'),
	};
};

export const getGroupedDataRow = (rawStats: IterationStats[][], fnSpec: FunctionSpec) => {
	const { optimal, chromosomeLength } = fnSpec;
	const stats = chromosomeLength === 100 ?
		rawStats.filter((run) => populationConvergedToOptimal(last(run).population, optimal)) :
		rawStats.filter((run) => populationContainsAcceptableIndividual(last(run).population, fnSpec));

	if (!stats.length) {
		return { suc: 0 };
	}

	const flatStats = flatten(stats);

	const getMinMin = (key) => minBy(flatStats, key)[key];
	const getNiMin = (key) => minBy(flatStats, key).iteration;
	const getMaxMax = (key) => maxBy(flatStats, key)[key];
	const getNiMax = (key) => maxBy(flatStats, key).iteration;
	const getAvgMin = (key: string) => getAvg(stats.map((data) => minBy(data, key)), key);
	const getAvgMax = (key: string) => getAvg(stats.map((data) => maxBy(data, key)), key);
	const getSigmaMax = (key: string) => countSigma(stats.map(r => maxBy(r, key)[key]));
	const getSigmaMin = (key: string) => countSigma(stats.map(r => minBy(r, key)[key]));
	const getSigmaAvg = (key: string) => countSigma(stats.map(r => getAvg(r, key)));

	return {
		suc: stats.length,
		min: minBy(stats, 'length').length,
		max: maxBy(stats, 'length').length,
		avg: sumBy(stats, 'length')/stats.length,

		sigma_ni: countSigma(stats.map(r => r.length)),
		min_i_min: getMinMin('intensity'),
		ni_i_min: getNiMin('intensity'),
		max_i_max: getMaxMax('intensity'),
		ni_i_max: getNiMax('intensity'),
		avg_i_min: getAvgMin('intensity'),
		avg_i_max: getAvgMax('intensity'),
		avg_i_avg: getAvg(flatStats, 'intensity'),
		sigma_i_max: getSigmaMax('intensity'),
		sigma_i_min: getSigmaMin('intensity'),
		sigma_i_avg: getSigmaAvg('intensity'),
		avggr_early: sum(stats.map((data) => data[EARLY_GR_ITERATION_NUMBER].growth_rate))/stats.length,
		mingr_early: min(stats.map((data) => data[EARLY_GR_ITERATION_NUMBER].growth_rate)),
		maxgr_early: max(stats.map((data) => data[EARLY_GR_ITERATION_NUMBER].growth_rate)),
		avggr_late: getAvg(stats.map((data) => getLateGR(data, optimal)), 'growth_rate'),
		mingr_late: minBy(stats.map((data) => getLateGR(data, optimal), 'growth_rate')).growth_rate,
		maxgr_late: maxBy(stats.map((data) => getLateGR(data, optimal), 'growth_rate')).growth_rate,
		avggr_avg: getAvg(flatStats, 'growth_rate'),
		mingr_avg: min(stats.map((data) => getAvg(data, 'growth_rate'))),
		maxgr_avg: max(stats.map((data) => getAvg(data, 'growth_rate'))),

		min_rr_min: getMinMin('reproduction_rate'),
		ni_min_rr_min: getNiMin('reproduction_rate'),
		max_rr_max: getMaxMax('reproduction_rate'),
		ni_max_rr_max: getNiMax('reproduction_rate'),
		avg_rr_min: getAvgMin('reproduction_rate'),
		avg_rr_max: getAvgMax('reproduction_rate'),
		avg_rr_avg: getAvg(flatStats, 'reproduction_rate'),
		min_teta_min: getMinMin('loss_of_diversity'),
		ni_min_teta_min: getNiMin('loss_of_diversity'),
		max_teta_max: getMaxMax('loss_of_diversity'),
		ni_max_teta_max: getNiMax('loss_of_diversity'),
		avg_teta_min: getAvgMin('loss_of_diversity'),
		avg_teta_max: getAvgMax('loss_of_diversity'),
		avg_teta_avg: getAvg(flatStats, 'loss_of_diversity'),
		sigma_rr_max: getSigmaMax('reproduction_rate'),
		sigma_rr_min: getSigmaMin('reproduction_rate'),
		sigma_rr_avg: getSigmaAvg('reproduction_rate'),
		sigma_teta_max: getSigmaMax('loss_of_diversity'),
		sigma_teta_min: getSigmaMin('loss_of_diversity'),
		sigma_teta_avg: getSigmaAvg('loss_of_diversity'),

		min_s_min: getMinMin('selection_difference'),
		ni_min_s_min: getNiMin('selection_difference'),
		max_s_max: getMaxMax('selection_difference'),
		ni_max_s_max: getNiMax('selection_difference'),
		avg_s_min: getAvgMin('selection_difference'),
		avg_s_max: getAvgMax('selection_difference'),
		avg_s_avg: getAvg(flatStats, 'selection_difference'),
	}
};
