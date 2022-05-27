import { Workbook } from 'exceljs';
import path from 'path';
import { times } from 'lodash';
import { EACH_RUN_STATS_COLUMNS, GROUPED_STATS_COLUMNS } from './constants';
import { buildPath } from '../utils';
import { getColumns, getGroupedDataRow, getRowTitles, getSingleRunRowDataFactory, readData } from './utils';
import { NUMBER_OF_RUNS } from '../constants';
import { FunctionSpec } from '../functions/interfaces';

export const createSheet = () => {
    const workbook = new Workbook();
    const worksheet =  workbook.addWorksheet('sheet');
    worksheet.columns = [
		{ header: 'Configuration', key: 'config', width: 45 },
		...getColumns(),
		...GROUPED_STATS_COLUMNS
	];

	const criteriaLength = EACH_RUN_STATS_COLUMNS.length;
	times(NUMBER_OF_RUNS, (i) => {
		const left = 2 + i * criteriaLength;
		const right = left + criteriaLength - 1;
		worksheet.mergeCells({top: 1, left, bottom: 1, right});
	});

	worksheet.addRow(getRowTitles());

	return {
		addRunResults: async(fnSpec: FunctionSpec, N: number, selection: { type: string, param: number, name: string }) => {
			const resultsPath = buildPath(fnSpec, N, `${selection.type}_${selection.param}`)
			const stats = await readData(resultsPath);
			console.log(`${fnSpec.name} | ${N} | ${selection.name}`);
			const config = `${fnSpec.name} | selection=${selection.name} | N=${N}`;
			let getSingleRunRowData = getSingleRunRowDataFactory(stats, fnSpec);
			worksheet.addRows([
				Object.assign(
					{ config },
					...times(stats.length, (i) => getSingleRunRowData(i)),
					getGroupedDataRow(stats, fnSpec)
				)
			]);
			getSingleRunRowData = null;
			global.gc();
		},
		writeSheetData: () => {
			const statsSheetPath = path.resolve(path.dirname(require.main.filename), 'results', 'statistics.xlsx');
			workbook.xlsx.writeFile(statsSheetPath);
		}
	};
};
