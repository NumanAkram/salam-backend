function batchify(array, batchSize = 5000) {
  let batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    batches.push(batch);
  }
  return batches;
}

module.exports = { batchify };
