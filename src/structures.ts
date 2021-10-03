export interface Block {
    type: BlockType
}

export interface LargeBlock extends Block{
    lines: Array<Line>,
}

export interface BlockNoInline extends Block {
    lines: Array<string>
}

export type LineElements = Array<string | Inline>;

export interface Line {
    text: LineElements
}

// Setting string values for debugging
export enum BlockType {
    Paragraph = "Paragraph",
    Header = "Header",
    ThematicBreak = "ThematicBreak",
    BulletList = "BulletList",
    NumberList = "NumberList",
    Code = "CodeBlock",
    Blockquote = "Blockquote",
    LinkReference = "LinkReference",
    BlankLine = "BlankLine",
}

export type HeaderLevelKeys = keyof typeof HeaderLevel;

export interface Header extends Block {
    size: HeaderLevel,
    innerText: string,
}

export enum HeaderLevel {
    First,
    Second,
    Third,
    Fourth,
    Fifth,
    Sixth
}

export enum InlineType {
    Image = "Image",
    Link = "Link",
    ItalicMarker = "Italic",
    BoldMarker = "Bold",
}

export interface Inline {
    type: InlineType
}

export interface InlineText extends Inline {
    text: string
}

export interface Link extends Inline {
    name: string,
    title: string | null,
    url: string
}