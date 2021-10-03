import { Compiler } from './src/compiler.ts';
import { Parser } from './src/parser.ts';

export function marker(text: string): string {
    const parser = new Parser(text);
    parser.parse();

    const compiler = new Compiler(parser);
    return compiler.compile();
}