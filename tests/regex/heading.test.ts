import { ATX_HEADING } from "../../src/rules.ts";
import { assertEquals, assertNotEquals } from "test/assert";

Deno.test("Header: getting data", () => {
    const header = "# Hello world";

    const res = ATX_HEADING.exec(header);
    const hashtag = res?.at(1);
    const inner = res?.at(2);

    assertEquals(hashtag, "#");
    assertEquals(inner, "Hello world");
});

Deno.test("False Header: doesn't have a space after hash", () => {
    const header = "#foo";

    const res = ATX_HEADING.exec(header);

    assertEquals(res, null);
});

Deno.test("False Header: more than six #", () => {
    const header = "####### foo";

    const res = ATX_HEADING.exec(header);

    assertEquals(res, null);
});

Deno.test("Header: many spaces", () => {
    const header = "#   foo   ";
    
    const res = ATX_HEADING.exec(header);

    assertNotEquals(res, null);

    assertEquals(res?.at(2), "foo   ");

    // To trim white spaces in the end of text
    assertEquals(res?.at(2)!.trim(), "foo");
});

Deno.test("Header: escaping", () => {
    const header = "\\# foo";

    const res = ATX_HEADING.exec(header);

    assertEquals(res, null);
});

Deno.test("Header: up to three spaces", () => {
    const header = "   # foo";

    const res = ATX_HEADING.exec(header);

    assertNotEquals(res, null);
});

Deno.test("False Header: four spaces", () => {
    const header = "    # foo";

    const res = ATX_HEADING.exec(header);

    assertEquals(res, null);
});