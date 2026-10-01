class STLLoader {
  load(_url, onLoad) {
    // Immediately invoke callback with empty geometry-like object
    onLoad({})
  }
}
module.exports = {STLLoader}
