import { bench, runBenchmarks } from 'test/bench';
import { Parser } from '../src/parser.ts';
import { Compiler } from '../src/compiler.ts';

const text = await Deno.readTextFile('./misc/test.md');

bench(function benchMarker(b):void {
    b.start();
    const parser = new Parser(text);
    parser.parse();
    const comp = new Compiler(parser);
    comp.compile();
    b.stop();
});


await runBenchmarks();