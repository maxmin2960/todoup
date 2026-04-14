"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const PRESET_IMAGES = [
  { id: "dog1", src: "/dog1.jpg", label: "1" },
  { id: "dog2", src: "/dog2.jpg", label: "2" },
  { id: "dog3", src: "/dog3.jpg", label: "3" },
  { id: "dog4", src: "/dog4.jpg", label: "4" },
  { id: "dog5", src: "/dog5.jpg", label: "5" },
  { id: "dog6", src: "/dog6.jpg", label: "6" },
  { id: "dog7", src: "/dog7.jpg", label: "7" },
  { id: "dog8", src: "/dog8.jpg", label: "8" },
  { id: "dog9", src: "/dog9.jpg", label: "9" },
  { id: "dog10", src: "/dog10.jpg", label: "10" },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [bgImage, setBgImage] = useState<string>(PRESET_IMAGES[0].src);
  const [bgIsCustom, setBgIsCustom] = useState(false);
  const [showBgPanel, setShowBgPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
    const savedBg = localStorage.getItem("bgImage");
    const savedIsCustom = localStorage.getItem("bgIsCustom") === "true";
    if (savedBg) {
      setBgImage(savedBg);
      setBgIsCustom(savedIsCustom);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const selectPreset = (src: string) => {
    setBgImage(src);
    setBgIsCustom(false);
    localStorage.setItem("bgImage", src);
    localStorage.setItem("bgIsCustom", "false");
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setBgImage(result);
      setBgIsCustom(true);
      localStorage.setItem("bgImage", result);
      localStorage.setItem("bgIsCustom", "true");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <div className="w-full max-w-lg mb-8">
        <div className="backdrop-blur-md bg-white/60 rounded-2xl px-6 py-5 shadow-lg border border-white/70">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-amber-900">
                🐾 やることワン！
              </h1>
              <p className="text-base text-amber-800 mt-1 font-medium">
                {activeCount > 0
                  ? `あと${activeCount}個残ってるワン…`
                  : doneCount > 0
                  ? "ぜんぶできたワン！えらいワン！🎉"
                  : "タスクを追加するワン🐶"}
              </p>
            </div>
            {/* Background toggle button */}
            <button
              onClick={() => setShowBgPanel((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-700/50 hover:text-amber-700 hover:bg-amber-50/60 transition"
              title="背景をかえるワン"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.25h.008v.008H3V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
          </div>

          {/* Background panel */}
          {showBgPanel && (
            <div className="mt-4 pt-4 border-t border-amber-100">
              <p className="text-xs text-amber-800/60 mb-2 font-medium">背景をえらぶワン🐾</p>
              {/* Preset grid */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => selectPreset(img.src)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      bgImage === img.src && !bgIsCustom
                        ? "border-amber-500 shadow-md"
                        : "border-white/60 hover:border-amber-300"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={`背景${img.label}`}
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                  </button>
                ))}
              </div>
              {/* Upload button */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition border border-amber-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                じぶんの写真をつかうワン
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="w-full max-w-lg flex gap-2 mb-6">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="やることを入力するワン…"
          className="flex-1 px-4 py-3 rounded-xl backdrop-blur-md bg-white/80 border border-white/80 text-stone-900 text-base placeholder-stone-400 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
        />
        <button
          onClick={addTask}
          disabled={!input.trim()}
          className="px-5 py-3 rounded-xl bg-amber-700 backdrop-blur-md text-white text-base font-bold shadow-md hover:bg-amber-600 active:bg-amber-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          追加ワン
        </button>
      </div>

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <div className="w-full max-w-lg flex gap-1 mb-4 backdrop-blur-md bg-white/50 border border-white/70 p-1 rounded-xl shadow">
          {(
            [
              { key: "all", label: "ぜんぶ" },
              { key: "active", label: "まだワン" },
              { key: "done", label: "できたワン" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 rounded-lg text-base font-bold transition ${
                filter === key
                  ? "bg-white/90 text-amber-800 shadow-sm"
                  : "text-stone-600 hover:text-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="w-full max-w-lg space-y-2">
        {filtered.length === 0 && tasks.length > 0 && (
          <p className="text-center text-white py-10 text-base font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            がいとうするタスクはないワン
          </p>
        )}

        {filtered.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl backdrop-blur-md border shadow-md transition ${
              task.done
                ? "bg-emerald-50/80 border-emerald-200/70"
                : "bg-white/80 border-white/80 hover:bg-white/90"
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                task.done
                  ? "bg-amber-400 border-amber-400"
                  : "border-amber-300 hover:border-amber-500"
              }`}
              aria-label={task.done ? "まだワンにもどす" : "できたワンにする"}
            >
              {task.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Text */}
            <span
              className={`flex-1 text-base font-medium leading-relaxed ${
                task.done ? "line-through decoration-2 text-stone-500" : "text-stone-900"
              }`}
            >
              {task.text}
            </span>

            {/* Delete button */}
            <button
              onClick={() => deleteTask(task.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-50/80 transition"
              aria-label="けすワン"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Clear done */}
      {doneCount > 0 && (
        <div className="w-full max-w-lg mt-6 flex justify-end">
          <button
            onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
            className="text-sm font-medium text-white hover:text-red-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition"
          >
            できたワンをぜんぶけすワン
          </button>
        </div>
      )}

      {/* Overlay to close bg panel */}
      {showBgPanel && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setShowBgPanel(false)} />
      )}
    </main>
  );
}
