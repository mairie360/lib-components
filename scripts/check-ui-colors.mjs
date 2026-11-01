import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import ts from 'typescript';

const literals = /#[\da-f]{8}(?![\da-f])|#[\da-f]{6}(?![\da-f])|#[\da-f]{4}(?![\da-f])|#[\da-f]{3}(?![\da-f])|rgba?\([^)]*\)|hsla?\([^)]*\)/gi;
const paletteClasses = /(?<![\w-])(?:[\w-]+:)*!?(?:bg|text|border(?:-[lrtbxy])?|ring|divide|fill|stroke|accent|outline|decoration|shadow|from|via|to)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950))(?:\/\d+)?(?![\w-])/g;
// Standard CSS colour keywords; kept here so the guard has no transitive dependency.
const namedColours = 'aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen';
const namedPattern = () => new RegExp(`(?<![\\w-])(?:${namedColours})(?![\\w-])`, 'gi');
const arbitraryNamedClass = new RegExp(`(?:text|bg|border|ring|fill|stroke)-\\[(?:${namedColours})\\]`, 'gi');
const approvedThemeProperties = new Set(["--background", "--color-background", "--color-foreground", "--foreground", "--mairie-accent", "--mairie-accent-surface", "--mairie-action-background", "--mairie-action-hover-background", "--mairie-background", "--mairie-border", "--mairie-control-background", "--mairie-control-border", "--mairie-error-action-background", "--mairie-error-action-hover-background", "--mairie-error-surface", "--mairie-error-text", "--mairie-file-document", "--mairie-file-image", "--mairie-file-pdf", "--mairie-file-spreadsheet", "--mairie-muted", "--mairie-navigation-active-background", "--mairie-navigation-active-border", "--mairie-navigation-admin-active-background", "--mairie-navigation-admin-active-border", "--mairie-navigation-admin-background", "--mairie-navigation-admin-border", "--mairie-navigation-admin-focus", "--mairie-navigation-admin-hover-background", "--mairie-navigation-admin-shadow", "--mairie-navigation-background", "--mairie-navigation-border", "--mairie-navigation-control-background", "--mairie-navigation-control-border", "--mairie-navigation-hover-background", "--mairie-navigation-shadow", "--mairie-navigation-text", "--mairie-on-action", "--mairie-overlay-background", "--mairie-presence-away", "--mairie-presence-offline", "--mairie-presence-online", "--mairie-preview-dark-background", "--mairie-preview-dark-text", "--mairie-preview-light-background", "--mairie-preview-light-text", "--mairie-purple-surface", "--mairie-purple-text", "--mairie-rating-active", "--mairie-rating-inactive", "--mairie-shadow", "--mairie-success-action-background", "--mairie-success-action-hover-background", "--mairie-success-surface", "--mairie-success-text", "--mairie-surface", "--mairie-surface-raised", "--mairie-teal-text", "--mairie-text", "--mairie-warning-surface", "--mairie-warning-text", "--mairie-secondary", "--mairie-secondary-surface", "--mairie-secondary-action-background", "--mairie-secondary-action-hover-background", "--mairie-on-secondary", "--mairie-info-surface", "--mairie-info-text", "--mairie-logo-backing"]);
const consumerStatusPalette = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
function consumerRanges(text, file) {
  if (file !== 'src/components/ItemContainer.tsx') return [];
  const ranges = [];
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // Only the original module-level palette and ItemContainer's public prop
  // default are contractual. Identical literals in another helper remain UI.
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue;
      if (declaration.name.text === 'statusColors' && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        const elements = declaration.initializer.elements;
        if (elements.length === consumerStatusPalette.length && elements.every((item, index) => ts.isStringLiteral(item) && item.text === consumerStatusPalette[index])) elements.forEach(item => ranges.push([item.getStart(source), item.end]));
      }
      if (declaration.name.text !== 'ItemContainer' || !declaration.initializer || !ts.isArrowFunction(declaration.initializer)) continue;
      const props = declaration.initializer.parameters[0]?.name;
      if (!props || !ts.isObjectBindingPattern(props)) continue;
      for (const binding of props.elements) if (ts.isIdentifier(binding.name) && binding.name.text === 'statusColor' && binding.initializer && ts.isStringLiteral(binding.initializer) && binding.initializer.text === consumerStatusPalette[0]) ranges.push([binding.initializer.getStart(source), binding.initializer.end]);
    }
  }
  return ranges;
}
export function scanSource(text, file) {
  const found = [];
  const callerPalette = file.endsWith('.css') ? [] : consumerRanges(text, file);
  const capture = (content, offset = 0, kind = 'ui') => {
    for (const expression of [literals, paletteClasses]) {
      expression.lastIndex = 0;
      for (const match of content.matchAll(expression)) found.push({ file, line: text.slice(0, offset + match.index).split('\n').length, color: match[0].toLowerCase(), kind: callerPalette.some(([start, end]) => offset + match.index >= start && offset + match.index < end) ? 'consumer-palette' : kind });
    }
  };
  if (file.endsWith('.css')) {
    postcss.parse(text, { from: file }).walkDecls(declaration => {
      // References in compatibility selectors are not colour declarations.
      // Literal values are centralized only in actual theme custom properties.
      const selector = declaration.parent.selector ?? '';
      const centralTheme = ['src/styles/municipal-theme.css', 'src/app/globals.css'].includes(file);
      const kind = centralTheme && approvedThemeProperties.has(declaration.prop) && /^(?::root|html\[data-theme="(?:light|dark)"\])$/.test(selector) ? 'theme-definition' : 'ui';
      capture(declaration.value, declaration.source.start.offset, kind);
      for (const match of declaration.value.matchAll(namedPattern())) found.push({ file, line: declaration.source.start.line, color: match[0].toLowerCase(), kind });
    });
  } else {
    capture(text);
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = node => {
      const styleProperty = ts.isPropertyAssignment(node) && /^(?:color|background(?:Color)?|border(?:Top|Right|Bottom|Left)?Color|outlineColor|fill|stroke|boxShadow|textShadow)$/.test(node.name.getText(source).replaceAll(/["']/g, ''));
      const colourAttribute = ts.isJsxAttribute(node) && /^(?:color|fill|stroke|bgcolor)$/.test(node.name.getText(source));
      const value = styleProperty || colourAttribute ? node.initializer : undefined;
      if (value && ts.isStringLiteral(value)) for (const match of value.text.matchAll(namedPattern())) found.push({ file, line: source.getLineAndCharacterOfPosition(value.getStart(source)).line + 1, color: match[0].toLowerCase(), kind: 'ui' });
      ts.forEachChild(node, visit);
    };
    visit(source);
    for (const match of text.matchAll(arbitraryNamedClass)) found.push({ file, line: text.slice(0, match.index).split('\n').length, color: match[0].toLowerCase(), kind: 'ui' });
  }
  return found;
}
export function inventory(root) {
  const found = [];
  const visit = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) { if (!['__tests__', '__mocks__', 'stories', 'fixtures'].includes(entry.name)) visit(filename); }
      else if (/\.(?:tsx?|css)$/.test(entry.name) && !/\.(?:test|spec|stories)\./.test(entry.name)) found.push(...scanSource(readFileSync(filename, 'utf8'), path.relative(root, filename).split(path.sep).join('/')));
    }
  };
  visit(path.join(root, 'src'));
  return found;
}
export function violations(found) {
  return found.filter(item => item.kind === 'ui');
}

const self = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === self) {
  const root = path.resolve(path.dirname(self), '..');
  const found = inventory(root), remaining = found.filter(item => item.kind === 'ui');
  const failures = violations(found);
  console.log(JSON.stringify({ sourceUiOccurrences: remaining.length, themeDefinitionOccurrences: found.filter(item => item.kind === 'theme-definition').length, consumerPaletteOccurrences: found.filter(item => item.kind === 'consumer-palette').length, failures }, null, 2));
  if (!process.argv.includes('--inventory') && failures.length) process.exitCode = 1;
}
