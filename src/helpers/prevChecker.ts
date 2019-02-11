// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousStatement, getPreviousToken } from 'tsutils';
import ts from 'typescript';

export function prevStatementChecker(node: ts.Statement, sourceFile: ts.SourceFile) {

	const prev = getPreviousStatement(node);

	if (prev) {

		return checkPrevLine(node, sourceFile, prev);
	}

	return false;
}

export function prevTokenChecker(node: ts.Node, sourceFile: ts.SourceFile) {

	const prev = getPreviousToken(node);

	if (prev) {

		return checkPrevLine(node, sourceFile, prev);
	}

	return false;
}

function checkPrevLine(node: ts.Node, sourceFile: ts.SourceFile, prev: ts.Node) {

	const startLine = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart()).line;
	const prevLine = ts.getLineAndCharacterOfPosition(sourceFile, prev.getEnd()).line;

	return prevLine === (startLine - 1);
}