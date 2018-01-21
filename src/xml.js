/**
 * xml utilities.
 * @module xml
 */

/**
 * Turns an object into a string of xml attribute key-value pairs.
 * @function
 * @param {Object} attrs an object mapping attribute names to attribute values
 * @return {String} a string of xml attribute key-value pairs
 */
export function attrs(attrs) {
  return Object.keys(attrs)
    .map((a) => attrs[a] ? ` ${a}="${attrs[a]}"` : '')
    .join('');
}

/**
 * Creates a string xml tag.
 * @function
 * @param {String} ns the tag's xml namespace abbreviation.
 * @param {String} tagName the tag name.
 * @param {Object} attrs @see xml.attrs.
 * @param {String} inner inner xml.
 * @return {String} an xml string.
 */
export function tag(ns, tagName, attrs, inner) {
  let tag = (ns ? `${ns}:` : '') + tagName;
  if (tagName) {
    return `<${tag}${attrs(attrs)}${inner ? `>${inner}</${tag}` : ' /' }>`;
  } else {
    throw new Error(
      'no tag supplied ' + JSON.stringify({ns, tagName, attrs, inner}, null, 2)
    );
  }
};

/**
 * Shorthand for creating a wfs xml tag.
 * @param {String} tagName a valid wfs tag name.
 * @param {Object} attrs @see xml.attrs.
 * @param {String} inner @see xml.tag.
 * @return {String} a wfs element.
 */
export const wfs = (tagName, attrs, inner) => tag('wfs', tagName, attrs, inner);

/**
 * Creates a fes:ResourceId filter from a layername and id
 * @function
 * @param {String} lyr layer name of the filtered feature
 * @param {String} id feature id
 * @return {String} a filter-ecoding of the filter.
 */
export const idFilter = (lyr, id) => {
  return `<fes:ResourceId rid="${ensureId(lyr, id)}"/>`;
};
