const NOOP = function () {
  return arguments
}

const DEFAULT_CONFIG = {
  doBefore: NOOP,
  doAfter: NOOP,
  onError: NOOP
}

const wrapFunction = (originalFunction, config = DEFAULT_CONFIG) => {
  const { doBefore = NOOP, doAfter = NOOP, onError = NOOP } = config
  const wrappedFunction = function WrapperFunction() {
    const newArguments = doBefore([...arguments])
    try {
      const returnValue = originalFunction.apply(this, newArguments)
      return doAfter(returnValue)
    } catch (e) {
      onError(e)
    }
  }
  let prop = null
  for (prop in originalFunction) {
    /* #3 */
    if (Object.prototype.hasOwnProperty.call(originalFunction, prop)) {
      wrappedFunction[prop] = originalFunction[prop]
    }
  }
  return wrappedFunction
}

module.exports = { wrapFunction }
