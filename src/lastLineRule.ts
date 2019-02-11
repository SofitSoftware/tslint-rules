import * as Lint from 'tslint';
import ts from 'typescript';

const NOT_ALLOWED_LINE = 'Not allowed empty line on end of file';

class LastLineWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const fileText = sourceFile.getFullText();

		if (fileText[fileText.length - 1] === '\n') {

			this.addFailure(sourceFile.getEnd(), sourceFile.getEnd(), NOT_ALLOWED_LINE);
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new LastLineWalker(sourceFile, this.ruleName, undefined));
	}
}