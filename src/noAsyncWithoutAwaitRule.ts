import * as Lint from 'tslint';
import ts from 'typescript';

export const NO_ASYNC_WITHOUT_AWAIT = 'Functions marked async must contain an await or return statement.';

class Walk extends Lint.RuleWalker {

	protected visitFunctionDeclaration(node: ts.FunctionDeclaration) {

		this.addFailureIfAsyncFunctionHasNoAwait(node);
		super.visitFunctionDeclaration(node);
	}

	protected visitArrowFunction(node: ts.ArrowFunction) {

		this.addFailureIfAsyncFunctionHasNoAwait(node);
		super.visitArrowFunction(node);
	}

	protected visitMethodDeclaration(node: ts.MethodDeclaration) {

		this.addFailureIfAsyncFunctionHasNoAwait(node);
		super.visitMethodDeclaration(node);
	}

	private isAsyncFunction(node: ts.Node): boolean {

		return this.getAsyncModifier(node) !== undefined;
	}

	private getAsyncModifier(node: ts.Node) {

		if (node.modifiers) {

			return node.modifiers.find(
				modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword
			);
		}

		return;
	}

	private isAwait(node: ts.Node): boolean {

		return node.kind === ts.SyntaxKind.AwaitKeyword;
	}

	private isReturn(node: ts.Node): boolean {

		return node.kind === ts.SyntaxKind.ReturnKeyword;
	}

	private functionBlockHasAwait(node: ts.Node): boolean {

		if (this.isAwait(node)) {

			return true;
		}

		if (
			node.kind === ts.SyntaxKind.ArrowFunction ||
			node.kind === ts.SyntaxKind.FunctionDeclaration
		) {

			return false;
		}

		const awaitInChildren = node
			.getChildren()
			.map((functionBlockNode: ts.Node) => this.functionBlockHasAwait(functionBlockNode));

		return awaitInChildren.some(Boolean);
	}

	private functionBlockHasReturn(node: ts.Node): boolean {

		if (this.isReturn(node)) {

			return true;
		}

		// tslint:disable-next-line:no-unsafe-any
		if (
			node.kind === ts.SyntaxKind.ArrowFunction ||
			node.kind === ts.SyntaxKind.FunctionDeclaration
		) {

			return false;
		}

		const returnInChildren = node
			.getChildren()
			.map((functionBlockNode: ts.Node) => this.functionBlockHasReturn(functionBlockNode));

		return returnInChildren.some(Boolean);
	}

	private isShortArrowReturn(node: ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration) {

		return (
			node.kind === ts.SyntaxKind.ArrowFunction &&
			node.body.kind !== ts.SyntaxKind.Block
		);
	}

	private addFailureIfAsyncFunctionHasNoAwait(node: ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration) {

		if (
			this.isAsyncFunction(node) &&
			!this.functionBlockHasAwait(node.body as ts.Node) &&
			!this.functionBlockHasReturn(node.body as ts.Node) &&
			!this.isShortArrowReturn(node)
		) {

			const asyncModifier = this.getAsyncModifier(node);

			if (asyncModifier !== undefined) {

				this.addFailureAt(
					asyncModifier.getStart(),
					asyncModifier.getEnd() - asyncModifier.getStart(),
					NO_ASYNC_WITHOUT_AWAIT
				);
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}