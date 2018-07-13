import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getNextToken, getPreviousStatement, getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

const NEW_LINE_BEFORE = 'Missing blank line before class declaration';
const NEW_LINE_AFTER = 'Missing blank line after class declaration';
const NEW_LINE_END = 'Not allowed blank line before class declaration ends';

// The walker takes care of all the work.
class ForPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.ClassDeclaration) {

				this.visitClassDeclaration(node as ts.ClassDeclaration);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitClassDeclaration(node: ts.ClassDeclaration) {

		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		const classStatementStart = node.getChildren().filter(n => n.kind === ts.SyntaxKind.ClassKeyword)[0].getStart();

		if (line > 0) {

			this.checkPrev(node, line, classStatementStart);

			this.checkParent(node, line, classStatementStart);
		}

		this.checkBody(node, classStatementStart);
	}

	private checkPrev(node: ts.ClassDeclaration, line: number, classStatementStart: number) {

		const prev = getPreviousStatement(node);

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {
				// Previous statement is on the same or previous line
				this.addFailure(classStatementStart, classStatementStart, NEW_LINE_BEFORE);
			}
		}
	}

	private checkParent(node: ts.ClassDeclaration, line: number, classStatementStart: number) {

		if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine === line - 1) {

				this.addFailure(classStatementStart, classStatementStart, NEW_LINE_BEFORE);
			}
		}
	}

	private checkBody(node: ts.ClassDeclaration, classStatementStart: number) {

		const children = node.getChildren();

		const openBrace = children.filter(n => n.kind === ts.SyntaxKind.OpenBraceToken)[0];
		const openBraceLine = ts.getLineAndCharacterOfPosition(this.sourceFile, openBrace.getStart(this.sourceFile)).line;

		const closeBrace = children.filter(n => n.kind === ts.SyntaxKind.CloseBraceToken)[0];
		const closeBraceStart = closeBrace.getStart(this.sourceFile);
		const closeBraceLine = ts.getLineAndCharacterOfPosition(this.sourceFile, closeBraceStart).line;

		if (openBraceLine !== closeBraceLine) {

			const nextOpenBraceToken = getNextToken(openBrace);

			if (nextOpenBraceToken) {

				// tslint:disable-next-line:max-line-length
				const nextBraceTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, nextOpenBraceToken.getStart(this.sourceFile)).line;

				if (nextBraceTokenLine === openBraceLine + 1) {

					this.addFailure(classStatementStart, classStatementStart, NEW_LINE_AFTER);
				}
			}

			const nextCloseBraceToken = getPreviousToken(closeBrace);

			if (nextCloseBraceToken) {

				// tslint:disable-next-line:max-line-length
				const nextBraceTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, nextCloseBraceToken.getStart(this.sourceFile)).line;

				if (nextBraceTokenLine !== closeBraceLine - 1) {

					this.addFailure(closeBraceStart, closeBraceStart, NEW_LINE_END);
				}
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new ForPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}