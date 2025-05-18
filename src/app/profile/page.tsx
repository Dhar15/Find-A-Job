  'use client';

  import { useSession, signOut } from 'next-auth/react';
  import { useEffect, useRef, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import Image from 'next/image';
  import { Pencil } from 'lucide-react';

  export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    //const [guestSession, setGuestSession] = useState<any>(null);
    const [guestSession, setGuestSession] = useState<{ user: { name: string; email: string; image: string } } | null>(null);
    const [form, setForm] = useState({ name: '', email: '', image: '' });

    const [editingField, setEditingField] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isGuest = !session?.user;

    useEffect(() => {
      if (status === 'unauthenticated') {
        if (typeof window !== 'undefined') {
          const guest = localStorage.getItem('guestSession');
          if (guest) {
            const parsed = JSON.parse(guest);
            setGuestSession(parsed);
            setForm({
              name: parsed.user?.name || '',
              email: parsed.user?.email || '',
              image: parsed.user?.image || '',
            });
          } else {
            setTimeout(() => router.replace('/'), 0);
          }
        }
      }

      if (status === 'authenticated' && session?.user) {
        setForm({
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || '',
        });
      }
    }, [status, session, router]);

    const user = session?.user || guestSession?.user;
    if ((status === 'loading' || !user) && !guestSession) return <p>Loading...</p>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSaveField = (field: string) => {
      void field;
      const updated = { user: { ...form } };
      localStorage.setItem('guestSession', JSON.stringify(updated));
      setGuestSession(updated);
      setEditingField(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setForm({ ...form, image: base64 });

        const updated = { user: { ...form, image: base64 } };
        localStorage.setItem('guestSession', JSON.stringify(updated));
        setGuestSession(updated);
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
          {isGuest && (
            <div className="bg-yellow-100 text-yellow-800 text-sm rounded-md px-4 py-2 mb-4 border border-yellow-300">
              Note: You are viewing a guest profile. Updated values will persist only for the current session duration.
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Profile</h1>

          <div className="flex flex-col items-center">
            <div className="relative group">
              <Image
                src={form.image || '/default-avatar.png'}
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />

              {isGuest && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4 text-gray-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Editable Name */}
            <div className="mt-6 w-full text-left">
              <label className="block text-sm text-gray-500">Name</label>
              <div className="flex items-center gap-2">
                {editingField === 'name' ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="p-2 border rounded w-full text-sm text-gray-800"
                    />
                    <button
                      onClick={() => handleSaveField('name')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 text-lg font-medium">{form.name}</p>
                    {isGuest && (
                      <button onClick={() => setEditingField('name')}>
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Editable Email */}
            <div className="mt-4 w-full text-left">
              <label className="block text-sm text-gray-500">Email</label>
              <div className="flex items-center gap-2">
                {editingField === 'email' ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="p-2 border rounded w-full text-sm text-gray-800"
                    />
                    <button
                      onClick={() => handleSaveField('email')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700">{form.email}</p>
                    {isGuest && (
                      <button onClick={() => setEditingField('email')}>
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => {
                localStorage.removeItem('guestSession');
                sessionStorage.removeItem('justLoggedIn');
                signOut({
                  callbackUrl: '/',
                  redirect: true,
                });
              }}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }


