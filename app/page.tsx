"use client";

import { useState, useEffect, useRef } from "react";

type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const DEFAULT_BG = "/bg.jpg";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [bgImage, setBgImage] = useState<string>(DEFAULT_BG);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
    const savedBg = localStorage.getItem("bgImage");
    if (savedBg) setBgImage(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setBgImage(result);
      localStorage.setItem("bgImage", result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const resetBg = () => {
    setBgImage(DEFAULT_BG);
    localStorage.removeItem("bgImage");
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
      <div className="w-full max-w-lg mb-10">
        <div className="backdrop-blur-md bg-white/60 rounded-2xl px-6 py-5 shadow-lg border border-white/70">
          <h1 className="text-3xl font-bold tracking-tight text-amber-900">
            🐾 やること
          </h1>
          <p className="text-sm text-amber-700/70 mt-1">
            {activeCount > 0
              ? `${activeCount}件のタスクが残っています`
              : doneCount > 0
              ? "すべて完了！お疲れさまでした 🎉"
              : "タスクを追加してはじめましょう"}
          </p>

          {/* Background controls */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-amber-100">
            <span className="text-xs text-amber-700/60">背景画像</span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition border border-amber-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              アップロード
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
              />
            </label>
            {bgImage !== DEFAULT_BG && (
              <button
                onClick={resetBg}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-500 text-xs font-medium transition border border-stone-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                デフォルトに戻す
              </button>
            )}
          </div>
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
          placeholder="新しいタスクを入力..."
          className="flex-1 px-4 py-3 rounded-xl backdrop-blur-md bg-white/70 border border-white/80 text-stone-800 placeholder-stone-400 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
        />
        <button
          onClick={addTask}
          disabled={!input.trim()}
          className="px-5 py-3 rounded-xl bg-amber-700/80 backdrop-blur-md text-white font-medium shadow-md hover:bg-amber-600/90 active:bg-amber-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          追加
        </button>
      </div>

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <div className="w-full max-w-lg flex gap-1 mb-4 backdrop-blur-md bg-white/50 border border-white/70 p-1 rounded-xl shadow">
          {(
            [
              { key: "all", label: "すべて" },
              { key: "active", label: "未完了" },
              { key: "done", label: "完了" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                filter === key
                  ? "bg-white/90 text-amber-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
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
          <p className="text-center text-white/70 py-10 text-sm drop-shadow">
            該当するタスクはありません
          </p>
        )}

        {filtered.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl backdrop-blur-md border shadow-md transition ${
              task.done
                ? "bg-white/40 border-white/50 opacity-70"
                : "bg-white/65 border-white/75 hover:bg-white/75"
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
              aria-label={task.done ? "未完了に戻す" : "完了にする"}
            >
              {task.done && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Text */}
            <span
              className={`flex-1 text-sm leading-relaxed ${
                task.done ? "line-through text-stone-400" : "text-stone-800"
              }`}
            >
              {task.text}
            </span>

            {/* Delete button */}
            <button
              onClick={() => deleteTask(task.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-50/80 transition"
              aria-label="削除"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
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
            className="text-xs text-white/70 hover:text-red-300 drop-shadow transition"
          >
            完了済みをすべて削除
          </button>
        </div>
      )}
    </main>
  );
}
