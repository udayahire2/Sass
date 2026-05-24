/**
 * Lightweight, robust markdown-to-HTML and HTML-to-markdown converter
 * designed specifically for standard editor elements (headings, bold, italic,
 * underline, code blocks, lists, links, images, tables, and youtube embeds).
 */

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // 1. Pre-process and escape HTML inside code blocks
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escapedCode}</code></pre>`);
    return placeholder;
  });

  // 2. Pre-process and escape HTML inside inline code
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const placeholder = `__INLINE_CODE_PLACEHOLDER_${inlineCodes.length}__`;
    inlineCodes.push(`<code>${escapedCode}</code>`);
    return placeholder;
  });

  // 3. YouTube link conversions - convert [YouTube Video](url) or youtube watch/share urls to embed iframe
  const getYoutubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  html = html.replace(/\[YouTube Video\]\((.*?)\)/gi, (_, url) => {
    const embedUrl = getYoutubeEmbedUrl(url);
    if (embedUrl) {
      return `<div data-youtube-video="true"><iframe src="${embedUrl}" width="640" height="360" allowfullscreen="true" autocomplete="off" scrolling="no" frameborder="0"></iframe></div>`;
    }
    return `<a href="${url}">${url}</a>`;
  });

  // 4. Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableLines: string[] = [];
  const linesAfterTables: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableLines = [line];
      } else {
        tableLines.push(line);
      }
    } else {
      if (inTable) {
        linesAfterTables.push(parseTable(tableLines));
        inTable = false;
        tableLines = [];
      }
      linesAfterTables.push(lines[i]);
    }
  }
  if (inTable) {
    linesAfterTables.push(parseTable(tableLines));
  }
  html = linesAfterTables.join('\n');

  function parseTable(tableLines: string[]): string {
    if (tableLines.length < 2) return tableLines.join('\n');
    const hasHeaderDivider = tableLines[1].includes('---') || tableLines[1].includes('-:-');
    const startIndex = hasHeaderDivider ? 2 : 1;

    const headers = tableLines[0]
      .split('|')
      .slice(1, -1)
      .map(h => h.trim());

    const rows = tableLines.slice(startIndex).map(line =>
      line.split('|').slice(1, -1).map(c => c.trim())
    );

    let tableHtml = '<table>';
    tableHtml += '<thead><tr>';
    headers.forEach(h => {
      tableHtml += `<th>${h}</th>`;
    });
    tableHtml += '</tr></thead>';
    tableHtml += '<tbody>';
    rows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(cell => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  }

  // 5. Headings
  html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // 6. Blockquotes
  html = html.replace(/^\s*>\s+(.*?)$/gm, '<blockquote><p>$1</p></blockquote>');
  html = html.replace(/<\/blockquote>\s*<blockquote>/g, ''); // merge consecutive blockquotes

  // 7. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr />');

  // 8. Lists (Unordered & Ordered)
  const listLines = html.split('\n');
  const processedListLines: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;

  listLines.forEach(line => {
    const matchUnordered = line.match(/^(\s*)[-*+]\s+(.*?)$/);
    const matchOrdered = line.match(/^(\s*)\d+\.\s+(.*?)$/);

    if (matchUnordered) {
      if (currentListType !== 'ul') {
        if (currentListType === 'ol') {
          processedListLines.push('</ol>');
        }
        processedListLines.push('<ul>');
        currentListType = 'ul';
      }
      processedListLines.push(`<li>${matchUnordered[2]}</li>`);
    } else if (matchOrdered) {
      if (currentListType !== 'ol') {
        if (currentListType === 'ul') {
          processedListLines.push('</ul>');
        }
        processedListLines.push('<ol>');
        currentListType = 'ol';
      }
      processedListLines.push(`<li>${matchOrdered[2]}</li>`);
    } else {
      if (currentListType) {
        processedListLines.push(currentListType === 'ul' ? '</ul>' : '</ol>');
        currentListType = null;
      }
      processedListLines.push(line);
    }
  });
  if (currentListType) {
    processedListLines.push(currentListType === 'ul' ? '</ul>' : '</ol>');
  }
  html = processedListLines.join('\n');

  // 9. Images: ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // 10. Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // 11. Text formatting:
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  // Underline (handle existing <u> tag)
  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

  // 12. Paragraph wrapping
  const finalLines = html.split('\n');
  const wrappedLines: string[] = [];

  finalLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if the line is already a block HTML tag
    const isBlock = /^(<\/?(h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|th|td|div|p|img|hr|iframe)\b)/i.test(trimmed);
    const isPlaceholder = trimmed.startsWith('__CODE_BLOCK_PLACEHOLDER_') || trimmed.startsWith('__INLINE_CODE_PLACEHOLDER_');

    if (isBlock || isPlaceholder) {
      wrappedLines.push(line);
    } else {
      wrappedLines.push(`<p>${line}</p>`);
    }
  });
  html = wrappedLines.join('\n');

  // 13. Restore code blocks and inline code
  codeBlocks.forEach((codeBlock, index) => {
    html = html.replace(`__CODE_BLOCK_PLACEHOLDER_${index}__`, codeBlock);
  });
  inlineCodes.forEach((inlineCode, index) => {
    html = html.replace(`__INLINE_CODE_PLACEHOLDER_${index}__`, inlineCode);
  });

  return html;
}

export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let markdown = nodeToMarkdown(doc.body);

  // Normalize duplicate newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
  return markdown;
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toUpperCase();

  // Recursively parse child nodes
  const children = Array.from(element.childNodes)
    .map(child => nodeToMarkdown(child))
    .join('');

  switch (tagName) {
    case 'H1':
      return `\n\n# ${children.trim()}\n\n`;
    case 'H2':
      return `\n\n## ${children.trim()}\n\n`;
    case 'H3':
      return `\n\n### ${children.trim()}\n\n`;
    case 'H4':
      return `\n\n#### ${children.trim()}\n\n`;
    case 'H5':
      return `\n\n##### ${children.trim()}\n\n`;
    case 'H6':
      return `\n\n###### ${children.trim()}\n\n`;
    case 'P':
      return `\n\n${children.trim()}\n\n`;
    case 'STRONG':
    case 'B':
      return `**${children}**`;
    case 'EM':
    case 'I':
      return `*${children}*`;
    case 'U':
      return `<u>${children}</u>`;
    case 'S':
    case 'STRIKE':
    case 'DEL':
      return `~~${children}~~`;
    case 'CODE':
      // If code is inside pre, we treat it as code block and don't wrap inline
      if (element.parentElement?.tagName.toUpperCase() === 'PRE') {
        return children;
      }
      return `\`${children}\``;
    case 'PRE': {
      const codeEl = element.querySelector('code');
      const langClass = codeEl?.className || '';
      const match = langClass.match(/language-(\w+)/);
      const language = match ? match[1] : '';
      const codeText = codeEl ? codeEl.textContent || '' : element.textContent || '';
      return `\n\n\`\`\`${language}\n${codeText.trim()}\n\`\`\`\n\n`;
    }
    case 'BLOCKQUOTE':
      return `\n\n> ${children.trim().replace(/\n/g, '\n> ')}\n\n`;
    case 'UL':
      return `\n\n${children}\n\n`;
    case 'OL':
      return `\n\n${children}\n\n`;
    case 'LI': {
      const parent = element.parentElement;
      if (parent?.tagName.toUpperCase() === 'OL') {
        const index = Array.from(parent.children).indexOf(element) + 1;
        return `${index}. ${children.trim()}\n`;
      }
      return `- ${children.trim()}\n`;
    }
    case 'A': {
      const href = element.getAttribute('href') || '';
      return `[${children}](${href})`;
    }
    case 'IMG': {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }
    case 'HR':
      return `\n\n---\n\n`;
    case 'BR':
      return `\n`;
    case 'TABLE':
      return `\n\n${children}\n\n`;
    case 'THEAD':
    case 'TBODY':
      return children;
    case 'TR': {
      const cells = Array.from(element.childNodes)
        .filter(n => n.nodeType === Node.ELEMENT_NODE && (n.nodeName === 'TD' || n.nodeName === 'TH'))
        .map(n => nodeToMarkdown(n).trim());

      if (cells.length === 0) return '';

      const rowText = `| ${cells.join(' | ')} |\n`;

      const isHeader = element.querySelector('th') !== null || element.parentElement?.tagName.toUpperCase() === 'THEAD';
      if (isHeader) {
        const divider = `| ${cells.map(() => '---').join(' | ')} |\n`;
        return rowText + divider;
      }
      return rowText;
    }
    case 'TD':
    case 'TH':
      return children;
    case 'DIV':
      if (element.hasAttribute('data-youtube-video') || element.getAttribute('data-youtube-video') === 'true') {
        const iframe = element.querySelector('iframe');
        const src = iframe?.getAttribute('src') || '';
        return `\n\n[YouTube Video](${src})\n\n`;
      }
      return children;
    case 'IFRAME': {
      const src = element.getAttribute('src') || '';
      return `\n\n[YouTube Video](${src})\n\n`;
    }
    default:
      return children;
  }
}
