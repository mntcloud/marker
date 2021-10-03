import { Parser } from "../src/parser.ts";
import { assertEquals } from "test/assert";
import { LargeBlock } from "../src/structures.ts";

Deno.test("Parser: Paragraph structure", () => {
    const text = "Hello world!"
    const parser = new Parser(text);
    const res = parser.parse();

    assertEquals(res[0], {
        type: "Paragraph",
        lines: [
            {
                text: [ "Hello world!" ]
            }
        ]
    })
});

Deno.test("Parser: CodeBlock structure", () => {
    const text = "\`\`\`\nHello world!\nCode test";

    const parser = new Parser(text);
    const res = parser.parse();

    assertEquals(res[0], {
        type: "CodeBlock",
        lines: ["Hello world!", "Code test"]
    })
});

Deno.test("Parser: Inline elements", () => {
    const text = "hel[link](some_address.com)o **reload** *system*";

    const parser = new Parser(text);
    const res = parser.parse()[0] as LargeBlock;

    const structure = res.lines[0].text;

    assertEquals(structure, [
        "hel",
        { type: "Link", name: "link", url: "some_address.com", title: null},
        "o ",
        { type: "Bold", text: "reload"},
        " ",
        { type: "Italic", text: "system"}
    ])
});