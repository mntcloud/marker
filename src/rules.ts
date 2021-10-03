// CommonMark's characters:
// https://spec.commonmark.org/0.30/#characters-and-lines

export const TAB = '\u0009';
export const SPACE = '\u0020';

// Line ending 
export const LINE_FEED = '\u000A';
export const CARRIAGE_RETURN = '\u000D';
export const LINE_END = CARRIAGE_RETURN + LINE_FEED;

export const FORM_FEED = '\u000C';

// REPLACEMENT CHARACTER
export const REPLACEMENT_CHARACTER = '\uFFFD';

// Regex patterns for Markdown parsing

// ATX Heading: 
// https://spec.commonmark.org/0.30/#atx-heading
export const ATX_HEADING = /^\s{0,3}(?<header>#{1,6})\s+(?<text>.*)$/m;

// Thematic breaks:
// https://spec.commonmark.org/0.30/#thematic-break
export const THEMATIC_BREAK = /^\s{0,3}(\*\*\*|___|---)$/m;

// Fenced code blocks:
// https://spec.commonmark.org/0.30/#code-fence
export const FENCED_CODE_BLOCK = /^[\s]{0,3}(```|~~~)/m;

export const INLINE_CODE_BLOCK_1 = /``(?<inner>.+)``/g;
export const INLINE_CODE_BLOCK_2 = /`(?<inner>.+`)/g;

// Link reference definitions:
// https://spec.commonmark.org/0.30/#link-reference-definition
export const LINK_REFERENCE_START = /^\[(?<name>.+)\]:\s+\/(?<url>\w+)(\s+(?<title>"\w+"))?$/m;
export const LINK_REFERENCE_END = /^\[(?<name>\w+)\]$/m;

// Blockquote marker:
// https://spec.commonmark.org/0.30/#block-quote-marker
export const BLOCKQUOTE_MARKER = /^\s{0,3}>(?<inner>.+)/m;

// List markers:
// https://spec.commonmark.org/0.30/#list-marker
export const BULLET_LIST_MARKER = /^\s{0,3}(-|\+|\*)\s+(.+)/m;
export const NUMBER_LIST_MARKER = /^\s{0,3}[\d]+(\.|\))\s+(.+)/m;

// Font weight markers
const BOLD_MARKER = `\\*\\*(\\w+)\\*\\*`;
export const BOLD_MARKER_REGEX = RegExp(`^${BOLD_MARKER}$`, 'gm');

const ITALIC_MARKER = `\\*(\\w+)\\*`;
export const ITALIC_MARKER_REGEX = RegExp(`^${ITALIC_MARKER}$`, 'gm');

// Links:
// https://spec.commonmark.org/0.30/#links
const LINK = `(?<!\\\|!)\\[([^\\]]*)]\\(\\s*([^\\)]*)\\s*(("[^"]*")?|('[^']')?)\\s*\\)`;
export const LINK_REGEX = RegExp(`^${LINK}$`, 'gm');

// Image:
// https://spec.commonmark.org/0.30/#image-description
const IMAGE_LINK = `(?<!\\\\)!\\[([^\\]]*)\\]\\(\\s*([^\\)]*)\\s*(("[^"]*")?|('[^']*')?)\\s*\\)`;
export const IMAGE_LINK_REGEX= RegExp(`^${IMAGE_LINK}$`, 'gm');

export const FULL_INLINE_ELEMENTS = RegExp(`(?:${BOLD_MARKER})|(?:${ITALIC_MARKER})|(?:${LINK})|(?:${IMAGE_LINK})`, 'g');