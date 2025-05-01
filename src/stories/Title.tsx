import React from "react";

export interface TitleProps {
    /** Title text */
    title: string;
    /** Subtitle text */
    subtitle?: string;
    /** Optional click handler */
    onClick?: () => void;
    /** Choose a color for Title */
    titleColor?: string;
    /** Choose a color for Subtitle */
    subtitleColor?: string;
    /** Choose a font size for Title */
    titleFontSize?: string;
    /** Choose a font size for Subtitle */
    subtitleFontSize?: string;
    /** Choose a font weight for Title */
    titleFontWeight?: string;
    /** Choose a font weight for Subtitle */
    subtitleFontWeight?: string;
    }

export const Title = ({
    title,
    subtitle,
    onClick,
    titleColor,
    subtitleColor = "text-gray-500",
    titleFontSize = "text-2xl",
    subtitleFontSize = "text-sm",
    titleFontWeight = "font-bold",
    subtitleFontWeight = "font-normal",
    ...props
}: TitleProps) => {
    return (
        <div className="flex flex-col items-center">
            <h1 className={`${titleColor} ${titleFontSize} ${titleFontWeight}`} onClick={onClick} {...props}>
                {title}
            </h1>
            {subtitle && <p className={`${subtitleColor} ${subtitleFontSize} ${subtitleFontWeight}`}>{subtitle}</p>}
        </div>
    );
}