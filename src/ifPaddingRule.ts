import * as Lint from 'tslint';
import ts from 'typescript';
import { prevStatementChecker } from './helpers/prevChecker';

class Walk extends Lint.RuleWalker {

	public visitIfStatement(ifStatement: ts.IfStatement) {

		if (prevStatementChecker(ifStatement, this.getSourceFile())) {

			this.addFailureAtNode(ifStatement, 'Missing blank line before if');
		}

		if (ifStatement.elseStatement) {

			const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), ifStatement.elseStatement.getStart()).line;
			const prevLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), ifStatement.getChildAt(4).getEnd()).line;

			if (prevLine !== startLine) {

				this.addFailureAtNode(ifStatement.elseStatement, 'Not allowed break line on else');
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