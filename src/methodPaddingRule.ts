import * as Lint from 'tslint';
import ts from 'typescript';
import { prevTokenChecker } from './helpers/prevChecker';

class Walk extends Lint.RuleWalker {

	public visitMethodDeclaration(method: ts.MethodDeclaration) {

		if (prevTokenChecker(method, this.getSourceFile())) {

			this.addFailureAtNode(method, 'Missing blank line before method');
		}

		super.visitMethodDeclaration(method);
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}