import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [form, setForm] = useState({ url: "", type: "image", caption: "" });
  const [editingId, setEditingId] = useState(null);

  // රියල්-ටයිම් දත්ත ලබා ගැනීම (SWR)
  const { data: posts, mutate } = useSWR('/api/posts', fetcher, { refreshInterval: 1000 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = editingId ? { id: editingId, caption: form.caption, password: "NIMSARA2009" } : { ...form, password: "NIMSARA2009" };
    
    if (editingId) await axios.put('/api/posts', payload);
    else await axios.post('/api/posts', payload);
    
    setForm({ url: "", type: "image", caption: "" });
    setEditingId(null);
    mutate(); // වහාම ඩෑෂ්බෝඩ් එක අප්ඩේට් කරන්න
    alert("DISH SALON Feed Updated!");
  };

  const handleDelete = async (id) => {
    if (confirm("මෙම පෝස්ට් එක ඉවත් කිරීමට ඔබට සහතිකද?")) {
      await axios.delete(`/api/posts?id=${id}&password=NIMSARA2009`);
      mutate();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* --- Premium Header --- */}
      <header className="py-16 text-center border-b border-[#1a1a1a] bg-black">
        <h1 className="text-6xl md:text-8xl font-black italic text-[#ff4d94] tracking-tighter drop-shadow-2xl">DISH SALON</h1>
        <p className="mt-4 text-gray-500 uppercase tracking-[0.5em] text-xs font-bold flex items-center justify-center gap-3">
          <span className="w-8 h-[1px] bg-gray-700"></span> LUXURY STYLE FEED <span className="w-8 h-[1px] bg-gray-700"></span>
        </p>
      </header>

      {/* --- Admin Login --- */}
      <div className="flex justify-center p-6">
        {!isAdmin ? (
          <div className="flex border border-[#222] rounded-full overflow-hidden bg-[#111] shadow-2xl">
            <input type="password" placeholder="Admin Access" className="bg-transparent px-6 py-2 outline-none w-40 text-sm" onChange={(e) => setPassInput(e.target.value)} />
            <button onClick={() => passInput === "NIMSARA2009" && setIsAdmin(true)} className="bg-[#ff4d94] text-white px-6 font-bold hover:bg-white hover:text-black transition-all">LOG IN</button>
          </div>
        ) : (
          <button onClick={() => setIsAdmin(false)} className="text-[#ff4d94] font-bold text-xs uppercase tracking-widest hover:underline">Logout Admin Mode</button>
        )}
      </div>

      {/* --- Admin Upload Panel --- */}
      {isAdmin && (
        <div className="max-w-xl mx-auto bg-[#111] p-10 rounded-[2.5rem] border border-[#222] my-10 shadow-[0_0_50px_rgba(255,77,148,0.1)]">
          <h2 className="text-2xl font-bold mb-6 text-[#ff4d94]">{editingId ? "Edit Style Caption" : "Post New Style"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!editingId && (
              <>
                <input className="bg-black border border-[#333] p-4 rounded-2xl outline-none focus:border-[#ff4d94]" placeholder="Paste Image or Video URL" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} required />
                <select className="bg-black border border-[#333] p-4 rounded-2xl outline-none appearance-none" onChange={(e) => setForm({...form, type: e.target.value})}>
                  <option value="image">Still Image (ඡායාරූපය)</option>
                  <option value="video">Motion Video (වීඩියෝ)</option>
                </select>
              </>
            )}
            <textarea className="bg-black border border-[#333] p-4 rounded-2xl outline-none focus:border-[#ff4d94] h-28" placeholder="Style Description..." value={form.caption} onChange={(e) => setForm({...form, caption: e.target.value})} required />
            <button className="bg-[#ff4d94] text-white p-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg">PUBLISH TO FEED</button>
          </form>
        </div>
      )}

      {/* --- Real-time Style Feed --- */}
      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts?.map((post) => (
          <div key={post._id} className="bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-[#1a1a1a] group hover:border-[#ff4d94] transition-all duration-500">
            {/* Media Area */}
            <div className="h-[450px] relative overflow-hidden bg-black">
              {post.type === 'image' ? (
                <img src={post.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Dish Salon" />
              ) : (
                <video src={post.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              )}
              {/* Live Tag */}
              <div className="absolute top-5 left-5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Live Portfolio</span>
              </div>
            </div>
            
            {/* Post Details */}
            <div className="p-8">
              <p className="text-xl font-medium italic text-gray-200 leading-snug">"{post.caption}"</p>
              
              {isAdmin && (
                <div className="mt-6 flex gap-4">
                  <button onClick={() => {setEditingId(post._id); setForm({...form, caption: post.caption}); window.scrollTo(0,0);}} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition">Edit</button>
                  <button onClick={() => handleDelete(post._id)} className="text-xs font-bold text-red-900 hover:text-red-500 uppercase tracking-widest transition">Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="text-center py-20 border-t border-[#1a1a1a] mt-10">
        <p className="text-gray-600 text-[10px] tracking-[0.5em] font-bold">© 2024 DISH SALON • POWERED BY REAL-TIME FEED</p>
      </footer>
    </div>
  );
}
