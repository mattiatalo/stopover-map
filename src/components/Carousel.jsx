/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Carousel = ({ children: slides, autoSlide = false, autoSlideInterval = 3000, items, currentIndex=0}) => {
    const [curr, setCurr] = useState(currentIndex);

    const prev = useCallback(() => setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1)),[slides])

    const next = useCallback(() => setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1)),[slides])

    useEffect(() => {
        if (!autoSlide) return
        const slideInterval = setInterval(next, autoSlideInterval)
        return () => {
            clearInterval(slideInterval);
            setCurr(0);
        }
    }, [autoSlide, autoSlideInterval, next])

    useEffect(() => {
        setCurr(currentIndex);
    }, [items, currentIndex])

    return (
        <div className='overflow-hidden relative max-w-[350px]'>
            <div className='flex transition-transform ease-out duration-500 w-auto p-0 mb-6' style={{ transform: `translateX(-${curr * 100}%)` }}>
                {slides}
            </div>

            {/* <div className="absolute inset-0 flex items-center justify-between p-4"> */}

                {slides.length > 1 && <button onClick={prev} className='absolute bottom-1  z-10 left-2 p-1 rounded-full shadow bg-white/90 text-gray-800 hover:bg-white'>
                    <ChevronLeft />
                </button>
                }

                {slides.length > 1 && <button onClick={next} className='absolute bottom-1  z-10 right-2 p-1 rounded-full shadow bg-white/90 text-gray-800 hover:bg-white'>
                    <ChevronRight />
                </button> }
            {/* </div> */}

            {slides.length > 1 && <div className='absolute bottom-2 right-0 left-0 '>
                <div className='flex items-center justify-center gap-2'>

                    {slides.map((s, i) => (
                        <div key={i} className={`w-full text-center ${curr === i ? 'block' : 'hidden'}`}>
                            <span>{i+1}/{slides.length}</span>
                        </div>
                        // <div key={i} className={`transition-all w-1.5 h-1.5 bg-gray-400 rounded-full  ${curr === i ? "p-0.5" : "bg-opacity-50"}`} />
                    ))}
                </div>
            </div> }
        </div>

    )
}

export default Carousel