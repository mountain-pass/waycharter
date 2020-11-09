const flattenApis = (apisMetadata = null) => {
  if (!Array.isArray(apisMetadata)) {
    throw new Error('apisMetadata must be an array! ' + JSON.stringify({ apisMetadata }))
  }

  const flat = []

  const recurse = (parentPath = null, children = null, inheritProps = {}) => {
    if (parentPath === null) throw new Error('No parentPath provided!')
    if (children === null) throw new Error('No children provided!')
    children.forEach((node) => {
      // if a parent node
      if (node.children && node.path) {
        const { children, path, method, ...props } = node
        // if node has a path array...
        if (Array.isArray(node.path)) {
          node.path.forEach((currPath) => {
            recurse(parentPath + currPath, node.children, { ...inheritProps, ...props })
          })

          // else, node 'path' is assumed to be a single string
        } else {
          recurse(parentPath + node.path, node.children, { ...inheritProps, ...props })
        }

        // if a child node
      } else if (node.method !== 'use' && node.path) {
        if (Array.isArray(node.path)) {
          node.path.forEach((path) => {
            flat.push({ ...inheritProps, ...node, path: parentPath + path })
          })
        } else {
          flat.push({ ...inheritProps, ...node, path: parentPath + node.path })
        }
      }
    })
  }
  recurse('', apisMetadata)

  return flat
}

module.exports = flattenApis
