import { lintRunner } from '../helpers/lintRunner';

const RULE = 'last-line';

describe('LastLineRule', () => {

	it.each([
		[`import jj from 'jj';
		console.log(jj);

`, 1],
		[`import jj from 'jj';
console.log(jj);

jj();`, 0]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});
});