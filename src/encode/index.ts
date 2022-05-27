const toBinary = (x: number) => (x).toString(2).padStart(10, '0');

const binaryToDecimal = (x: string) => Math.round(parseInt(x, 2));

export const toGrayCode = (x: number) => {
	x = Math.round(x);
	const binary = toBinary(x);
	const bits: any[] = binary.split('');
	let result = bits[0];
	while (bits.length > 1) {
		result += bits.shift() ^ bits[0];
	}
	if (result.length !== 10) {
		throw new Error(`Invalid chromosome length: expect length of 10 but got ${result.length}`);
	}
	return result;
};

export const toDecimal = (x: string) => {
	const bits: any = x.split('');
	let result = bits.shift();
	while (bits.length) {
		result += bits.shift() ^ result[result.length - 1];
	}
	return binaryToDecimal(result);
};
