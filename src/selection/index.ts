import { tournamentWithoutReturn, tournamentWithReturn } from './tournament';
import { rank } from './rank';
import { RANK_SELECTION_TYPE } from './rank/constants';

export const SELECTION_TYPE = {
	tournament_with_return: tournamentWithReturn,
	tournament_without_return: tournamentWithoutReturn,
	rank_linear: rank(RANK_SELECTION_TYPE.LINEAR),
	rank_exponential: rank(RANK_SELECTION_TYPE.EXPONENTIAL),
};

export const getSelectionFunction = ({type, param}: {type: string, param: number}) => SELECTION_TYPE[type](param);
