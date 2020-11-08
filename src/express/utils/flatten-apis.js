const flattenApis = (apisMetadata) => {
  const flat = []

  const recurse = (parentPath, children) => {
    children.forEach((child) => {
      if (child.children) {
        recurse(parentPath + child.path, child.children)
      } else if (child.method !== 'use') {
        flat.push({ ...child, path: parentPath + child.path })
      }
    })
  }
  recurse('', apisMetadata)

  return flat
}

module.exports = flattenApis
