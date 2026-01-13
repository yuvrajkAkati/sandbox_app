import { v } from "convex/values";

import {mutation,query} from "./_generated/server"
import { Doc,Id } from "./_generated/dataModel";

export const createNote = mutation({
    args : {
        title : v.string(),
    },
    async handler(ctx, args) {
        const document = await ctx.db.insert("documents",{
            title : args.title,
            content : "",
            createdAt : Date.now(),
            updatedAt : Date.now(),
        })
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