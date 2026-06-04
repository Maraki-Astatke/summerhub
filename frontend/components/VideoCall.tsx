'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  roomUrl: string;
  userName: string;
  onLeave: () => void;
}

export default function VideoCall({ roomUrl, userName, onLeave }: VideoCallProps) {
  const iframeRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      if (!iframeRef.current || callFrameRef.current) return;

      try {
        const DailyIframe = (await import('@daily-co/daily-js')).default;

        const frame = DailyIframe.createFrame(iframeRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          userName: userName,
          lang: 'en'
        });

        callFrameRef.current = frame;

        await frame.join({ url: roomUrl });

        if (isMounted) {
          setIsLoading(false);
        }

        frame.on('left-meeting', () => {
          if (isMounted) {
            onLeave();
          }
        });

      } catch (error) {
        console.error('Failed to initialize video call:', error);
        if (isMounted) {
          onLeave();
        }
      }
    };

    initCall();

    return () => {
      isMounted = false;
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [roomUrl, userName, onLeave]);

  const toggleAudio = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
    onLeave();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Joining video call...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={iframeRef} className="w-full h-full" />
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-10">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={leaveCall}
          className="rounded-full w-12 h-12 p-0"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}