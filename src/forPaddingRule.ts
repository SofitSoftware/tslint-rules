import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousStatement, getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

const NEW_LINE_BEFORE = 'Missing blank line before for';
const NEW_LINE_AFTER = 'Missing blank line after for';
const NEW_LINE_END = 'Not allowed blank line before for ends';

// The walker takes care of all the work.
class ForPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if ([
				ts.SyntaxKind.ForStatement,
				ts.SyntaxKind.ForInStatement,
				ts.SyntaxKind.ForOfStatement
			].indexOf(node.kind) >= 0) {

				this.visitForDeclaration(node as ts.ForStatement);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitForDeclaration(node: ts.ForStatement) {

		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		this.checkPrev(node, line, start);

		this.checkParent(node, line, start);

		this.checkStatement(node, line, start);

		this.checkLastBlock(node);
	}

	private checkPrev(node: ts.ForStatement, line: number, start: number) {

		const prev = getPreviousStatement(node);

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {
				// Previous statement is on the same or previous line
				this.addFailure(start, start, NEW_LINE_BEFORE);
			}
		}
	}

	private checkParent(node: ts.ForStatement, line: number, start: number) {

		if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine >= line - 1) {

				this.addFailure(start, start, NEW_LINE_BEFORE);
			}
		}
	}

	private checkStatement(node: ts.ForStatement, line: number, start: number) {

		let stop = false;

		node.statement.forEachChild(n => {

			if (stop) {

				return;
			}

			const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

			if (firstChildLine <= line + 1) {

				this.addFailure(start, start, NEW_LINE_AFTER);
			}

			stop = true;
		});
	}

	private checkLastBlock(node: ts.ForStatement) {

		const closeBracket = node.statement.getLastToken(this.sourceFile);
		const closeBracketStart = closeBracket.getStart(this.sourceFile);
		const closeBracketLine = ts.getLineAndCharacterOfPosition(this.sourceFile, closeBracketStart).line;

		const lastBlockStatement = getPreviousToken(closeBracket);

		if (lastBlockStatement) {

			const previousTokenStart = lastBlockStatement.getStart(this.sourceFile);
			const previousTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, previousTokenStart).line;

			if (previousTokenLine !== closeBracketLine - 1) {

				const closeStart = closeBracket.getStart();

				this.addFailure(closeStart, closeStart, NEW_LINE_END);
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new ForPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}