import { extendTheme } from '@chakra-ui/react'

// モバイルファーストのテーマ設定
const theme = extendTheme({
  // カラーパレット
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB', 
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#3182CE', // メインの青
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    secondary: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#38A169', // メインの緑
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    accent: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#D69E2E', // メインのオレンジ
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },
  },

  // フォント設定
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },

  // ブレイクポイント（モバイルファースト）
  breakpoints: {
    base: '0px',
    sm: '320px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // グローバルスタイル
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        fontSize: { base: 'sm', md: 'md' },
        lineHeight: { base: 'base', md: 'tall' },
      },
      // iOSのセーフエリア対応は別途CSSで実装
    },
  },

  // コンポーネントのデフォルトテーマ
  components: {
    // シンプルなボタン設定
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 'semibold',
      },
    },

    // シンプルなカード設定
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
        },
      },
    },

    // シンプルなインプット設定
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px #3182CE',
            },
          },
        },
      },
    },
  },

  // スペーシング
  space: {
    '18': '4.5rem',
    '88': '22rem',
  },

  // シャドウ
  shadows: {
    mobile: '0 2px 8px rgba(0,0,0,0.1)',
    card: '0 4px 12px rgba(0,0,0,0.05)',
  },

  // モバイル特有の設定
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default theme