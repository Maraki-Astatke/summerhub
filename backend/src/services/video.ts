import axios from 'axios';

const DAILY_API_URL = process.env.DAILY_API_URL;
const DAILY_API_KEY = process.env.DAILY_API_KEY;

export async function createRoom(roomName: string) {
  try {
    const response = await axios.post(
      `${DAILY_API_URL}/rooms`,
      {
        name: roomName,
        privacy: 'public',
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          lang: 'en'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Daily.co room creation error:', error);
    throw error;
  }
}

export async function deleteRoom(roomName: string) {
  try {
    await axios.delete(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`
      }
    });
  } catch (error) {
    console.error('Daily.co room deletion error:', error);
  }
}
