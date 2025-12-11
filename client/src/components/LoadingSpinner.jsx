import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'medium', color = 'border-primary' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-4',
        large: 'w-12 h-12 border-4',
    };

    const spinner = (
        <div
            className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}
        ></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return <div className="flex justify-center p-2">{spinner}</div>;
};

export default LoadingSpinner;
