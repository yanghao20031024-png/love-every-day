"use client";

import { useLoveData, Photo } from "@/hooks/useLoveData";
import { useState, useRef } from "react";

const categories = ["全部", "约会", "旅行", "日常", "纪念日", "美食", "自拍", "其他"];

export default function AlbumPage() {
  const { data, saveData, uploadImage } = useLoveData();
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadForm, setUploadForm] = useState({ description: "", category: "日常", date: new Date().toISOString().split("T")[0] });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const filteredPhotos = selectedCategory === "全部" ? data.photos : data.photos.filter((p) => p.category === selectedCategory);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newPhotos: Photo[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        newPhotos.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          url,
          description: uploadForm.description,
          date: uploadForm.date,
          category: uploadForm.category,
        });
      }
    }

    await saveData({ ...data, photos: [...data.photos, ...newPhotos] });
    setUploading(false);
    setShowUpload(false);
    setUploadForm({ description: "", category: "日常", date: new Date().toISOString().split("T")[0] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这张照片吗？")) return;
    await saveData({ ...data, photos: data.photos.filter((p) => p.id !== id) });
    setSelectedPhoto(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2">
          <span>📸</span> 我们的相册
        </h1>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> 上传照片
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-pink-love to-purple-love text-white shadow-md"
                : "bg-white/80 text-gray-600 hover:bg-pink-love/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 上传表单 */}
      {showUpload && (
        <div className="card p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-pink-love mb-4">上传照片</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={uploadForm.date}
                  onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                  className="input-love"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="input-love"
                >
                  {categories.filter((c) => c !== "全部").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <input
                type="text"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="这张照片的故事..."
                className="input-love"
              />
            </div>
            <input type="file" ref={fileRef} onChange={handleUpload} multiple accept="image/*" className="hidden" />
            <div className="flex gap-3">
              <button onClick={() => fileRef.current?.click()} className="btn-primary" disabled={uploading}>
                {uploading ? "上传中..." : "选择照片"}
              </button>
              <button onClick={() => setShowUpload(false)} className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 照片网格 */}
      <div className="photo-grid">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="card overflow-hidden cursor-pointer group animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.url}
                alt={photo.description}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-600 truncate">{photo.description || photo.category}</p>
              <p className="text-xs text-gray-400">{photo.date}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-500">还没有照片，上传第一张照片吧~</p>
        </div>
      )}

      {/* 照片查看器 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto.url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <p className="text-white font-medium">{selectedPhoto.description}</p>
              <p className="text-white/70 text-sm">{selectedPhoto.date} · {selectedPhoto.category}</p>
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
            <button
              onClick={() => handleDelete(selectedPhoto.id)}
              className="absolute top-4 left-4 px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-sm transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
