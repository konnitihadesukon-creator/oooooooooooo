import { extendTheme } from '@chakra-ui/react'

// カスタムテーマ設定
export const theme = extendTheme({
  colors: {
    primary: {
      50: '#e6f3ff',
      100: '#b3d9ff',
      200: '#80c0ff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#3182CE', // メインカラー
      600: '#2c5aa0',
      700: '#264d87',
      800: '#21406e',
      900: '#1a3454',
    },
    secondary: {
      50: '#e6f7ed',
      100: '#b3e5c7',
      200: '#80d4a1',
      300: '#4dc27b',
      400: '#1ab155',
      500: '#38A169', // セカンダリカラー
      600: '#2d8653',
      700: '#236b43',
      800: '#1a5033',
      900: '#103423',
    },
    accent: {
      50: '#fdf4e6',
      100: '#f9ddb3',
      200: '#f5c680',
      300: '#f1af4d',
      400: '#ed981a',
      500: '#D69E2E', // アクセントカラー
      600: '#ab7e25',
      700: '#805e1c',
      800: '#553f13',
      900: '#2b1f09',
    },
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    }
  },
  fonts: {
    heading: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Arial", "Meiryo", sans-serif',
    body: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Arial", "Meiryo", sans-serif',
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: 4,
          py: 3,
        },
        md: {
          fontSize: 'md',
          px: 6,
          py: 4,
        },
        lg: {
          fontSize: 'lg',
          px: 8,
          py: 5,
        },
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600',
            transform: 'translateY(-1px)',
          },
          _active: {
            bg: 'primary.700',
            transform: 'translateY(0)',
          },
        },
        outline: {
          borderColor: 'primary.500',
          color: 'primary.500',
          _hover: {
            bg: 'primary.50',
            transform: 'translateY(-1px)',
          },
        },
        ghost: {
          color: 'primary.500',
          _hover: {
            bg: 'primary.50',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'sm',
          border: '1px solid',
          borderColor: 'gray.200',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: 'lg',
        borderColor: 'gray.300',
        _focus: {
          borderColor: 'primary.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  breakpoints: {
    sm: '30em', // 480px
    md: '48em', // 768px
    lg: '62em', // 992px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
  },
})