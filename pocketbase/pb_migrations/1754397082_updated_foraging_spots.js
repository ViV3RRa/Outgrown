/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dep6zg8j3ndhszx")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7z8cbjxa",
    "name": "sharedWith",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dep6zg8j3ndhszx")

  // remove
  collection.schema.removeField("7z8cbjxa")

  return dao.saveCollection(collection)
})
