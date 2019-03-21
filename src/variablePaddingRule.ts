import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getNextStatement, getPreviousStatement } from 'tsutils';
import ts from 'typescript';

export const NEW_LINE_BEFORE = 'Missing blank line before variable declaration';
export const NEW_LINE_AFTER = 'Missing blank line after variable declaration';

class Walker extends Lint.RuleWalker {

	public visitVariableStatement(variable: ts.VariableStatement) {

		const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), variable.getStart()).line;
		const endLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), variable.getEnd()).line;

		this.checkNextStatement(variable, endLine);

		this.checkPrevStatement(variable, startLine);

		this.checkParent(variable, startLine);

		super.visitVariableStatement(variable);
	}

	private checkNextStatement(variable: ts.VariableStatement, line: number) {

		const next = getNextStatement(variable);

		if (next && next.kind !== ts.SyntaxKind.VariableStatement) {

			const nextLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), next.getStart()).line;

			if (nextLine === line + 1) {

				this.addFailureAtNode(variable, NEW_LINE_AFTER);
			}
		}
	}

	private checkPrevStatement(variable: ts.VariableStatement, line: number) {

		const prev = getPreviousStatement(variable);

		if (prev && prev.kind !== ts.SyntaxKind.VariableStatement) {

			const prevLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), prev.getStart()).line;

			if (prevLine === line - 1) {

				this.addFailureAtNode(variable, NEW_LINE_BEFORE);
			}
		}
	}

	private checkParent(variable: ts.VariableStatement, line: number) {

		if (variable.parent.kind !== ts.SyntaxKind.SourceFile) {

			const parentBrackets = variable.parent.getChildAt(0);
			const parentLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), parentBrackets.getStart()).line;

			if (parentLine === line - 1) {

				this.addFailureAtNode(variable, NEW_LINE_BEFORE);
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
	}
}