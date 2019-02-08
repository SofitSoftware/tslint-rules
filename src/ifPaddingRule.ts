import * as Lint from 'tslint';
import ts from 'typescript';
import { prevStatementChecker } from './helpers/prevChecker';
import { getPreviousToken } from 'tsutils';

// const NEW_LINE_BEFORE = 'Missing blank line before if';
// const NEW_LINE_AFTER = 'Missing blank line after if';
// const NEW_LINE_END = 'Not allowed blank line before if ends';
// const NEW_LINE_AFTER_ELSE = 'Missing blank line after else';

class Walk extends Lint.RuleWalker {

	public visitIfStatement(ifStatement: ts.IfStatement) {

		if (prevStatementChecker(ifStatement, this.getSourceFile())) {

			this.addFailureAtNode(ifStatement, 'Missing blank line before if');
		}

		if (ifStatement.elseStatement) {

			const prev = getPreviousToken(ifStatement.elseStatement);

			if (prev) {

				const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), ifStatement.elseStatement.getStart()).line;
				const prevLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), prev.getEnd()).line;

				if (prevLine !== startLine) {

					this.addFailureAtNode(ifStatement, 'Not allowed break line on else');
				}
			}
		}

		super.visitIfStatement(ifStatement);
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}