'use client';

import { useEffect, useState, FormEvent, KeyboardEvent } from 'react';
import { trackEvent } from './GoogleAnalytics';

interface Note {
  id: number;
  content: string;
  author: string;
  created_at: string;
}

export function NotesBoard({ gaEnabled }: { gaEnabled: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusTip, setStatusTip] = useState('');

  async function fetchNotes() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notes', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '加载失败');
      }
      setNotes(data.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取数据失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function submitNote() {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('请先输入一点内容再提交');
      return;
    }

    setSubmitting(true);
    setError('');
    setStatusTip('');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim(),
          content: trimmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '提交失败');
      }

      setNotes((prev) => [data.note, ...prev]);
      setContent('');
      setStatusTip('已写入 Supabase 云端数据库');
      trackEvent('submit_note', {
        has_author: Boolean(author.trim()),
        content_length: trimmed.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitNote();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submitNote();
    }
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <div className="badges">
          <span className="badge badge-green">Supabase 数据库已接入</span>
          <span className="badge badge-blue">Next.js 全栈 API 代理</span>
          <span className={`badge ${gaEnabled ? 'badge-green' : 'badge-gray'}`}>
            {gaEnabled ? 'GA4 埋点已启用' : 'GA4 埋点待填入 ID'}
          </span>
        </div>
        <h1>AI 产品灵感墙</h1>
        <p className="subtitle">
          全流程打通演示版：前端输入 → Next.js 后端接口 → Supabase 云端持久化存储
        </p>
      </header>

      <section className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="author">你的署名（选填）</label>
            <input
              id="author"
              type="text"
              maxLength={30}
              placeholder="例如：产品小张（留空默认匿名访客）"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="label-row">
              <label htmlFor="content">记一条产品灵感 / 测试留言</label>
              <span className="counter">{content.length} / 500</span>
            </div>
            <textarea
              id="content"
              rows={3}
              maxLength={500}
              placeholder="写点什么试试，提交后刷新网页数据依然存在…（Ctrl/Cmd + Enter 快捷发送）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <p className="feedback error">{error}</p>}
          {statusTip && <p className="feedback success">{statusTip}</p>}

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '正在写入云端...' : '发布到 Supabase'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                trackEvent('refresh_notes');
                fetchNotes();
              }}
              disabled={loading}
            >
              {loading ? '刷新中...' : '刷新列表'}
            </button>
          </div>
        </form>
      </section>

      <section className="feed-section">
        <div className="feed-header">
          <h2>云端记录（{notes.length}）</h2>
        </div>

        {loading && notes.length === 0 ? (
          <div className="empty-state">正在从 Supabase 读取数据...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">数据库里还没有记录，发第一条试试吧！</div>
        ) : (
          <ul className="notes-list">
            {notes.map((note) => (
              <li key={note.id} className="card note-item">
                <p className="note-content">{note.content}</p>
                <div className="note-meta">
                  <span className="note-author">{note.author}</span>
                  <span className="note-time">{formatTime(note.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
