import { useState } from 'react';
import { supabase } from '../supabase';
import '../styles/LoginSignup.css';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setSession } from '../slice/sessionSlice';

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleAuth = async () => {
    if (!email || !password) return setMessage('Please fill in all fields.');

    if (isLogin) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        setMessage('Invalid credentials.');
      } else {
        setMessage(`Welcome back, ${email}!`);
        dispatch(setSession({ user: { email } }));
        navigate('/manage');
      }
    } else {
      const { error } = await supabase
        .from('accounts')
        .insert([{ email, password }]);

      if (error) {
        setMessage('Sign up failed: ' + error.message);
      } else {
        setMessage('Account created successfully. You can now log in.');
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="login-container">
      <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="login" onClick={handleAuth}>
        {isLogin ? 'Login' : 'Sign Up'}
      </button>

      <p className="Info">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
          }}
          className="text-blue-500 underline"
        >
          {isLogin ? 'Sign up' : 'Login'}
        </button>
      </p>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}
