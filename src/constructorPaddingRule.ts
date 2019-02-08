import * as Lint from 'tslint';
import ts from 'typescript';
import { prevTokenChecker } from './helpers/prevChecker';

class Walk extends Lint.RuleWalker {

	public visitConstructorDeclaration(constructor: ts.ConstructorDeclaration) {

		if (prevTokenChecker(constructor, this.getSourceFile())) {

			this.addFailureAtNode(constructor, 'Constructor must have a line before');
		}

		super.visitConstructorDeclaration(constructor);
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}