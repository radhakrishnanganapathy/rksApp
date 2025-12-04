import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { RefreshCw, ArrowLeft } from 'lucide-react';

const GestureHandler = ({ children, onBack }) => {
    const { refreshData } = useData();
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [swipeBackDistance, setSwipeBackDistance] = useState(0);

    const touchStartRef = useRef({ x: 0, y: 0 });
    const contentRef = useRef(null);
    const isDraggingRef = useRef(false);

    const PULL_THRESHOLD = 120; // Pixels to pull down to trigger refresh
    const SWIPE_BACK_THRESHOLD = 100; // Pixels to swipe right to trigger back

    const handleTouchStart = (e) => {
        // Only enable gestures if we are at the top of the page for pull-to-refresh
        // or if we are starting from the left edge for swipe-back
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        isDraggingRef.current = true;
    };

    const handleTouchMove = (e) => {
        if (!isDraggingRef.current) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;

        const diffX = currentX - touchStartRef.current.x;
        const diffY = currentY - touchStartRef.current.y;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Pull to Refresh Logic (Vertical Swipe Down at Top)
        if (scrollTop === 0 && diffY > 0 && Math.abs(diffY) > Math.abs(diffX)) {
            // Prevent default only if we are actually pulling
            if (e.cancelable && diffY < PULL_THRESHOLD * 1.5) {
                // e.preventDefault(); // Optional: might interfere with scrolling
            }
            setPullDistance(Math.min(diffY * 0.5, PULL_THRESHOLD)); // Damping effect
        }

        // Swipe Back Logic (Horizontal Swipe Right)
        // Check if we started near the left edge (e.g., first 50px)
        // OR just general swipe right if that's what user wants. 
        // User said "rifth to center" which implies Right-to-Left? 
        // But "Back" is usually Left-to-Right. 
        // Let's implement Right-to-Left as requested by "rifth to center" if they meant that.
        // Wait, "Right to Center" -> Start at Right, End at Center -> diffX is NEGATIVE.
        // "Left to Center" -> Start at Left, End at Center -> diffX is POSITIVE.
        // Standard Back is Left-to-Right (diffX > 0).
        // Let's implement standard back (Left-to-Right) as it's safer.

        if (onBack && diffX > 0 && Math.abs(diffX) > Math.abs(diffY)) {
            setSwipeBackDistance(Math.min(diffX, SWIPE_BACK_THRESHOLD));
        }
    };

    const handleTouchEnd = async () => {
        isDraggingRef.current = false;

        // Handle Refresh
        if (pullDistance >= PULL_THRESHOLD * 0.8) {
            setIsRefreshing(true);
            setPullDistance(PULL_THRESHOLD); // Keep it visible
            await refreshData();
            setTimeout(() => {
                setIsRefreshing(false);
                setPullDistance(0);
            }, 500);
        } else {
            setPullDistance(0);
        }

        // Handle Back
        if (swipeBackDistance >= SWIPE_BACK_THRESHOLD * 0.8) {
            if (onBack) {
                onBack();
            }
        }
        setSwipeBackDistance(0);
    };

    return (
        <div
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen relative"
        >
            {/* Pull to Refresh Indicator */}
            <div
                className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-transform duration-200"
                style={{
                    height: `${PULL_THRESHOLD}px`,
                    transform: `translateY(${pullDistance - PULL_THRESHOLD}px)`,
                    opacity: pullDistance > 0 ? 1 : 0
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-md border">
                    <RefreshCw
                        size={24}
                        className={`text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
                        style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                    />
                </div>
            </div>

            {/* Swipe Back Indicator */}
            {swipeBackDistance > 0 && (
                <div
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    style={{
                        transform: `translateX(${swipeBackDistance - 50}px)`,
                        opacity: swipeBackDistance / SWIPE_BACK_THRESHOLD
                    }}
                >
                    <div className="bg-black bg-opacity-50 rounded-full p-3 text-white">
                        <ArrowLeft size={24} />
                    </div>
                </div>
            )}

            {children}
        </div>
    );
};

export default GestureHandler;
