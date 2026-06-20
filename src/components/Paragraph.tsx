import React from "react";

export interface ParagraphProps {
    /** Texte du paragraphe */
    text: string;
    /** Gestionnaire de clic facultatif */
    onClick?: () => void;
    /** Couleur du paragraphe */
    textColor?: string;
    /** Taille de police du paragraphe */
    fontSize?: string;
    /** Graisse de police du paragraphe */
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
