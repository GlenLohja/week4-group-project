'use client';
import Image from "next/image";

import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from './components/Toast'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type Song = {
  id: number;
  title_with_featured: string;
  artist_names: string;
  url: string;
  release_date_for_display: string;
  header_image_url: string;
  isSaved: boolean;
  api_path: string;
};

type Playlist = {
  id: number,
  name: string,
  created_at: string
}

export default function Home() {

  const { user, isAuthenticated, loading, logout } : any = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [message, setMessage] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [query, setQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [open, setOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState('')


  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else {
      fetchMusic('');
      fetchPlaylists();
    }
  }, [isAuthenticated, loading, router]);
  
  const fetchPlaylists = async () => {
    const token = localStorage.getItem('token');
    try {

      if (token) {
  
        const res = await fetch(`http://localhost:3000/api/playlists`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
  
        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setPlaylists(data.playlists)
        } else {
            setMessage('No songs saved!')
        }
      }
    } catch (err) {
          setMessage('Error fetching profile songs')
    } finally {
          // console.log('here2')
    }
  } 

  const fetchMusic = async (query : string) => {
      const token = localStorage.getItem('token');
      if (token) {
          try {
            if (query !== "") {
              
              const res = await fetch(`http://localhost:3000/api/music?searchQuery=${query}`, {
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` },
              });
              if (res.ok) {
                  const data = await res.json();
                  setSongs(data)
              } else {
                  setMessage('No songs saved!')
              }
            } else {
              setSongs(null)
            }
          } catch (err) {
              setMessage('Error fetching profile songs')
          } finally {
              // console.log('here2')
          }
      }
  };

  const handleInputChange = (e : any) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Debounced API call or call API directly
    fetchMusic(newQuery);
  };

  const handleSavePlaylist = async (playlist_name : string) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (query !== "") {
          
          const res = await fetch('http://localhost:3000/api/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },

            body: JSON.stringify(
              { 
                playlist_name: playlist_name
              }), // Send songId in the body
          });

          if (res.ok) {
              const data = await res.json();
              console.log(data)
              setMessage(`Playlist was added successfully!`);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
              setPlaylists(data.playlists)
              setOpen(false)
          } else {
              setMessage('No playlist saved!')
          }
        }
      } catch (err) {
          setMessage('Error saving playlist')
      } finally {
          // console.log('here2')
      }
    }

  };

  const handleSave = async (songId : number, playlistId: number) => {
    try {
        const songToSave = songs?.find((song) => song.id === songId);
        console.log(songToSave?.artist_names)
        const token = localStorage.getItem('token');

        // Send POST request
        const response = await fetch('http://localhost:3000/api/save-song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },

            body: JSON.stringify(
              { id: songId, 
                singer: songToSave?.artist_names,
                title: songToSave?.title_with_featured,
                created_date: songToSave?.release_date_for_display,
                description: songToSave?.url,
                cover: songToSave?.header_image_url,
                playlistId: playlistId,
                url: `https://genius.com${songToSave?.api_path}/apple_music_player`
              }), // Send songId in the body
        });

        const result = await response.json();

        if (response.ok) {
            setMessage(`Song was added to your playlist!`);
            const updatedSongs : any = songs?.map((song) =>
              song.id === songId ? { ...song, isSaved: true } : song
            );
            setSongs(updatedSongs);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } else {
            setMessage(`Error: ${result.message}`);
        }
    } catch (error) {
        setMessage(`Request failed: ${error}`);
    }
  };

  const handleRemoveFromPlaylist = async(songId : number) => {
    const token = localStorage.getItem('token');
    console.log(songId);
    if (token) {

        try {
            const res = await fetch(`http://localhost:3000/api/songs/${songId}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`},
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(`Song was removed from your playlist!`);
                const updatedSongs : any = songs?.map((song) =>
                  song.id === songId ? { ...song, isSaved: false } : song
                );
                setSongs(updatedSongs);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            } else {

                console.log('err')
            }
        } catch (err) {
                setMessage('Error fetching profile songs')
        } finally {
            console.log('here2')
        }
        
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>Redirecting...</p>;
  }


  return (
    <>
      <div className="relative isolate px-3 pt-14 lg:px-8">

        <div className="mx-auto max-w-2xl py-6 sm:py-48 lg:py-20">

          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
              Search for songs
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              <input type="text" value={query} onChange={handleInputChange} placeholder="Search a song" className="block  mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40" />
            </p>
          </div>
        </div>
      </div>

      {songs?.map((song) => {
          const date = new Date(song.release_date_for_display);
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          }).format(date);

          return (
            <div key={song.id} className="max-w-full w-full lg:flex px-6 py-6 lg:px-8">
            <div 
              className="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-lg lg:rounded-r text-center overflow-hidden" 
              style={{ backgroundImage: `url('${song.header_image_url}')` }} 
              title="Song image"
            >
            </div>
            <div className="border-r border-b rounded-lg border-l border-gray-100 lg:border-l-0 lg:border-t lg:border-gray-300 bg-white rounded-b lg:rounded-l p-6 flex flex-col justify-between leading-normal w-full">
              <div className="mb-8">
                <div className="text-gray-900 font-bold text-xl mb-2">{song.title_with_featured}</div>
                {/* <p className="text-gray-700 text-base">{song.url}</p> */}
                  <p className="text-gray-900 leading-none">{song.artist_names}</p>
                  <p className="text-gray-600">{formattedDate}</p>
              </div>
              <div className="flex items-center justify-between"> {/* Use justify-between to push button to the right */}
                <div className="text-sm">
                  <iframe
                    src={`https://genius.com${song.api_path}/apple_music_player`}
                    title="Song Preview"
                    height="70"
                    width="490"
                    allow="autoplay *; encrypted-media *;"
                ></iframe>
                </div>
                {song.isSaved && (
                  <button onClick={() => handleRemoveFromPlaylist(song.id)} className="text-white px-4 py-2 bg-red-500 rounded-lg">Remove from playlist</button>
                )}
                {!song.isSaved && (
                  // <button onClick={() => handleSave(song.id)} style={{ backgroundColor: '#1ed760' }} className="text-white px-4 py-2 rounded-lg bg-red-500">Save to playlist</button> 
                  
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Save to a playlist
                        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                      </MenuButton>
                    </div>
                    

                      <MenuItems transition
                        key = {song.id}
                        
                        className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                        {playlists?.map((playlist) => (
                          <MenuItem key={playlist.id}>
                            <button
                              onClick={() => handleSave(song.id, playlist.id)}
                              className="block text-left w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                            >
                              {playlist.name}
                            </button>
                          </MenuItem>
                          ))}
                          <MenuItem>
                            <button
                              onClick={() => setOpen(true)}
                              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                            >
                              Create new playlist
                            </button>
                          </MenuItem>
                      </MenuItems>
                  </Menu>
      
                )}
              </div>
            </div>
          </div>
          );
      })}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10">
                  {/* <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" /> */}
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    Create a playlist
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <input value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Playlist name"></input>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => handleSavePlaylist(playlistName)}
                className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                style={{ backgroundColor: '#1ed760' }}
              >
                Create Playlist
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

      {showToast && (
        <Toast 
          message={message}
          onClose={() => setShowToast(false)} 
        />
      )}
    </>
  );
}
