"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateGroup() {
  const [open, setOpen] = useState(false); const [name, setName] = useState(""); const [description, setDescription] = useState(""); const router = useRouter();
  async function submit() { const res = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) }); if (res.ok) { const group = await res.json(); router.push(`/groups/${group._id}`); } else toast.error("Could not create group"); }
  return <div>{!open ? <button className="stage-button" onClick={() => setOpen(true)}>Create group</button> : <div className="stage-card flex flex-col gap-2 p-4"><input className="input" placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} /><input className="input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><button className="stage-button" onClick={submit}>Create</button></div>}</div>;
}
