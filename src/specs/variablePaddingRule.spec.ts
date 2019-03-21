import { lintRunner } from '../helpers/lintRunner';
import { NEW_LINE_AFTER, NEW_LINE_BEFORE } from '../variablePaddingRule';

const RULE = 'variable-padding';

describe('maria', () => {

	it.each([
		[`function() {
			const maria = 'maria';
			console.log(maria);
		}`, 2, [NEW_LINE_AFTER, NEW_LINE_BEFORE]],
		[`function() {
			console.log('oi');
			const maria = 'maria';
			console.log(maria);
		}`, 2, [NEW_LINE_AFTER, NEW_LINE_BEFORE]],
		[`import moment from 'moment';
		const maria='joaoa';`, 1, [NEW_LINE_BEFORE]],
		[`export const MARIA = true;`, 0, []],
		[`import moment from 'moment';

		const maria='joaoa';`, 0, []],
		[`const maria = true;
		const pedro = false;

		console.log(maria, pedro);`, 0, []],
		[`function maria() {

			const objeto = {
				um_objeto: 3,
				outra_key: 2
			};
			chamaAFuncao();
		}`, 1, [NEW_LINE_AFTER]]
	])('%s', (src: string, count: number, errors: string[]) => {

		const result = lintRunner({
			src,
			rule: RULE
		});

		expect(result.errorCount).toBe(count);

		expect(result.failures.map(f => f.getFailure())).toEqual(errors);
	});
});