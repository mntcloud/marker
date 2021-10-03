import { Parser } from './parser.ts';
import { Block, BlockType, HeaderLevel, Header, LargeBlock, Inline, InlineText, Link, InlineType} from './structures.ts';

// By default it will compile in the standard HTML elements
// But this behaviour can be changed by overriding methods which return tags
export class Compiler {
    not_compiled: Array<Block>
    compiled: Array<string>
    
    constructor(parser: Parser) {
       this.not_compiled = parser.parsed; 
       this.compiled = [];
    }

    compile(): string {
        for (const block of this.not_compiled) {
            switch (block.type) {
                case BlockType.Header: {
                    const header = block as Header;
                    
                    this.compiled.push(this.header(header)); 
                    break;  
                }
                case BlockType.Blockquote: {
                    this.blockquote(block as LargeBlock);
                    break;
                }
                case BlockType.BulletList: {
                    this.bullet_list(block as LargeBlock);
                    break;
                }
                case BlockType.NumberList: {
                    this.number_list(block as LargeBlock);
                    break;
                }
                case BlockType.Paragraph: {
                    this.paragraph(block as LargeBlock);
                    break;
                }
                case BlockType.ThematicBreak: {
                    this.thematic_break();
                    break;
                }
                case BlockType.Code: {
                    this.code(block as LargeBlock);
                    break;
                }
                case BlockType.BlankLine: {
                    this.compiled.push("");
                    break;
                }
            }
        }

        return this.compiled.join('\n');
    }

    private replace_inline(element: Inline): string {
        switch (element.type) {
            case InlineType.Image: {
                const block = element as Link;
                return this.inline_image_link(block.name, block.url, block.title);
            }
            case InlineType.Link: {
                const block = element as Link;
                return this.inline_link(block.name, block.url, block.title);
            }
            case InlineType.BoldMarker: {
                const block = element as InlineText;
                return this.inline_bold(block.text);
            }
            case InlineType.ItalicMarker: {
                const block = element as InlineText;
                return this.inline_italic(block.text);
            }
            default:
                return "";
        }
    }

    private inline_bold(text: string): string {
        return `<strong>${text}</strong>`;
    } 

    private inline_italic(text: string): string {
        return `<em>${text}</em>`;
    }

    private inline_link(name: string, url: string, title: string | null): string {
        if (title == null) {
            return `<a href="${url}>${name}</a>"`;
        }

        return `<a href="${url}" title="${title}">${name}</a>`;
    }

    private inline_image_link(name: string, url: string, title: string | null): string {
        if (title == null) {
            return `<img src="${url}" alt="${name}">`;
        }

        return `<img src="${url}" alt="${name}" title="${title}">`;
    }

    private thematic_break() {
        this.compiled.push("<hr />");
    }

    private code(block: LargeBlock) {
        this.compiled.push("<code>");

        this.base_block(block); 

        this.compiled.push("</code>");
    }  
    
    private paragraph(block: LargeBlock) {
        this.compiled.push("<p>");

        this.base_block(block); 

        this.compiled.push("</p>");
    } 

    private blockquote(block: LargeBlock) {
        this.compiled.push("<blockquote>");
 
        this.base_block(block);

        this.compiled.push("</blockquote>");
    }

    private number_list(block: LargeBlock) {
        this.compiled.push("<ol>");

        this.base_list(block); 

        this.compiled.push("</ol>");
    }

    private bullet_list(block: LargeBlock) {
        this.compiled.push("<ul>");

        this.base_list(block);

        this.compiled.push("</ul>");
    }  
    
    private base_list(block: LargeBlock) {
        for (const line of block.lines) {
            this.compiled.push(`<li>${line.text}</li>`)
        }
    }

    private base_block(block: LargeBlock) {
       for (const line of block.lines) {
            if (typeof line != "string") {
                let fullLine = "";
                for (const element of line.text) {
                    if (typeof element != "string") {
                        fullLine += this.replace_inline(element);
                        continue;
                    }
                    fullLine += element;
                } 
                this.compiled.push(fullLine);
                continue;
            }
            this.compiled.push(line);
        }
    }

    private header(header: Header): string {
        switch (header.size) {
            case HeaderLevel.First:
                return `<h1>${header.innerText}</h1>`;
            case HeaderLevel.Second:
                return `<h2>${header.innerText}</h2>`;
            case HeaderLevel.Third:
                return `<h3>${header.innerText}</h3>`;
            case HeaderLevel.Fourth:
                return `<h4>${header.innerText}</h4>`;
            case HeaderLevel.Fifth:
                return `<h5>${header.innerText}</h5>`;
            case HeaderLevel.Sixth:
                return `<h6>${header.innerText}</h6>`; 
            default: 
                return '';
        }
    }
}