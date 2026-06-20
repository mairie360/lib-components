import React from "react";

export interface TitleProps {
    /** Texte du titre */
    title: string;
    /** Texte du sous-titre */
    subtitle?: string;
    /** Gestionnaire de clic facultatif */
    onClick?: () => void;
    /** Couleur du titre */
    titleColor?: string;
    /** Couleur du sous-titre */
    subtitleColor?: string;
    /** Taille de police du titre */
    titleFontSize?: string;
    /** Taille de police du sous-titre */
    subtitleFontSize?: string;
    /** Graisse de police du titre */
    titleFontWeight?: string;
    /** Graisse de police du sous-titre */
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
