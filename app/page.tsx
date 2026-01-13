"use client"
import { api } from "@/convex/_generated/api";
import { deleteNote } from "@/convex/notes";
import { useMutation, useQueries, useQuery } from "convex/react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";



type CardProps = {
  title: string;
  content: string;
  onDelete: () => void;
};



export default function Home() {
  
  const [title, setTitle] = useState("");
  const [content,setContent] = useState("")
  const [search, setSearch] = useState("");


  const notes = useQuery(api.notes.getAllNotes)
  const createNote = useMutation(api.notes.createNote)
  const deleteNote = useMutation(api.notes.deleteNote);


  const handleDelete = async (id: Id<"documents">) => {
    await deleteNote({ id });
  };
  
  const handleCreate = async()=>{
    if(!title) return
    const doc = await createNote({title,content})
    if(doc) console.log("note created")
    setTitle("")
    setContent("")
  }

  const filteredNotes = useQuery(api.notes.searchNotes,{search})

  return (
    <div className="flex w-full">
      <div className="w-1/2 flex flex-col items-center justify-center gap-2">
        <input
          type="text"
          placeholder="create title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />       
        <input type="text" placeholder="create descr" value={content} className="bg-slate-800" onChange={(e)=>setContent(e.target.value)}/>
        <button className="bg-red-900 w-20" onClick={handleCreate}>create</button>
      </div>
      <div className="w-full flex items-center justify-center p-10">
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-red-900 px-1 mb-3"
          />
          <button className="ml-5 bg-slate-700 w-40">search</button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {filteredNotes &&
              filteredNotes.map((doc) => (
                <Card
                  key={doc._id}
                  title={doc.title}
                  content={doc.content}
                  onDelete={() => handleDelete(doc._id)}
                />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, content ,onDelete}: CardProps){
  
  return <div className="h-50 w-50 bg-red-900 ">
    <div className="">
        title : {title}
        <br />
        content : {content}
        <br />
        <button onClick={onDelete} className="bg-red-400 w-30">delete</button>
    </div>
  </div>
}