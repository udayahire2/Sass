import { cn } from "@/lib/utils";
import {

    Pause,
    Play,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
} from "lucide-react";
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// Context
interface VideoPlayerContextType {
    isPlaying: boolean;
    togglePlay: () => void;
    volume: number;
    handleVolumeChange: (value: number | readonly number[]) => void;
    currentTime: number;
    duration: number;
    handleSeek: (value: number | readonly number[]) => void;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isMuted: boolean;
    toggleMute: () => void;
    seekBackward: () => void;
    seekForward: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

const useVideoPlayer = () => {
    const context = useContext(VideoPlayerContext);
    if (!context) {
        throw new Error("useVideoPlayer must be used within a VideoPlayer");
    }
    return context;
};

// Components
interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const VideoPlayer = ({ className, children, ...props }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(true); // Start muted as requested

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("loadedmetadata", updateDuration);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);

        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("loadedmetadata", updateDuration);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleVolumeChange = (value: number | readonly number[]) => {
        const newVolume = typeof value === 'number' ? value : value[0];
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
            if (newMuted) {
                setVolume(0);
            } else {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const handleSeek = (value: number | readonly number[]) => {
        const newTime = typeof value === 'number' ? value : value[0];
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    const seekBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
    };

    const seekForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
                duration,
                videoRef.current.currentTime + 10
            );
        }
    };

    return (
        <VideoPlayerContext.Provider
            value={{
                isPlaying,
                togglePlay,
                volume,
                handleVolumeChange,
                currentTime,
                duration,
                handleSeek,
                videoRef,
                isMuted,
                toggleMute,
                seekBackward,
                seekForward,
            }}
        >
            <div className={cn("relative group", className)} {...props}>
                {children}
            </div>
        </VideoPlayerContext.Provider>
    );
};

interface VideoPlayerContentProps
    extends React.VideoHTMLAttributes<HTMLVideoElement> { }

const VideoPlayerContent = React.forwardRef<
    HTMLVideoElement,
    VideoPlayerContentProps
>(({ className, ...props }, ref) => {
    const { videoRef } = useVideoPlayer();
    return (
        <video
            ref={(node) => {
                // Handle both local ref and context ref
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = node;
                // @ts-ignore
                videoRef.current = node;
            }}
            className={cn("h-full w-full object-cover", className)}
            {...props}
        />
    );
});
VideoPlayerContent.displayName = "VideoPlayerContent";

const VideoPlayerControlBar = ({
    className,
    children,
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "absolute bottom-0 left-0 right-0 z-20 flex items-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100",
            className
        )}
    >
        {children}
    </div>
);

const VideoPlayerPlayButton = () => {
    const { isPlaying, togglePlay } = useVideoPlayer();
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            onClick={togglePlay}
        >
            {isPlaying ? (
                <Pause className="h-5 w-5" />
            ) : (
                <Play className="h-5 w-5 fill-current" />
            )}
        </Button>
    );
};

const VideoPlayerSeekBackwardButton = () => {
    const { seekBackward } = useVideoPlayer();
    return (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={seekBackward}>
            <SkipBack className="h-4 w-4" />
        </Button>
    )
}

const VideoPlayerSeekForwardButton = () => {
    const { seekForward } = useVideoPlayer();
    return (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={seekForward}>
            <SkipForward className="h-4 w-4" />
        </Button>
    )
}

const VideoPlayerMuteButton = () => {
    const { isMuted, toggleMute } = useVideoPlayer();
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            onClick={toggleMute}
        >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
    );
};

const VideoPlayerOverlay = () => {
    const { isPlaying, togglePlay } = useVideoPlayer();

    return (
        <div
            className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300",
                isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={togglePlay}
        >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-300 hover:scale-110 cursor-pointer">
                <div className="absolute inset-0 animate-ping rounded-full bg-white/20 opacity-0 group-hover:opacity-100" />
                <Play className="h-10 w-10 fill-white text-white pl-1" />
            </div>
        </div>
    );
};

const VideoPlayerTimeDisplay = ({ showDuration }: { showDuration?: boolean }) => {
    const { currentTime, duration } = useVideoPlayer();

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="text-sm font-medium text-white/90">
            {formatTime(currentTime)}
            {showDuration && ` / ${formatTime(duration)}`}
        </div>
    );
};

const VideoPlayerTimeRange = () => {
    const { currentTime, duration, handleSeek } = useVideoPlayer();
    return (
        <Slider
            value={[currentTime]}
            max={duration || 100}
            onValueChange={handleSeek}
            className="w-full flex-1"
        />
    );
};

const VideoPlayerVolumeRange = () => {
    const { volume, handleVolumeChange } = useVideoPlayer();
    return (
        <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-24"
        />
    );
};

export {
    VideoPlayer,
    VideoPlayerContent,
    VideoPlayerControlBar,
    VideoPlayerPlayButton,
    VideoPlayerSeekBackwardButton,
    VideoPlayerSeekForwardButton,
    VideoPlayerTimeDisplay,
    VideoPlayerTimeRange,
    VideoPlayerVolumeRange,
    VideoPlayerMuteButton,
    VideoPlayerOverlay,
};
