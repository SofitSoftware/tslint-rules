import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getNextToken, getPreviousStatement, getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {

	public static NEW_LINE_BEFORE = 'Missing blank line before class declaration';
	public static NEW_LINE_AFTER = 'Missing blank line after class declaration';
	public static NEW_LINE_END = 'Not allowed blank line before class declaration ends';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new ForPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}

// The walker takes care of all the work.
class ForPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.ClassDeclaration) {

				this.visitForDeclaration(node as ts.ClassDeclaration);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitForDeclaration(node: ts.ClassDeclaration) {

		const prev = getPreviousStatement(node);
		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		const classStatementStart = node.getChildren().filter(n => n.kind === ts.SyntaxKind.ClassKeyword)[0].getStart();

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {
				// Previous statement is on the same or previous line
				this.addFailure(classStatementStart, classStatementStart, Rule.NEW_LINE_BEFORE);
			}
		} else if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine >= line - 1) {

				this.addFailure(classStatementStart, classStatementStart, Rule.NEW_LINE_BEFORE);
			}
		}

		const children = node.getChildren();
		const openBrace = children.filter(n => n.kind === ts.SyntaxKind.OpenBraceToken)[0];
		const closeBrace = children.filter(n => n.kind === ts.SyntaxKind.CloseBraceToken)[0];

		const nextOpenBraceToken = getNextToken(openBrace);

		if (nextOpenBraceToken) {

			const nextBraceTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, nextOpenBraceToken.getStart(this.sourceFile)).line;

			if (nextBraceTokenLine === line + 1) {

				this.addFailure(classStatementStart, classStatementStart, Rule.NEW_LINE_AFTER);
			}
		}

		const nextCloseBraceToken = getPreviousToken(closeBrace);

		if (nextCloseBraceToken) {

			const closeBraceStart = closeBrace.getStart(this.sourceFile);
			const closeBraceLine = ts.getLineAndCharacterOfPosition(this.sourceFile, closeBraceStart).line;
			const nextBraceTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, nextCloseBraceToken.getStart(this.sourceFile)).line;

			if (nextBraceTokenLine !== closeBraceLine - 1) {

				this.addFailure(closeBraceStart, closeBraceStart, Rule.NEW_LINE_END);
			}
		}
	}
}