export interface FunctionSpec {
	id: string,
	name: string,
	chromosomeLength: number,
	optimal: string,
	fn: Function,
	reverseFn?: Function,
	encode: Function,
	decode: Function,
	min?: number,
	max?: number
}
