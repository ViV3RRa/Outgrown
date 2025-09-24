/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dep6zg8j3ndhszx")

  collection.listRule = "@request.auth.id != \"\" && (\n  user = @request.auth.id || sharedWith ~ @request.auth.username\n)"
  collection.viewRule = "@request.auth.id != \"\" && (\n  user = @request.auth.id || sharedWith ~ @request.auth.username\n)"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dep6zg8j3ndhszx")

  collection.listRule = "@request.auth.id != \"\" && user = @request.auth.id"
  collection.viewRule = "@request.auth.id != \"\" && user = @request.auth.id"

  return dao.saveCollection(collection)
})
