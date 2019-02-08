import { Configuration, Linter } from 'tslint';

interface IMaria {
	src: string;
	// tslint:disable-next-line:no-any
	rule: any;
	fileName?: string;
}

export function lintRunner(data: IMaria) {

	const { src, rule, fileName = '' } = data;

	const linter = new Linter({ fix: false });

	linter.lint(
		fileName,
		src,
		Configuration.parseConfigFile({
			rules: {
				[rule.name || rule]: [true]
			},
			rulesDirectory: 'src'
		})
	);

	return linter.getResult();
}

// export function getFixedResult(data: IMaria) {

// 	const result = helper(data);

// 	return Replacement.applyFixes(data.src, [result.failures[0].getFix()]);
// }