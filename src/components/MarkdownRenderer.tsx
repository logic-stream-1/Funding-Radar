import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return <p className="text-gray-500 italic">No content available.</p>;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-4 space-y-2 text-on-surface-variant font-sans text-sm">
          {listItems.map((item, idx) => (
            <li key={`li-${key}-${idx}`}>{renderFormattedText(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  const renderFormattedText = (text: string) => {
    // Basic bold **text** and link [text](url) replacement
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let keyIdx = 0;

    // Regex for bold **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    // Regex for links [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;

    // Simple replacement logic
    let match;
    let lastIndex = 0;

    // Combine both: for simplicity, we parse bold first, then handle links or vice versa.
    // Let's do a simple parsing by tokenizing or simple HTML string generation then dangerously set HTML
    // safely escaped! Or do inline tokenization.
    // Safe JSX-based inline tokenization is much cleaner:
    const tempTokens: { type: "text" | "bold" | "link"; content: string; url?: string }[] = [];
    let lastIdx = 0;
    
    // We can do a quick regex search
    const combinedRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    let tokenMatch;
    
    while ((tokenMatch = combinedRegex.exec(text)) !== null) {
      const matchStr = tokenMatch[0];
      const matchIndex = tokenMatch.index;
      
      if (matchIndex > lastIdx) {
        tempTokens.push({ type: "text", content: text.substring(lastIdx, matchIndex) });
      }
      
      if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
        tempTokens.push({ type: "bold", content: matchStr.slice(2, -2) });
      } else if (matchStr.startsWith("[") && matchStr.includes("](")) {
        const closeBrack = matchStr.indexOf("]");
        const label = matchStr.slice(1, closeBrack);
        const url = matchStr.slice(closeBrack + 2, -1);
        tempTokens.push({ type: "link", content: label, url });
      }
      
      lastIdx = combinedRegex.lastIndex;
    }
    
    if (lastIdx < text.length) {
      tempTokens.push({ type: "text", content: text.substring(lastIdx) });
    }

    if (tempTokens.length === 0) {
      return text;
    }

    return tempTokens.map((tok, i) => {
      if (tok.type === "bold") {
        return <strong key={i} className="font-semibold text-on-surface">{tok.content}</strong>;
      }
      if (tok.type === "link") {
        return (
          <a
            key={i}
            href={tok.url}
            target="_blank"
            referrerPolicy="no-referrer"
            className="text-secondary font-medium underline hover:text-secondary-container transition-colors inline-flex items-center gap-0.5"
          >
            {tok.content}
          </a>
        );
      }
      return tok.content;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      if (in_list(reqListActive())) flushList(`flush-h3-${idx}`);
      elements.push(
        <h3 key={idx} className="font-sans text-lg font-semibold tracking-tight text-on-surface mt-6 mb-3 border-b border-outline-variant/30 pb-1">
          {renderFormattedText(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      if (in_list(reqListActive())) flushList(`flush-h2-${idx}`);
      elements.push(
        <h2 key={idx} className="font-sans text-xl font-bold tracking-tight text-on-surface mt-8 mb-4">
          {renderFormattedText(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      if (in_list(reqListActive())) flushList(`flush-h1-${idx}`);
      elements.push(
        <h1 key={idx} className="font-sans text-2xl font-extrabold tracking-tight text-on-surface mt-10 mb-6">
          {renderFormattedText(trimmed.slice(2))}
        </h1>
      );
    }
    // Lists
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (trimmed.match(/^\d+\.\s/)) {
      if (in_list(reqListActive())) flushList(`flush-ordered-${idx}`);
      const sliceIdx = trimmed.indexOf(" ") + 1;
      elements.push(
        <div key={idx} className="flex gap-2 my-2 text-on-surface-variant font-sans text-sm">
          <span className="font-semibold text-secondary">{trimmed.substring(0, sliceIdx)}</span>
          <span>{renderFormattedText(trimmed.substring(sliceIdx))}</span>
        </div>
      );
    }
    // Empty Line
    else if (trimmed === "") {
      if (in_list(reqListActive())) flushList(`flush-empty-${idx}`);
    }
    // Normal Paragraph
    else {
      if (in_list(reqListActive())) flushList(`flush-p-${idx}`);
      elements.push(
        <p key={idx} className="font-sans text-sm text-on-surface-variant leading-relaxed my-3">
          {renderFormattedText(line)}
        </p>
      );
    }
  });

  // Flush any final list elements
  if (listItems.length > 0) {
    elements.push(
      <ul key="ul-final" className="list-disc pl-5 my-4 space-y-2 text-on-surface-variant font-sans text-sm">
        {listItems.map((item, idx) => (
          <li key={`li-final-${idx}`}>{renderFormattedText(item)}</li>
        ))}
      </ul>
    );
  }

  return <div className="space-y-1">{elements}</div>;

  function in_list(active: boolean) {
    return inList;
  }
  function reqListActive() {
    return inList;
  }
};
