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
    alert("Dish Salon Dashboard Updated!");
  };

  const handleDelete = async (id) => {
    if (confirm("මෙම නිර්මාණය ඉවත් කිරීමට ඔබට සහතිකද?")) {
      await axios.delete(`/api/posts?id=${id}&password=NIMSARA2009`);
      mutate();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-serif text-[#1a1a1a]">
      {/* Header Section */}
      <header className="relative py-20 text-center bg-white border-b border-gold-500 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/padded-little.png')]"></div>
        <h1 className="text-7xl md:text-8xl font-black italic text-[#c5a059] tracking-tighter mb-2 drop-shadow-sm">
          DISH SALON
        </h1>
        <div className="flex justify-center items-center gap-4 mb-4">
          <span className="h-[1px] w-12 bg-[#c5a059]"></span>
          <p className="text-[#8e8e8e] tracking-[0.5em] text-xs md:text-sm uppercase font-light">
            Art of Elegance & Beauty
          </p>
          <span className="h-[1px] w-12 bg-[#c5a059]"></span>
        </div>
      </header>

      {/* Admin Quick Access */}
      <div className="p-6 flex justify-center">
        {!isAdmin ? (
          <div className="group flex border border-[#e5e5e5] rounded-full bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
            <input 
              type="password" 
              placeholder="Admin PIN" 
              className="px-6 py-2 outline-none w-40 text-sm italic" 
              onChange={(e) => setPassInput(e.target.value)} 
            />
            <button 
              onClick={() => passInput === "NIMSARA2009" && setIsAdmin(true)} 
              className="bg-[#1a1a1a] text-white px-6 font-bold text-xs tracking-widest hover:bg-[#c5a059] transition-colors"
            >
              ACCESS
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
            <button onClick={() => setIsAdmin(false)} className="text-red-400 text-[10px] uppercase tracking-widest hover:underline">
              Exit Admin Mode
            </button>
          </div>
        )}
      </div>

      {/* Admin Dashboard */}
      {isAdmin && (
        <div className="max-w-xl mx-auto bg-white p-10 rounded-none shadow-2xl mb-16 border-t-4 border-[#c5a059]">
          <h2 className="text-2xl font-light italic mb-8 text-center text-[#1a1a1a] border-b pb-4 uppercase tracking-widest">
            {editingId ? "Modify Masterpiece" : "Add New Creation"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {!editingId && (
              <>
                <input 
                  className="border-b border-[#e5e5e5] p-3 outline-none focus:border-[#c5a059] transition-colors text-sm italic" 
                  placeholder="Direct Media URL (Image/Video)" 
                  value={form.url} 
                  onChange={(e) => setForm({...form, url: e.target.value})} 
                  required 
                />
                <select 
                  className="border-b border-[#e5e5e5] p-3 outline-none text-sm uppercase tracking-widest bg-transparent" 
                  onChange={(e) => setForm({...form, type: e.target.value})}
                >
                  <option value="image">Still Image</option>
                  <option value="video">Motion Video</option>
                </select>
              </>
            )}
            <textarea 
              className="border border-[#e5e5e5] p-4 outline-none focus:border-[#c5a059] h-28 text-sm italic bg-[#fafafa]" 
              placeholder="Write a captivating caption..." 
              value={form.caption} 
              onChange={(e) => setForm({...form, caption: e.target.value})} 
              required 
            />
            <button className="bg-[#1a1a1a] text-white p-4 font-bold tracking-[0.2em] hover:bg-[#c5a059] transition-all duration-500">
              {editingId ? "UPDATE RECORD" : "PUBLISH TO GALLERY"}
            </button>
          </form>
        </div>
      )}

      {/* Professional Gallery Grid */}
      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {posts?.map((post) => (
          <div key={post._id} className="group bg-white flex flex-col shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#f0f0f0]">
            <div className="relative h-[450px] overflow-hidden">
              {post.type === 'image' ? (
                <img 
                  src={post.url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt="Dish Salon Style" 
                />
              ) : (
                <video src={post.url} controls className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            </div>
            
            <div className="p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-8 bg-white flex items-center justify-center">
                 <span className="text-[#c5a059] text-xl">✦</span>
              </div>
              <p className="text-xl font-medium italic text-[#333] mb-4 leading-relaxed">
                "{post.caption}"
              </p>
              
              {isAdmin && (
                <div className="mt-6 pt-6 border-t border-[#f5f5f5] flex justify-center gap-6">
                  <button 
                    onClick={() => {setEditingId(post._id); setForm({...form, caption: post.caption}); window.scrollTo({top: 0, behavior: 'smooth'});}} 
                    className="text-[#c5a059] text-[10px] uppercase tracking-widest font-bold hover:text-black transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(post._id)} 
                    className="text-red-300 text-[10px] uppercase tracking-widest font-bold hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Luxury Footer */}
      <footer className="mt-20 py-20 bg-[#1a1a1a] text-center">
        <h2 className="text-[#c5a059] font-black italic text-3xl mb-4 tracking-tighter">DISH SALON</h2>
        <p className="text-[#4a4a4a] text-[10px] uppercase tracking-[0.5em] mb-8">Where Beauty Meets Perfection</p>
        <div className="flex justify-center gap-8 text-[#666] text-xs italic">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>WhatsApp</span>
        </div>
      </footer>
    </div>
  );
}
