import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Blog } from '../types';
import '../styles/manageBlog.css';
import { useAppDispatch } from '../hooks';
import { clearSession } from '../slice/sessionSlice';

type ManageBlogProps = {
  userEmail: string;
};

const BLOGS_PER_PAGE = 5;

function ManageBlog({ userEmail }: ManageBlogProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const fetchBlogs = useCallback(async () => {
    const from = (currentPage - 1) * BLOGS_PER_PAGE;
    const to = from + BLOGS_PER_PAGE - 1;

    const [{ data, error }, { count }] = await Promise.all([
      supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('blog')
        .select('id', { count: 'exact', head: true }),
    ]);

    if (error) {
      console.error(error);
    } else {
      setBlogs(data || []);
      setTotalBlogs(count || 0);
    }
  }, [currentPage]);

  const addBlog = async () => {
    if (!title || !content) return;

    const { error } = await supabase
      .from('blog')
      .insert([{ title, content, email: userEmail }]);

    if (error) {
      console.error(error);
      return;
    }

    setTitle('');
    setContent('');
    setCurrentPage(1);
    setTimeout(() => {
      fetchBlogs();
    }, 0);
  };

  const deleteBlog = async (id: number) => {
    const { error } = await supabase
      .from('blog')
      .delete()
      .eq('id', id)
      .eq('email', userEmail);
    if (error) console.error(error);
    fetchBlogs();
  };

  const startEditing = (blog: Blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
  };

  const updateBlog = async () => {
    if (!editingId || !title || !content) return;
    const { error } = await supabase
      .from('blog')
      .update({ title, content })
      .eq('id', editingId)
      .eq('email', userEmail);
    if (error) console.error(error);
    setEditingId(null);
    setTitle('');
    setContent('');
    fetchBlogs();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    dispatch(clearSession());
    navigate('/');
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalBlogs / BLOGS_PER_PAGE)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, fetchBlogs]);

  return (
    <div className="container">
      <div className="header">
      <span className="user-email">Logged in as: {userEmail}</span>
      <h1 className="title">Blog App</h1>
      <div className="user-info">
        <button className="button logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="form">
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {editingId ? (
          <div>
            <button className="button" onClick={updateBlog}>Update Post</button>
            <button className="button cancel" onClick={cancelEdit}>Cancel</button>
          </div>
        ) : (
          <button className="button" onClick={addBlog}>Add Post</button>
        )}
      </div>

      {blogs.map((blog) => (
        <div key={blog.id} className="blog-card">
          <h2 className="blog-title">{blog.title}</h2>
          <p className="blog-content">{blog.content}</p>
          <p className="blog-email">Posted by: {blog.email}</p>
          <p className="blog-date">{new Date(blog.created_at).toLocaleString()}</p>
          {blog.email === userEmail && (
            <div className="actions">
              <button className="button edit" onClick={() => startEditing(blog)}>Edit</button>
              <button className="button delete" onClick={() => deleteBlog(blog.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}

      <div className="pagination">
        <button className="button" onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {Math.ceil(totalBlogs / BLOGS_PER_PAGE)}
        </span>
        <button
          className="button"
          onClick={nextPage}
          disabled={currentPage >= Math.ceil(totalBlogs / BLOGS_PER_PAGE)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ManageBlog;
