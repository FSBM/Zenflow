function serializeDoc(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  if (obj.__v !== undefined) delete obj.__v;
  // Remove sensitive/internal fields
  if (obj.passwordHash) delete obj.passwordHash;
  if (obj.password) delete obj.password;
  return obj;
}

function serializeMany(items) {
  if (!Array.isArray(items)) return items;
  return items.map(serializeDoc);
}

module.exports = { serializeDoc, serializeMany };
