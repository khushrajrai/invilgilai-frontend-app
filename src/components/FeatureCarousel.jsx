const images = [
    "/shots/shot 1.png",
    "/shots/shot 2.png",
    "/shots/shot 3.png",
];

function FeatureCarousel() {
    return (
        <div className="overflow-hidden w-full py-6">
            <div className="relative group">
                {/* SCROLLING TRACK */}
                <div className="flex w-max animate-scroll group-hover:[animation-play-state:paused]">
                    {[...images, ...images].map((src, i) => (
                        <div
                            key={i}
                            className="mx-5 w-96 h-60 rounded-2xl bg-white ring-4 ring-blue-700 shadow-lg overflow-hidden
                        transition-transform duration-500 hover:scale-105"
                        >
                            <img
                                src={src}
                                alt="Feature snapshot"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FeatureCarousel;
