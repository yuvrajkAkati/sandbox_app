import { action } from "./_generated/server";
import { v } from "convex/values";
import { embedText } from "./embeddings";
import {chunkText} from "./notes"
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { Doc } from "./_generated/dataModel";


export const createNoteWithEmbeddings = action({
  args: {
    title: v.string(),
    content: v.string(),
  },
  async handler(ctx, args) {
    const noteId : Id<"documents"> = await ctx.runMutation(api.notes.createNote, {
      title: args.title,
      content: args.content,
    });


    const chunks = chunkText(args.title);

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);

      await ctx.runMutation(api.notes.insertNoteChunk, {
        noteId,
        text: chunk,
        embedding,
      });
    }

    return noteId;
  },
});

export const similarTitles = action({
  args: {
    search: v.string(),
  },
  async handler(ctx, args): Promise<Doc<"documents">[]> {
    // 1️⃣ Embed query
    const embedding = await embedText(args.search);

    // 2️⃣ Vector search → chunks
    const chunks = await ctx.vectorSearch(
      "noteChunks",
      "by_embedding",
      {
        vector: embedding,
        limit: 5,
      }
    );

    const chunkIds: Id<"noteChunks">[] = chunks.map((c) => c._id);

    //got the chunk ids
    const chunksMetadata = await ctx.runQuery(
        api.notes.getChunksByIds,{ids : chunkIds}
    ) 
    // 3️⃣ Deduplicate NOTE ids (not chunk ids)
    const validChunks = chunksMetadata.filter(isNotNull)
    const noteIds: Id<"documents">[] = Array.from(
        new Set(validChunks.map((c) => c.noteId))
    );


    const similarResults = (await ctx.runQuery(
        api.notes.getNotesByIds,{ids : noteIds}
    )).filter(isNotNull)
    
    return similarResults;
   
  },
});


function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}