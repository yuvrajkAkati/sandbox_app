import { v } from "convex/values";

import {mutation,query} from "./_generated/server"
import { Doc,Id } from "./_generated/dataModel";
import { embedText } from "./embeddings";


export function chunkText(text: string): string[] {
  return text
    .split(/[\n\.]/)
    .map((t) => t.trim())
    .filter(Boolean);
}



export const createNote = mutation({
    args : {
        title : v.string(),
        content : v.string()
    },
    async handler(ctx, args) {
        const document = await ctx.db.insert("documents",{
            title : args.title,
            content : args.content,
            createdAt : Date.now(),
            updatedAt : Date.now(),
        })


        //ai part
        // const chunks = chunkText(args.title);
        // for (const chunk of chunks) {
        //     const embeddings = await embedText(chunk)
        //     await ctx.db.insert("noteChunks", {
        //         noteId : document,
        //         text: chunk,
        //         embedding : embeddings ,
        //         createdAt: Date.now(),
        //     });
        // }


        return document
    },
})

export const updateNote = mutation({
    args : {
        id: v.id("documents"),
        title: v.string(),
        content: v.string(),
    },
    async handler(ctx, args) {
        await ctx.db.patch(args.id, {
            title: args.title,
            content: args.content,
            updatedAt: Date.now(),
        });
    },
})

export const deleteNote = mutation({
    args : {
        id: v.id("documents"),
    },
    async handler(ctx, args) {

        const chunks = await ctx.db
            .query("noteChunks")
            .withIndex("by_note", (q) => q.eq("noteId", args.id))
            .collect();

        for (const chunk of chunks) {
            await ctx.db.delete(chunk._id);
        }

        await ctx.db.delete(args.id);
    },
})

export const getAllNotes = query({
    args : {

    },
    async handler(ctx, args) {
        return await ctx.db
        .query("documents")
        .withIndex("by_updatedAt")
        .order("desc")
        .collect()
    },
})

export const getNotesByIds = query({
  args: {
    ids: v.array(v.id("documents")),
  },
  async handler(ctx, args) {
    return await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
  },
});


export const searchNotes = query({
  args: {
    search: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const notes = await ctx.db
      .query("documents")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    if (!args.search || !args.search.trim()) {
      return notes;
    }

    const term = args.search.toLowerCase();

    return notes.filter((note) =>
      note.title.toLowerCase().includes(term)
    );
  },
});



export const insertNoteChunk = mutation({
  args: {
    noteId: v.id("documents"),
    text: v.string(),
    embedding: v.array(v.number()),
  },
  async handler(ctx, args) {
    await ctx.db.insert("noteChunks", {
      noteId: args.noteId,
      text: args.text,
      embedding: args.embedding,
      createdAt: Date.now(),
    });
  },
});



export const getChunksByIds = query({
    args: {
    ids: v.array(v.id("noteChunks")),
  },
  async handler(ctx, args) {
    return await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
  },
})