"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getLocalizedValue } from "@/lib/utils/localization";
import Link from "next/link";
import HeroCarouselImage from './HeroCarouselImage';

interface HeroImage {
    id: string;
    filename: string;
    imageUrls?: {
        full?: string;
        large?: string;
        medium?: string;
        thumbnail?: string;
    };
    url: string;
    alt: string;
    title?: string;
    description?: string;
    caption?: string;
    location?: {
        name?: string;
        city?: string;
        region?: string;
        country?: string;
    };
}

interface HeroCarouselProps {
    images: HeroImage[];
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroQuote?: string;
    heroQuoteAuthor?: string;
    locale: string;
}

export default function HeroCarousel({
    images,
    heroTitle,
    heroSubtitle,
    heroDescription,
    heroQuote,
    heroQuoteAuthor,
    locale,
}: HeroCarouselProps) {
    const [current, setCurrent] = useState(0);

    // Auto-advance every 5 seconds
    useEffect(() => {
        if (!images || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    if (!images || images.length === 0) {
        // Fallback to static hero if no images
        return (
            <section className='relative h-screen overflow-hidden'>
                <div className='absolute inset-0 bg-muted'>
                    {/* Main title and subtitle - center of screen */}
                    <div className='relative z-10 flex items-center justify-center h-full'>
                        <div className='text-center px-4 max-w-4xl mx-auto'>
                            {/* Show quote if available, otherwise show nothing */}
                            {heroQuote && heroQuoteAuthor && (
                                <div>
                                    <blockquote className='font-serif text-2xl md:text-4xl font-medium text-white leading-tight mb-4 italic'>
                                        "{heroQuote}"
                                    </blockquote>
                                    <p className='text-xl text-white/95 leading-relaxed drop-shadow-xl font-light tracking-wide'>
                                        — {heroQuoteAuthor}
                                    </p>
                                </div>
                            )}

                            {/* Optional description */}
                            {heroDescription && (
                                <p className='text-base md:text-lg text-white/90 leading-relaxed drop-shadow-xl mt-6'>
                                    {heroDescription}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='relative h-screen overflow-hidden'>
            {/* Fixed Hero Title & Subtitle - Always visible on top */}
            <div className='absolute top-0 left-0 right-0 z-30 flex items-center justify-center h-full pointer-events-none'>
                <div className='text-center px-4 max-w-4xl mx-auto'>
                    {/* Show quote if available, otherwise show nothing */}
                    {heroQuote && heroQuoteAuthor && (
                        <div>
                            <blockquote className='font-serif text-2xl md:text-4xl font-medium text-white leading-tight mb-4 italic drop-shadow-2xl'>
                                "{heroQuote}"
                            </blockquote>
                            <p className='text-xl text-white/95 leading-relaxed drop-shadow-xl font-light tracking-wide'>
                                — {heroQuoteAuthor}
                            </p>
                        </div>
                    )}
                    {/* General hero description if provided */}
                    {heroDescription && (
                        <p className='text-base md:text-lg text-white/90 leading-relaxed drop-shadow-xl mt-6'>
                            {heroDescription}
                        </p>
                    )}
                </div>
            </div>

            {/* Animated down arrow - Fixed position */}
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce'>
                <svg
                    className='w-6 h-6 text-white/80 drop-shadow-lg'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 14l-7 7m0 0l-7-7m7 7V3'
                    />
                </svg>
            </div>

            {/* Fade Image Container */}
            <div className='absolute inset-0'>
                {images.map((heroImage, index) => (
                    <HeroCarouselImage
                        key={heroImage.id}
                        heroImage={heroImage}
                        isActive={index === current}
                    />
                ))}
            </div>

            {/* Navigation - Dots only */}
            {images.length > 1 && (
                <div className='absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-1.5'>
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 drop-shadow-md ${
                                index === current
                                    ? "bg-white/90 scale-125"
                                    : "bg-white/40 hover:bg-white/60"
                            }`}
                            onClick={() => setCurrent(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            title={`Image ${index + 1}: ${images[index]?.alt || images[index]?.title || 'Hero image'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
