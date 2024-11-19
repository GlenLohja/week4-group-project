'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from '../components/Toast'

type Song = {
    id: number;
    name: string;
    singer: string;
    description: string;
    created_at: string;
    cover_image: string;
    genius_id: number;
    song_url: string;
};
type Playlist = {
    id: number,
    name: string,
    created_at: string
}

export default function Music() {
    const { user, isAuthenticated, loading, logout } : any = useAuth();
    const router = useRouter();
    const [songs, setSongs] = useState<Song[] | null>(null);
    const [message, setMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(false);

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      } else {

        // fetchMusic();
        fetchPlaylists();

      }
    }, [isAuthenticated, loading, router]);
    
    const fetchMusic = async (selectedPlaylist : number) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
            const res = await fetch(`https://week4-group-project.onrender.com/api/songs/${selectedPlaylist}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSongs(data.songs)
                setSelectedPlaylist(true)
            } else {
                setMessage('No songs saved!')
            }
            } catch (err) {
                setMessage('Error fetching profile songs')
            } finally {
                console.log('here2')
            }
        }
    };


    const fetchPlaylists = async () => {
        const token = localStorage.getItem('token');
        try {
    
          if (token) {
      
            const res = await fetch(`https://week4-group-project.onrender.com/api/playlists`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
            });
      
            if (res.ok) {
              const data = await res.json();
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

      
    const handleRemoveFromPlaylist = async(songId : number) => {
        const token = localStorage.getItem('token');
        console.log(songId);
        if (token) {

            try {
                const res = await fetch(`https://week4-group-project.onrender.com/api/songs/${songId}`, {
                    method: 'DELETE',
                    headers: {'Authorization': `Bearer ${token}`},
                });

                if (res.ok) {
                    const data = await res.json();
                    const updatedSongs : any = songs?.filter((song) => song.genius_id !== songId);
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
 

            {!selectedPlaylist && (
                
                <>

                    <h1 className="text-center font-semibold text-xl">Your playlists!</h1>
   
                    <div className='grid grid-cols-3'>

                        {playlists?.map((playlist) => (

                            <div key={playlist.id} className="my-10 px-7 cursor-pointer" onClick={() => fetchMusic(playlist.id)}>

                                <div className="w-full h-full flex flex-col p-4 border-2 rounded-lg border-gray-300 rounded-lg">
                                    {playlist.name == 'Favorites' ? 
                                    <img src={`https://i1.sndcdn.com/artworks-y6qitUuZoS6y8LQo-5s2pPA-t1080x1080.jpg`}></img> :
                                    <img src={`https://picsum.photos/250/${playlist.id + 200}`} />}
                                    <h1 className="font-semibold text-lg text-black mt-3">{playlist.name}</h1>
                                    <img className="h-5 w-16 mt-6" src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Black.png"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {songs && selectedPlaylist && (
                <>  

                    <h1 className="text-center font-semibold text-xl ">You have {songs.length} saved songs!</h1>
                    <div className='grid justify-items-start grid-cols-2 '>

                        <a className="cursor-pointer text-white font-semibold bg-blue-600 mx-10 px-5  py-2 rounded-lg" onClick={() => setSelectedPlaylist(false)}>Back</a>
                    </div>
                    {songs.map((song) => {
                        const date = new Date(song.created_at);
                        const formattedDate = new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }).format(date);

                        return (
                            <div key={song.id} className="max-w-full w-full lg:flex px-6 py-6 lg:px-8">
                            <div 
                              className="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-lg lg:rounded-r text-center overflow-hidden" 
                              style={{ backgroundImage: `url('${song.cover_image}')` }} 
                              title="Song image"
                            >
                            </div>
                            <div className="border-r border-b rounded-lg border-l border-gray-100 lg:border-l-0 lg:border-t lg:border-gray-300 bg-white rounded-b lg:rounded-l p-6 flex flex-col justify-between leading-normal w-full">
                              <div className="mb-8">
                                <div className="text-gray-900 font-bold text-xl mb-2">{song.name}</div>
                                <p className="text-gray-900 leading-none">{song.singer}</p>
                                <p className="text-gray-600">{formattedDate}</p>
                              </div>
                              <div className="flex items-center justify-between"> {/* Use justify-between to push button to the right */}
    
                                    <iframe
                                        src={song.song_url}
                                        title="Song Preview"
                                        height="70"
                                        width="520"
                                        allow="autoplay *; encrypted-media *;"
                                    ></iframe>
                                    <button  onClick={() => handleRemoveFromPlaylist(song.genius_id)} className="text-white px-4 bg-red-500  py-2 rounded-lg">Remove from playlist</button> {/* Save button */}
                              </div>
                            </div>
                          </div>
                          );

                        })}
                        {showToast && (
                          <Toast 
                            message="Music was removed from your playlist!" 
                            onClose={() => setShowToast(false)} 
                          />
                        )}
                </>
            )}
        </>
    );

}