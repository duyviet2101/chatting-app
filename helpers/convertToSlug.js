const unidecode = require('unidecode');

module.exports = (text) => {
  const unidecodeText = unidecode(text.trim());

  const slug = unidecodeText.replace(/\s+/g, '_');

  return slug;
}