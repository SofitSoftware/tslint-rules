import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getNextStatement, getPreviousStatement } from 'tsutils';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {

	public static NEW_LINE_BEFORE = 'Missing blank line before variable declaration';
	public static NEW_LINE_AFTER = 'Missing blank line after variable declaration';
	public static NEW_LINE_END = 'Not allowed blank line before for ends';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new VariablePaddingWalker(sourceFile, this.ruleName, undefined));
	}
}

// The walker takes care of all the work.
class VariablePaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.VariableStatement) {

				this.visitForDeclaration(node as ts.VariableStatement);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitForDeclaration(node: ts.VariableStatement) {

		const prev = getPreviousStatement(node);
		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		const next = getNextStatement(node);

		if (prev) {

			const prevLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevLine === line - 1 && prev.kind !== ts.SyntaxKind.VariableStatement) {

				this.addFailure(start, start, Rule.NEW_LINE_BEFORE);
			}
		}

		if (next) {

			const nextLine = ts.getLineAndCharacterOfPosition(this.sourceFile, next.getStart(this.sourceFile)).line;

			if (nextLine === line + 1 && next.kind !== ts.SyntaxKind.VariableStatement) {

				this.addFailure(start, start, Rule.NEW_LINE_AFTER);
			}
		}
	}
}