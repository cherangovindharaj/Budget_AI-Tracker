import React, { useEffect, useState, useMemo } from 'react';
import { X, Send, ThumbsUp, ThumbsDown, MessageCircle, Filter, User, Download, FileText, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = 'http://localhost:8080/api';

export default function CommunityForum({ userData, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forum');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [commentText, setCommentText] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedPost, setExpandedPost] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const categories = ['General', 'Budget Tips', 'Saving Strategies', 'Investment', 'Debt Management', 'Questions'];

  // Load all posts from backend
  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/forum/posts`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading posts:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Create new post
  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const body = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        authorName: userData?.username || 'Guest',
        authorId: String(userData?.id || '0')
      };

      const res = await fetch(`${API}/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to create post');

      const saved = await res.json();
      setPosts((prev) => [saved, ...prev]);
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (e) {
      console.error('Error creating post:', e);
      alert('Failed to create post. Please try again.');
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    try {
      const userId = String(userData?.id || '0');
      const url = `${API}/forum/posts/${postId}?userId=${userId}`;
      
      console.log('=== FRONTEND DELETE REQUEST ===');
      console.log('Post ID:', postId);
      console.log('User ID:', userId);
      console.log('URL:', url);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (!res.ok) {
        let errorText;
        try {
          errorText = await res.text();
          console.log('Error response:', errorText);
        } catch (e) {
          errorText = 'Failed to delete post';
        }
        throw new Error(errorText || 'Failed to delete post');
      }

      const responseText = await res.text();
      console.log('Success response:', responseText);

      setPosts((prev) => prev.filter(p => p.id !== postId));
      alert('Post deleted successfully!');
    } catch (e) {
      console.error('Error deleting post:', e);
      alert('Failed to delete post: ' + e.message);
    }
  };

  // Like/Dislike post
  const reactPost = async (postId, type) => {
    try {
      const body = { userId: String(userData?.id || '0') };
      const res = await fetch(`${API}/forum/posts/${postId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`Failed to ${type} post`);

      const updated = await res.json();
      setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      console.error(`Error ${type}ing post:`, e);
    }
  };

  // Add comment to post
  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const body = {
        text,
        authorName: userData?.username || 'Guest',
        authorId: String(userData?.id || '0')
      };

      const res = await fetch(`${API}/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const updated = await res.json();
      setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (e) {
      console.error('Error adding comment:', e);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Filter posts by category
  const filtered = useMemo(
    () => selectedCategory === 'All Categories' 
      ? posts 
      : posts.filter(p => p.category === selectedCategory),
    [posts, selectedCategory]
  );

  // Fetch financial data for export
  const fetchFinanceData = async () => {
    try {
      const uid = userData?.id;
      const [expRes, incRes] = await Promise.all([
        fetch(`${API}/expenses/user/${uid}`),
        fetch(`${API}/incomes/user/${uid}`)
      ]);
      return {
        expenses: await expRes.json(),
        incomes: await incRes.json()
      };
    } catch (e) {
      console.error('Error fetching finance data:', e);
      return { expenses: [], incomes: [] };
    }
  };

  // Export as PDF
  const exportPDF = async () => {
    setExportLoading(true);
    try {
      const { expenses, incomes } = await fetchFinanceData();
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pad = 40;
      
      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('BUDGET AI — Financial Report', pad, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`User: ${userData?.username || 'Guest'}`, pad, 75);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pad, 92);
      
      // Income Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Income Summary', pad, 125);
      
      const incomeRows = (incomes || []).map(i => [
        String(i.id || ''),
        i.source || '-',
        `Rs ${Number(i.amount || 0).toFixed(2)}`,
        i.incomeDate ? new Date(i.incomeDate).toLocaleDateString('en-IN') : '-'
      ]);
      
      autoTable(doc, {
        startY: 140,
        head: [['ID', 'Source', 'Amount', 'Date']],
        body: incomeRows.length ? incomeRows : [['—', 'No incomes', '—', '—']],
        margin: { left: pad, right: pad },
        styles: { fontSize: 10 }
      });
      
      const totalIncome = (incomes || []).reduce((s, i) => s + Number(i.amount || 0), 0);
      let y = doc.lastAutoTable.finalY + 20;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Income: Rs ${totalIncome.toFixed(2)}`, pad, y);
      
      // Expenses Section
      y += 30;
      doc.setFontSize(14);
      doc.text('Expenses Summary', pad, y);
      
      const expenseRows = (expenses || []).map(e => [
        String(e.id || ''),
        e.category || '-',
        e.description || '-',
        `Rs ${Number(e.amount || 0).toFixed(2)}`,
        e.expenseDate ? new Date(e.expenseDate).toLocaleDateString('en-IN') : '-'
      ]);
      
      autoTable(doc, {
        startY: y + 15,
        head: [['ID', 'Category', 'Description', 'Amount', 'Date']],
        body: expenseRows.length ? expenseRows : [['—', '—', 'No expenses', '—', '—']],
        margin: { left: pad, right: pad },
        styles: { fontSize: 10 }
      });
      
      const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
      y = doc.lastAutoTable.finalY + 20;
      doc.text(`Total Expenses: Rs ${totalExpenses.toFixed(2)}`, pad, y);
      
      // Balance
      y += 20;
      const balance = totalIncome - totalExpenses;
      doc.setFontSize(12);
      doc.text(`Net Balance: Rs ${balance.toFixed(2)}`, pad, y);
      
      doc.save(`budget_report_${userData?.username}_${Date.now()}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Failed to export PDF: ' + e.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Convert to CSV
  const toCSV = (rows) => {
    if (!rows?.length) return '';
    const headers = Object.keys(rows[0]);
    const esc = (v) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [headers.join(',')]
      .concat(rows.map(r => headers.map(h => esc(r[h])).join(',')))
      .join('\n');
  };

  // Export CSV
  const exportCSV = async (type) => {
    setExportLoading(true);
    try {
      const { expenses, incomes } = await fetchFinanceData();
      const rows = type === 'expenses'
        ? (expenses || []).map(e => ({
            id: e.id,
            category: e.category,
            description: e.description || '',
            amount: e.amount,
            date: e.expenseDate
          }))
        : (incomes || []).map(i => ({
            id: i.id,
            source: i.source,
            amount: i.amount,
            date: i.incomeDate
          }));
      
      if (!rows.length) {
        alert('No data to export');
        return;
      }
      
      const csv = toCSV(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${userData?.username}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export error:', e);
      alert('Failed to export CSV');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle />
            <h2 className="text-lg font-semibold">Community Forum</h2>
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {posts.length} posts
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20"
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b p-2">
          {['forum', 'export'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-2 text-sm ${
                activeTab === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t === 'forum' ? 'Forum' : 'Export'}
            </button>
          ))}
        </div>

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="max-h-[78vh] overflow-y-auto p-4 space-y-6">
            {/* Create Post Section */}
            <div className="rounded-xl border p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{userData?.username || 'Guest'}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={newPost.title}
                  onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))}
                  placeholder="Post title"
                  className="col-span-2 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(p => ({ ...p, category: e.target.value }))}
                  className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))}
                placeholder="Share your thoughts..."
                rows={4}
                className="mt-3 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-3 flex items-center">
                <button
                  onClick={createPost}
                  className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" /> Share
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Filter className="h-4 w-4" /> Filter:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-full border px-3 py-1 text-sm"
              >
                <option>All Categories</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <button
                onClick={loadPosts}
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse rounded-xl border p-6 text-center text-gray-500">
                  Loading posts...
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border p-6 text-center text-gray-500">
                  No posts yet. Be the first to share!
                </div>
              ) : (
                filtered.map(post => (
                  <div key={post.id} className="rounded-xl border p-4 shadow-sm">
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold">{post.title}</h3>
                        <div className="mt-1 text-xs text-gray-500">
                          by {post.authorName} • {new Date(post.timestamp).toLocaleString()} •{' '}
                          <span className="rounded-full bg-gray-100 px-2 py-0.5">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => reactPost(post.id, 'like')}
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm text-green-700 hover:bg-green-100"
                        >
                          <ThumbsUp className="h-4 w-4" /> {post.likes}
                        </button>
                        <button
                          onClick={() => reactPost(post.id, 'dislike')}
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-sm text-red-700 hover:bg-red-100"
                        >
                          <ThumbsDown className="h-4 w-4" /> {post.dislikes}
                        </button>
                        {/* Delete button - only show for post author */}
                        {String(post.authorId) === String(userData?.id) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
                              if (confirmed) {
                                deletePost(post.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-sm text-red-700 hover:bg-red-100"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
                      {expandedPost === post.id
                        ? post.content
                        : post.content.slice(0, 220)}
                      {post.content?.length > 220 && expandedPost !== post.id ? '…' : ''}
                    </p>
                    {post.content?.length > 220 && (
                      <button
                        onClick={() => setExpandedPost(id => id === post.id ? null : post.id)}
                        className="mt-1 text-sm text-indigo-600 hover:underline"
                      >
                        {expandedPost === post.id ? 'Show less' : 'Read more'}
                      </button>
                    )}

                    {/* Comments Section */}
                    <div className="mt-3 border-t pt-3">
                      <div className="mb-2 text-xs text-gray-500">
                        {post.comments?.length || 0} comments
                      </div>
                      <div className="space-y-2">
                        {(post.comments || []).map(c => (
                          <div key={c.id} className="rounded-lg bg-gray-50 p-2">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">{c.authorName}</span> •{' '}
                              {new Date(c.timestamp).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-800">{c.text}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={commentText[post.id] || ''}
                          onChange={(e) =>
                            setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder="Write a comment…"
                          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="max-h-[78vh] overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* PDF Export */}
              <div className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div className="text-base font-semibold">Full Financial Report (PDF)</div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Complete report with all incomes, expenses, and totals in a professional PDF format.
                </p>
                <button
                  onClick={exportPDF}
                  disabled={exportLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  {exportLoading ? 'Generating…' : 'Export PDF'}
                </button>
              </div>

              {/* Expenses CSV */}
              <div className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <div className="text-base font-semibold">Expenses (CSV)</div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Export all your expenses in spreadsheet-friendly CSV format for Excel or Google Sheets.
                </p>
                <button
                  onClick={() => exportCSV('expenses')}
                  disabled={exportLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  {exportLoading ? 'Generating…' : 'Export CSV'}
                </button>
              </div>

              {/* Incomes CSV */}
              <div className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="text-base font-semibold">Incomes (CSV)</div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Export all your income records in spreadsheet-friendly CSV format for analysis.
                </p>
                <button
                  onClick={() => exportCSV('incomes')}
                  disabled={exportLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  {exportLoading ? 'Generating…' : 'Export CSV'}
                </button>
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">📊 Export Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PDF includes complete financial summary with all transactions</li>
                <li>CSV files can be opened in Excel, Google Sheets, or any spreadsheet software</li>
                <li>All exports include your latest data from the database</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}