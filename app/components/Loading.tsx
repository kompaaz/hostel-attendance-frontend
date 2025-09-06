import React from 'react'

interface LoadingProps {
    message?: String;
}

const Loading: React.FC<LoadingProps> = ({ message = "Loading..." }) => {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-t-black border-gray-200 rounded-full animate-spin"></div>
                <h1 className="text-xl font-semibold text-black">{message}</h1>
            </div>
        </div>
    )
}

export default Loading