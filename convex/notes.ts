import { v } from "convex/values";

import {mutation,query} from "./_generated/server"
import { Doc,Id } from "./_generated/dataModel";


function chunkText(text: string): string[] {
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
        const chunks = chunkText(args.title);

        for (const chunk of chunks) {
        await ctx.db.insert("noteChunks", {
            noteId : document,
            text: chunk,
            createdAt: Date.now(),
        });
        }


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

export const getNoteById = query({
    args : {
        id : v.id("documents")
    },
    async handler(ctx, args) {
        return await ctx.db.get(args.id);
    },
})


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
