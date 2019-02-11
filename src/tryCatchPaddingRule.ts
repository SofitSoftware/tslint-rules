import * as Lint from 'tslint';
import ts from 'typescript';
import { prevStatementChecker } from './helpers/prevChecker';

class Walk extends Lint.RuleWalker {

	public visitTryStatement(tryStatement: ts.TryStatement) {

		if (prevStatementChecker(tryStatement, this.getSourceFile())) {

			this.addFailureAtNode(tryStatement, 'Missing blank line before try');
		}

		if (tryStatement.catchClause) {

			const startLine = ts.getLineAndCharacterOfPosition(
				this.getSourceFile(),
				tryStatement.catchClause.getChildAt(4).getStart()
			).line;
			const prevLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), tryStatement.getChildAt(1).getEnd()).line;

			if (prevLine !== startLine) {

				this.addFailureAtNode(tryStatement.catchClause, 'Not allowed break line on else');
			}
		}

		super.visitTryStatement(tryStatement);
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}