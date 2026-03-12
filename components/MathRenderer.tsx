import React from 'react';

// Since we switched to Unicode/Plain text, we no longer need complex KaTeX rendering.
// This component now ensures that text is rendered with proper line breaks 
// and spacing, which is crucial for the "visual" explanation format.

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  // Replace standard newline characters with <br /> for HTML rendering
  // but mostly relying on whitespace-pre-line is better for React.
  
  return (
    <span className={`whitespace-pre-line ${className}`}>
      {text}
    </span>
  );
};

export default MathRenderer;