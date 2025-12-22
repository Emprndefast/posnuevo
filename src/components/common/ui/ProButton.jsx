import React from 'react';
import { Button, useTheme, alpha, CircularProgress } from '@mui/material';

/**
 * ProButton - A premium styled button component
 * @param {string} variant - 'contained' | 'outlined' | 'text' | 'soft' | 'gradient'
 * @param {string} color - primary | secondary | success | error | info | warning
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} glow - Add subtle glow effect
 * @param {object} sx - Additional styles
 */
const ProButton = ({
    children,
    variant = 'contained',
    color = 'primary',
    loading = false,
    glow = false,
    sx = {},
    disabled,
    ...props
}) => {
    const theme = useTheme();

    // Custom styles for 'soft' variant
    const softStyle = variant === 'soft' ? {
        bgcolor: alpha(theme.palette[color]?.main || color, 0.1),
        color: theme.palette[color]?.main || color,
        '&:hover': {
            bgcolor: alpha(theme.palette[color]?.main || color, 0.2),
        },
    } : {};

    // Custom styles for 'gradient' variant
    const gradientStyle = variant === 'gradient' ? {
        background: `linear-gradient(135deg, ${theme.palette[color]?.main} 0%, ${theme.palette[color]?.dark} 100%)`,
        color: '#fff',
        '&:hover': {
            boxShadow: `0 8px 16px -4px ${alpha(theme.palette[color]?.main, 0.5)}`,
        },
    } : {};

    // Glow effect
    const glowStyle = glow ? {
        boxShadow: `0 0 20px ${alpha(theme.palette[color]?.main || color, 0.35)}`,
    } : {};

    // Standard variants mapping
    const muiVariant = ['contained', 'outlined', 'text'].includes(variant) ? variant : 'contained';

    return (
        <Button
            variant={muiVariant}
            color={['primary', 'secondary', 'success', 'error', 'info', 'warning'].includes(color) ? color : 'primary'}
            disabled={disabled || loading}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.2,
                px: 3,
                boxShadow: variant === 'contained' ? 'none' : undefined,
                transition: 'all 0.2s ease-in-out',
                ...softStyle,
                ...gradientStyle,
                ...glowStyle,
                ...sx,
            }}
            {...props}
        >
            {loading ? (
                <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{ mr: 1, opacity: 0.7 }}
                />
            ) : children}
        </Button>
    );
};

export default ProButton;
