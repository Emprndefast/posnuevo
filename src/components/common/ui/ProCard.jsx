import React from 'react';
import { Card, CardContent, Box, useTheme, alpha } from '@mui/material';

/**
 * ProCard - A premium styled card component
 * @param {node} children - Content of the card
 * @param {string} title - Optional title (if not using custom content)
 * @param {string} subtitle - Optional subtitle
 * @param {boolean} hoverEffect - Enable hover lift and shadow effect
 * @param {boolean} glass - Enable glassmorphism effect
 * @param {string} gradient - Optional gradient background
 * @param {object} sx - Additional styles
 * @param {function} onClick - Click handler
 */
const ProCard = ({
    children,
    hoverEffect = false,
    glass = false,
    gradient,
    sx = {},
    onClick,
    ...props
}) => {
    const theme = useTheme();

    const glassStyle = glass ? {
        background: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    } : {
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
    };

    const gradientStyle = gradient ? {
        background: gradient,
        color: '#fff',
        border: 'none',
    } : {};

    return (
        <Card
            elevation={0}
            onClick={onClick}
            sx={{
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: onClick ? 'pointer' : 'default',
                ...glassStyle,
                ...gradientStyle,
                ...(hoverEffect && {
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderColor: !gradient && alpha(theme.palette.primary.main, 0.3),
                    },
                }),
                ...sx,
            }}
            {...props}
        >
            {children}
        </Card>
    );
};

export default ProCard;
