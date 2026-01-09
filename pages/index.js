import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [form, setForm] = useState({ url: "", type: "image", caption: "" });
  const [editingId, setEditingId] = useState(null);

  const { data: posts, mutate } = useSWR('/api/posts', fetcher, { refreshInterval: 1000 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = editingId ? { id: editingId, caption: form.caption, password: "NIMSARA2009" } : { ...form, password: "NIMSARA2009" };
    if (editingId) await axios.put('/api/posts', payload);
    else await axios.post('/api/posts', payload);
    setForm({ url: "", type: "image", caption: "" });
    setEditingId(null);
    mutate();
    alert("Dashboard Updated!");
  };

  const handleDelete = async (id) => {
    if (confirm("මකන්නද?")) {
      await axios.delete(`/api/posts?id=${id}&password=NIMSARA2009`);
      mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="p-10 text-center bg-white border-b-4 border-pink-500 shadow-sm">
        <h1 className="text-6xl font-black italic text-pink-600">DISH SALON</h1>
        <p className="text-gray-400 tracking-widest text-sm mt-2 uppercase">Real-time Luxury Dashboard</p>
      </header>

      <div className="p-4 text-center">
        {!isAdmin ? (
          <div className="inline-flex border rounded-full bg-white shadow-sm overflow-hidden">
            <input type="password" placeholder="Admin PIN" className="px-4 py-2 outline-none" onChange={(e) => setPassInput(e.target.value)} />
            <button onClick={() => passInput === "NIMSARA2009" && setIsAdmin(true)} className="bg-pink-500 text-white px-6 font-bold">Log In</button>
          </div>
        ) : (
          <button onClick={() => setIsAdmin(false)} className="text-red-500 font-bold border border-red-200 px-4 py-1 rounded-full text-xs">Logout Admin Panel</button>
        )}
      </div>

      {isAdmin && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl mb-10 border border-pink-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{editingId ? "Edit Caption" : "Add New Post"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!editingId && (
              <>
                <input className="border p-4 rounded-xl outline-none" placeholder="Media Link (URL)" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} required />
                <select className="border p-4 rounded-xl" onChange={(e) => setForm({...form, type: e.target.value})}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </>
            )}
            <textarea className="border p-4 rounded-xl outline-none h-24" placeholder="Caption..." value={form.caption} onChange={(e) => setForm({...form, caption: e.target.value})} required />
            <button className="bg-black text-white p-4 rounded-xl font-bold hover:bg-pink-600 transition">PUBLISH LIVE</button>
          </form>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post) => (
          <div key={post._id} className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden border border-gray-100">
            <div className="h-80">
              {post.type === 'image' ? <img src={post.url} className="w-full h-full object-cover" /> : <video src={post.url} controls className="w-full h-full object-cover" />}
            </div>
            <div className="p-6 text-center">
              <p className="text-xl font-bold italic text-gray-800">"{post.caption}"</p>
              {isAdmin && (
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={() => {setEditingId(post._id); setForm({...form, caption: post.caption}); window.scrollTo(0,0);}} className="text-blue-500 text-sm font-bold border px-3 py-1 rounded-lg">Edit</button>
                  <button onClick={() => handleDelete(post._id)} className="text-red-500 text-sm font-bold border px-3 py-1 rounded-lg">Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
