import { lintRunner } from '../helpers/lintRunner';

const RULE = 'for-padding';

describe('LastLineRule', () => {

	it.each([
		[`console.log(js);
		for(let j =0;j<10;j++) {
			console.log(j);
		}`, 1],
		[`console.log(js);
		for(let j in jss) {
			console.log(j);
		}`, 1],
		[`console.log(js);
		for(let j of jss) {
			console.log(j);
		}`, 1],
		[`console.log(js);
		for(let j of jss) {
			console.log(j);
		}
		for(let j =0;j<10;j++) {
			console.log(j);
		}
		for(let j of jss) {
			console.log(j);
		}`, 3],
		[`console.log(js);

		for(let j =0;j<10;j++) {
			console.log(j);
		}`, 0],
		[`console.log(js);

		for(let j in jss) {
			console.log(j);
		}`, 0],
		[`console.log(js);

		for(let j of jss) {
			console.log(j);
		}`, 0],

		[`console.log(js);

		for(let j of jss) {
			console.log(j);
		}

		for(let j =0;j<10;j++) {
			console.log(j);
		}

		for(let j of jss) {
			console.log(j);
		}`, 0]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});
});