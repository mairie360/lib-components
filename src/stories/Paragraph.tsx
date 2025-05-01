import React from "react";

export interface ParagraphProps {
    /** Paragraph text */
    text: string;
    /** Optional click handler */
    onClick?: () => void;
    /** Choose a color for Paragraph */
    textColor?: string;
    /** Choose a font size for Paragraph */
    fontSize?: string;
    /** Choose a font weight for Paragraph */
    fontWeight?: string;
}

export const Paragraph = ({
    text,
    onClick,
    textColor = "text-gray-500",
    fontSize = "text-base",
    fontWeight = "font-normal",
    ...props
}: ParagraphProps) => {
    return (
        <p className={`${textColor} ${fontSize} ${fontWeight}`} onClick={onClick} {...props}>
            {text}
        </p>
    );
}