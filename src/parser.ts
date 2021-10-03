import * as rules from './rules.ts';
import * as struct from './structures.ts';

// This class is parsing Markdown line by line
export class Parser {
    // Blocks with inner content and decoration blocks
    parsed: Array<struct.Block>;

    // Lazy token retrieve
    private tokens: Generator<string>;

    // State of parser
    private in_block: boolean;
    private locked: boolean;

    constructor(text: string) {
        this.parsed = [];

        this.in_block = false;
        this.locked = false;

        this.tokens = this.lazy_split(text);
    }

    parse(): Array<struct.Block> {
        for (const token of this.tokens) {
            if (this.code(token)) {
                continue;
            }

            if (!this.locked) {
                switch(true) {
                    case !token.length: {
                        this.in_block = false;
                        this.parsed.push({ type: struct.BlockType.BlankLine });
                        continue;
                    }
                    case rules.THEMATIC_BREAK.test(token): {
                        this.in_block = false;
                        this.parsed.push({ type: struct.BlockType.ThematicBreak });
                        continue;
                    }
                    case this.header(token):
                    case this.blockquote(token):
                    case this.number_list(token):
                    case this.bullet_list(token):
                    case this.paragraph(token):
                        continue;
                }
            }

            const block = this.parsed[this.parsed.length - 1] as struct.BlockNoInline;
            block.lines.push(token);
        }

        return this.parsed;
    } 

    protected code(token: string): boolean {
        if (rules.FENCED_CODE_BLOCK.test(token)) {
            const lastBlock = this.parsed[this.parsed.length - 1];
            if (this.in_block && lastBlock.type == struct.BlockType.Code) {
                this.in_block = false;
                this.locked = false;

                return true;
            }

            this.in_block = true;
            this.locked = true;

            const codeBlock: struct.BlockNoInline = {
                type: struct.BlockType.Code,
                lines: []
            }

            this.parsed.push(codeBlock);
            return true;
        }

        return false;
    }

    protected blockquote(token: string): boolean {
        if (rules.BLOCKQUOTE_MARKER.test(token)) {
            const last = this.parsed[this.parsed.length - 1] as struct.LargeBlock;

            const quote = rules.BLOCKQUOTE_MARKER.exec(token);
            const inner = quote!.at(1)!;

            const line: struct.Line = {
                text: this.inline(inner)
            };

            if (this.in_block && last.type == struct.BlockType.Blockquote) {
                last.lines.push(line);
                return true;
            }

            if (!this.in_block) {
                this.in_block = true; 
            }

            const res: struct.LargeBlock = {
                type: struct.BlockType.Blockquote,
                lines: [ line ]
            };

            this.parsed.push(res);
            return true;
        }

        return false;
    }

    protected paragraph(token: string): boolean { 
        if (this.in_block) {
            const block = this.parsed[this.parsed.length - 1] as struct.LargeBlock; 
            const numberOfLines = block.lines.length - 1;

            block.lines[numberOfLines].text.push(...this.inline(token));
            return true;
        }

        const line: struct.Line = {
            text: this.inline(token)
        };        

        this.in_block = true;

        const block: struct.LargeBlock = {
            type: struct.BlockType.Paragraph,
            lines: [ line ]
        }

        this.parsed.push(block);        
        return true;
    }
    
    protected number_list(token: string): boolean {
        if (rules.NUMBER_LIST_MARKER.test(token)) {
            const last = this.parsed[this.parsed.length - 1] as struct.LargeBlock;
            
            const listItem = rules.NUMBER_LIST_MARKER.exec(token);
            const text = listItem!.at(2)!;
            const line: struct.Line = {
                text: this.inline(text)
            };

            if (this.in_block && last.type == struct.BlockType.NumberList) {
                last.lines.push(line);

                return true;
            }

            if (!this.in_block) {
                this.in_block = true;
            }

            const list: struct.LargeBlock = {
                type: struct.BlockType.NumberList,
                lines: [ line ]
            };

            this.parsed.push(list);
            return true; 
        }

        return false;
    }

