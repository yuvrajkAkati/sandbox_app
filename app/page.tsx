"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery, useAction } from "convex/react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type CardProps = {
  title: string;
  content: string;
  onDelete: () => void;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [aiResults, setAiResults] = useState<any[] | null>(null);

  const notes = useQuery(api.notes.getAllNotes);
  const createNote = useMutation(api.notes.createNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const noteWithEmbeddings = useAction(api.actions.createNoteWithEmbeddings);
  const aiSearch = useAction(api.actions.similarTitles);

  const handleDelete = async (id: Id<"documents">) => {
    await deleteNote({ id });
    setAiResults((prev) =>
    prev ? prev.filter((note) => note._id !== id) : prev
  );
  };

  const handleCreate = async () => {
    if (!title) return;
    await noteWithEmbeddings({ title, content });
    setTitle("");
    setContent("");
  };

  const filteredNotes = useQuery(
    api.notes.searchNotes,
    activeSearch ? { search: activeSearch } : { search: "" }
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 ">
      {/* LEFT: CREATE */}
      <div className="fixed left-0 top-0 h-screen w-1/2 flex flex-col items-center justify-center gap-4 border-r border-neutral-800 bg-neutral-950">
        <h2 className="text-xl font-semibold text-neutral-100">
          Create Note
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-80 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          placeholder="Description"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-80 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleCreate}
          className="w-32 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition font-medium"
        >
          Create
        </button>
      </div>

      {/* RIGHT: SEARCH */}
      <div className="ml-[50%] w-1/2 h-screen overflow-y-auto flex justify-center p-10">
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4 text-neutral-100">
            Search Notes
          </h2>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              className="px-6 rounded-md bg-neutral-800 hover:bg-neutral-700 transition"
              onClick={async () => {
                if (!search.trim()) {
                  setActiveSearch("");
                  setAiResults(null);
                  return;
                }

                if (search.length < 3) {
                  setAiResults(null);
                  setActiveSearch(search);
                } else {
                  const results = await aiSearch({ search });
                  setAiResults(results);
                  setActiveSearch("");
                }
              }}
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(aiResults ?? filteredNotes)?.map((doc) => (
              <Card
                key={doc._id}
                title={doc.title}
                content={doc.content}
                onDelete={() => handleDelete(doc._id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, content, onDelete }: CardProps) {
  return (
    <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold text-neutral-100 mb-1">
        {title}
      </h3>

      <p className="text-sm text-neutral-400 mb-4">
        {content}
      </p>

      <button
        onClick={onDelete}
        className="text-sm text-red-400 hover:text-red-300 transition"
      >
        Delete
      </button>
    </div>
  );
}
