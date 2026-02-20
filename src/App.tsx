/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Youtube, Loader2, Play, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoFormat {
  quality: string;
  container: string;
  url: string;
  itag: number;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  formats: VideoFormat[];
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video info');
      }

      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: string) => {
    const s = parseInt(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-red-100">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Youtube className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">YouTube <span className="text-red-600">Downloader</span></span>
          </div>
          <div className="text-xs font-medium text-black/40 uppercase tracking-widest">v1.0.0</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              تنزيل فيديوهات اليوتيوب <br />
              <span className="text-black/40">بكل سهولة وبساطة</span>
            </h1>
            <p className="text-black/60 max-w-lg mx-auto">
              الصق رابط الفيديو أدناه للحصول على خيارات التنزيل المتاحة.
            </p>
          </div>

          <form onSubmit={fetchInfo} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                dir="ltr"
                className="w-full h-16 pl-6 pr-32 bg-white border border-black/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-lg"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="absolute right-2 top-2 bottom-2 px-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                تحليل
              </button>
            </div>
          </form>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-medium">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-5 gap-8 items-start"
            >
              {/* Thumbnail & Info */}
              <div className="md:col-span-2 space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-mono rounded">
                    {formatDuration(videoInfo.duration)}
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-xl leading-tight mb-1">{videoInfo.title}</h2>
                  <p className="text-black/40 text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    {videoInfo.author}
                  </p>
                </div>
              </div>

              {/* Download Options */}
              <div className="md:col-span-3 bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Download className="w-5 h-5 text-red-600" />
                    خيارات التنزيل
                  </h3>
                  <span className="text-xs font-mono text-black/40">MP4 Format</span>
                </div>
                <div className="divide-y divide-black/5">
                  {videoInfo.formats.length > 0 ? (
                    videoInfo.formats.map((format, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold text-xs">
                            {format.quality}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">Video + Audio</div>
                            <div className="text-xs text-black/40 uppercase">{format.container}</div>
                          </div>
                        </div>
                        <a
                          href={`/api/download?url=${encodeURIComponent(url)}&itag=${format.itag}`}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-black/80 transition-all flex items-center gap-2"
                        >
                          تنزيل
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-black/40 italic">
                      لا توجد صيغ متاحة حالياً لهذا الفيديو.
                    </div>
                  )}
                </div>
                <div className="p-4 bg-black/5 text-[10px] text-center text-black/40 uppercase tracking-widest">
                  تم الاستخراج بواسطة ytdl-core
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features / Help */}
        {!videoInfo && !loading && (
          <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold mb-2">كيفية الاستخدام</h4>
              <p className="text-sm text-black/60 leading-relaxed">
                انسخ رابط الفيديو من يوتيوب، الصقه في المربع أعلاه، واضغط على زر "تحليل".
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold mb-2">جودات متعددة</h4>
              <p className="text-sm text-black/60 leading-relaxed">
                نوفر لك خيارات متنوعة من الجودات المتاحة للفيديو (360p, 720p, 1080p).
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold mb-2">آمن وسريع</h4>
              <p className="text-sm text-black/60 leading-relaxed">
                عملية التنزيل تتم مباشرة من خوادم يوتيوب لضمان السرعة والأمان.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-black/5 text-center">
        <p className="text-xs text-black/40 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} YouTube Downloader - Made with ❤️
        </p>
      </footer>
    </div>
  );
}
