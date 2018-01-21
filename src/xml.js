/**
 * xml utilities.
 * @module xml
 */

/**
 * Turns an object into a string of xml attribute key-value pairs.
 * @private
 * @function
 * @memberof xml
 * @param {Object} attrs an object mapping attribute names to attribute values
 * @return {string} a string of xml attribute key-value pairs
 */
export function attrs(attrs) {
  return Object.keys(attrs)
    .map((a) => attrs[a] ? ` ${a}="${attrs[a]}"` : '')
    .join('');
}

/**
 * Creates a string xml tag.
 * @private
 * @function
 * @param {string} ns the tag's xml namespace abbreviation.
 * @param {string} tagName the tag name.
 * @param {Object} attrs @see xml.attrs.
 * @param {string} inner inner xml.
 * @return {string} an xml string.
 */
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
 * @private
 * @param {string} tagName a valid wfs tag name.
 * @param {Object} attrs @see xml.attrs.
 * @param {string} inner @see xml.tag.
 * @return {string} a wfs element.
 */
export const wfs = (tagName, attrs, inner) => tag('wfs', tagName, attrs, inner);

/**
 * Creates a fes:ResourceId filter from a layername and id
 * @private
 * @function
 * @param {string} lyr layer name of the filtered feature
 * @param {string} id feature id
 * @return {string} a filter-ecoding of the filter.
 */
export const idFilter = (lyr, id) => {
  return `<fes:ResourceId rid="${ensureId(lyr, id)}"/>`;
};
