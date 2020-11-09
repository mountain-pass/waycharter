const flattenApis = (apisMetadata = null) => {
  if (!Array.isArray(apisMetadata)) {
    throw new Error('apisMetadata must be an array! ' + JSON.stringify({ apisMetadata }))
  }

  const flat = []

  const recurse = (parentPath = null, children = null) => {
    if (parentPath === null) throw new Error('No parentPath provided!')
    if (children === null) throw new Error('No children provided!')
    children.forEach((child) => {
      // if a parent node
      if (child.children) {
        if (Array.isArray(child.path)) {
          child.path.forEach((path) => {
            recurse(parentPath + path, child.children)
          })
        } else {
          recurse(parentPath + child.path, child.children)
        }

        // if a child node
      } else if (child.method !== 'use' && child.path) {
        if (Array.isArray(child.path)) {
          child.path.forEach((path) => {
            flat.push({ ...child, path: parentPath + path })
          })
        } else {
          flat.push({ ...child, path: parentPath + child.path })
        }
      }
    })
  }
  recurse('', apisMetadata)

  return flat
}

module.exports = flattenApis
