/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dep6zg8j3ndhszx")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "l5na9flp",
    "name": "images",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dep6zg8j3ndhszx")

  // remove
  collection.schema.removeField("l5na9flp")

  return dao.saveCollection(collection)
})
