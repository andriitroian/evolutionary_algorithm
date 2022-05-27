import { Workbook } from 'exceljs';
import { readData } from '../sheet/utils';
import { NUMBER_OF_RUNS } from '../constants';
import { FunctionSpec } from '../functions/interfaces';
import { buildPath } from '../utils';
import path from 'path';
import { last, maxBy, minBy, sumBy, times } from 'lodash';
import { populationConverged } from '../termination';

const getRowTitles = () => Object.assign({}, ...times(NUMBER_OF_RUNS, (i) => ({
	[`ni-${i}`]: 'NI',
	[`conv_to-${i}`]: 'ConvTo'
})));

export const createSheet = () => {
	const workbook = new Workbook();
	const worksheet =  workbook.addWorksheet('sheet');

	const criteria = [
		{ header: 'NI', key: 'ni', width: 10 },
		{ header: 'ConvTo', key: 'conv_to', width: 10 },
	];

	const groupedCommonProps = {
		width: 15, style: {
			fill: {
				type: 'pattern',
				pattern:'solid',
				fgColor: { argb:'33F8FA78' }
			},
			border: {
				top: {style:'thin'},
				left: {style:'thin'},
				bottom: {style:'thin'},
				right: {style:'thin'}
			}
		}
	};
	worksheet.columns = [
		{ header: 'Configuration', key: 'config', width: 45 },
		...times(NUMBER_OF_RUNS, (i) => criteria.map((item) => ({...item, key: `${item.key}-${i}`, header: `Run ${i + 1}`}))).flat(),

		// Grouped
		{ header: 'Suc', key: 'suc', ...groupedCommonProps },
		{ header: 'Min', key: 'min', ...groupedCommonProps },
		{ header: 'Max', key: 'max', ...groupedCommonProps },
		{ header: 'Avg', key: 'avg', ...groupedCommonProps },
		{ header: 'Num0', key: 'num0', ...groupedCommonProps },
		{ header: 'Num1', key: 'num1', ...groupedCommonProps },
	];

	times(NUMBER_OF_RUNS, (i) => {
		const left = 2 + i * criteria.length;
		const right = left + criteria.length - 1;
		worksheet.mergeCells({top: 1, left, bottom: 1, right});
	});

	worksheet.addRow(getRowTitles());

	return {
		addRunResults: async(fnSpec: FunctionSpec, N: number, selection: { type: string, param: number, name: string }) => {
			const resultsPath = buildPath(fnSpec, N, `${selection.type}_${selection.param}`)
			const stats = await readData(resultsPath);
			const config = `${fnSpec.name} | selection=${selection.name} | N=${N}`;
			const getConvTo = (runStats) => {
				const lastPopulation = last(runStats).population;
				return populationConverged(lastPopulation) ? last(lastPopulation).chromosome[0] : null;
			}
			const successStats = stats.filter(run => populationConverged(last(run).population));
			worksheet.addRows([
				Object.assign(
					{ config },
					...times(stats.length, (i) => ({ [`ni-${i}`]: stats[i].length, [`conv_to-${i}`]: getConvTo(stats[i]) })),
					{
						suc: successStats.length,
						min: minBy(successStats, 'length').length,
						max: maxBy(successStats, 'length').length,
						avg: sumBy(successStats)/NUMBER_OF_RUNS,
						num0: successStats.map(getConvTo).filter(convTo => convTo === '0').length/successStats.length,
						num1: successStats.map(getConvTo).filter(convTo => convTo === '1').length/successStats.length,
					}
				)
			]);
		},
		writeSheetData: () => {
			const statsSheetPath = path.resolve(path.dirname(require.main.filename), 'results', 'noise.xlsx');
			workbook.xlsx.writeFile(statsSheetPath);
		}
	};
};