    protected bullet_list(token: string): boolean {
        if (rules.BULLET_LIST_MARKER.test(token)) {
            const last = this.parsed[this.parsed.length - 1] as struct.LargeBlock;
            
            const listItem = rules.BULLET_LIST_MARKER.exec(token);
            const text = listItem!.at(2)!;
            const line: struct.Line = {
                text: this.inline(text)
            };

            if (this.in_block && last.type == struct.BlockType.BulletList) {
                
                last.lines.push(line);
                return true; 
            }

            if (!this.in_block) {
                this.in_block = true;
            }

            const list: struct.LargeBlock = {
                type: struct.BlockType.BulletList,
                lines: [ line ]
            };

            this.parsed.push(list);
            return true;
        }

        return false;
    } 

    protected header(token: string): boolean {
        if (rules.ATX_HEADING.test(token)) {
            const header = rules.ATX_HEADING.exec(token);
            const size = struct.HeaderLevel[header!.at(1)!.length - 1] as struct.HeaderLevelKeys; 
            const text = header!.at(2)!;

            const res: struct.Header = {
                type: struct.BlockType.Header,
                size: struct.HeaderLevel[size],
                innerText: text
            };

            this.in_block = false;
            this.parsed.push(res);

            return true;
        }

        return false;
    }

    private *lazy_split(text: string) {        
        const lastCharPos = text.length - 1;

        let line = "";

         for (let i = 0; i < text.length; i++) {
            if (text[i] == rules.LINE_FEED) {
                yield line;
                line = "";
                continue;
            }            
            
            line += text[i];

            if (i == lastCharPos) {
                yield line;
            }
         }
    }

    private inline(line: string): struct.LineElements {
        const matches = line.matchAll(rules.FULL_INLINE_ELEMENTS);
        const res = new Array<string | struct.Inline>();

        let start = 0;

        for (const match of matches) {
            const part = line.substring(start, match.index);

            res.push(part);

            start = match.index! + match[0].length;

            // Is full of undefined values, so we need to clean up
            const filtered = match.filter((value) => value != undefined); 
            
            switch(true) {
                case this.inline_link(filtered, res):
                case this.inline_image(filtered, res):
                case this.inline_italic(filtered, res):
                case this.inline_bold(filtered, res):
                    continue
            }
        }

        if (res.length) { 
            return res;
        }

        return [ line ];
    }

    protected inline_text_block(
        match: RegExpMatchArray, 
        result: struct.LineElements, 
        type: struct.InlineType.BoldMarker | struct.InlineType.ItalicMarker
        ) {
            const text = match[1];

            const marker: struct.InlineText = {
                type: type,
                text: text,
            }
            
            result.push(marker);
    }

    private inline_italic(match: RegExpMatchArray, result: struct.LineElements): boolean  {
        const full = match[0];

        if (rules.ITALIC_MARKER_REGEX.test(full)) {
            this.inline_text_block(match, result, struct.InlineType.ItalicMarker);

            return true;
        }
        return false;
    }

    private inline_bold(match: RegExpMatchArray, result: struct.LineElements): boolean  {
        const full = match[0];

        if (rules.BOLD_MARKER_REGEX.test(full)) {
            this.inline_text_block(match, result, struct.InlineType.BoldMarker);

            return true;
        }

        return false;
    }

    protected inline_link_block(
        match: RegExpMatchArray, 
        result: struct.LineElements,
        type: struct.InlineType.Link | struct.InlineType.Image
        ) {
            const name = match[1];
            const url = match[2];
            const title = match[3];

            const link: struct.Link = {
                type: type,
                name: name,
                url: url,
                title: title ? title : null,
            }

            result.push(link);
            
    }

    private inline_link(match: RegExpMatchArray, result: struct.LineElements): boolean  {
        const full = match[0];

        if (rules.LINK_REGEX.test(full)) {
            this.inline_link_block(match, result, struct.InlineType.Link);

            return true;
        }

        return false;
    }

    private inline_image(match: RegExpMatchArray, result: struct.LineElements): boolean  {
        const full = match[0]

        if (rules.IMAGE_LINK_REGEX.test(full)) {
            this.inline_link_block(match, result, struct.InlineType.Image);

            return true;
        }

        return false;
    }
}