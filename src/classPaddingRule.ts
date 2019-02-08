import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

class Walker extends Lint.RuleWalker {

	public visitClassDeclaration(classDeclaration: ts.ClassDeclaration) {

		this.checkBody(classDeclaration);

		const prev = getPreviousToken(classDeclaration);

		if (prev) {

			const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), classDeclaration.getStart()).line;
			const prevLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), prev.getStart()).line;

			if (prevLine === (startLine - 1)) {

				this.addFailureAtNode(classDeclaration, 'line before');
			}
		}

		super.visitClassDeclaration(classDeclaration);
	}

	private checkBody(classDeclaration: ts.ClassDeclaration) {

		const endLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), classDeclaration.getEnd()).line;

		if (classDeclaration.getChildAt(3).getChildCount() > 0) {

			this.addBody(classDeclaration, endLine);
		} else {

			const classToken = classDeclaration.getChildren().find(c => c.kind === ts.SyntaxKind.ClassKeyword);

			if (classToken) {

				const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), classToken.getStart()).line;

				if (startLine !== endLine) {

					this.addFailureAtNode(classDeclaration, 'Classes without body must be in the same line');
				}
			}
		}
	}

	private addBody(classDeclaration: ts.ClassDeclaration, endLine: number) {

		const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), classDeclaration.getStart()).line;

		const bodyStartLine = ts.getLineAndCharacterOfPosition(
			this.getSourceFile(),
			classDeclaration.getChildAt(3).getStart()
		).line;
		const bodyEndLine = ts.getLineAndCharacterOfPosition(
			this.getSourceFile(),
			classDeclaration.getChildAt(3).getEnd()
		).line;

		if (bodyStartLine === (startLine + 1)) {

			this.addFailureAtNode(classDeclaration, 'Must have line after class declaration');
		}

		if (endLine > (bodyEndLine + 1)) {

			this.addFailureAtNode(classDeclaration, 'Not allowed line before class ends');
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
	}
}