import { bench, runBenchmarks } from 'test/bench';
import marked from 'https://esm.sh/marked@3.0.4'


const text = await Deno.readTextFile('./misc/test.md');

bench(function benchMarkedParser(b):void {
    b.start();
    marked(text);
    b.stop();
});



await runBenchmarks();