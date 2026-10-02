// Turns "{漢字|かんじ}" markup into <ruby> tags (or plain kanji when furigana is off).
window.Ruby = {
  esc: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  render(text, furigana) {
    return this.esc(text)
      .replace(/\{([^|}]+)\|([^}]+)\}/g, (m, k, r) => furigana ? `<ruby>${k}<rt>${r}</rt></ruby>` : k)
      .replace(/\n/g, "<br>")
      .replace(/＿＿/g, '<span class="blank">＿＿</span>');
  },
  plain: (text) => text.replace(/\{([^|}]+)\|([^}]+)\}/g, "$1")
};
