"use client";

interface JotaiProviderProps {
    children: React.ReactNode;
};

export const JotaiProvider = ( {children}: JotaiProviderProps) =>{
    return (
        <div>
            {children}
        </div>
    );
};