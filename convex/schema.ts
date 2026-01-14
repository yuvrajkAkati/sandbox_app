import { defineSchema,defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    documents : defineTable({
        title : v.string(),
        content : v.string(),
        createdAt : v.number(),
        updatedAt : v.number()
    })
    .index("by_updatedAt",["updatedAt"])
    .index("by_createdAt",["createdAt"])
    ,
    noteChunks : defineTable({
        noteId : v.id("documents"),
        text : v.string(),
        embedding : v.array(v.number()),
        createdAt : v.number(),
    })
    .index("by_note",["noteId"])
    .index("by_createdAt",["createdAt"])
    .vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 768,
})
})
