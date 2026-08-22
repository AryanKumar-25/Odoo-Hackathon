import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Satoshi, system-ui, sans-serif',
    h1: { fontFamily: 'Cabinet Grotesk, system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' },
    h2: { fontFamily: 'Cabinet Grotesk, system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' },
    h3: { fontFamily: 'Cabinet Grotesk, system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' },
    h4: { fontFamily: 'Cabinet Grotesk, system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' },
    h5: { fontFamily: 'Cabinet Grotesk, system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' },
    h6: { fontFamily: 'Cabinet Grotesk, system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  palette: {
    primary: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFE17C',
      contrastText: '#000000',
    },
    info: {
      main: '#B7C6C2',
      contrastText: '#000000',
    },
    background: {
      default: '#FFE17C',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#171E19',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--yellow)',
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: '2px solid #000',
          boxShadow: '4px 4px 0 #000',
          borderRadius: '8px',
          padding: '8px 16px',
          transition: 'all 0.1s ease',
          '&:hover': {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0 #000',
          },
          '&:active': {
            transform: 'translate(4px, 4px)',
            boxShadow: '0px 0px 0 #000',
          },
        },
        containedPrimary: {
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': { backgroundColor: '#171E19' },
        },
        containedSecondary: {
          backgroundColor: '#FFE17C',
          color: '#000',
          '&:hover': { backgroundColor: '#e5ca6f' },
        },
        outlined: {
          backgroundColor: '#fff',
          color: '#000',
          borderColor: '#000',
          '&:hover': {
            backgroundColor: '#f2f2f2',
            borderColor: '#000',
          },
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '2px solid #000',
          boxShadow: '4px 4px 0 #000',
          borderRadius: '12px',
          backgroundColor: '#fff',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 #000',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '2px solid #000',
          boxShadow: '4px 4px 0 #000',
          borderRadius: '12px',
          backgroundImage: 'none',
        },
        elevation0: {
          border: 'none',
          boxShadow: 'none',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
            borderRadius: '8px',
            '& fieldset': {
              border: '2px solid #000',
            },
            '&:hover fieldset': {
              borderColor: '#000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000',
              borderWidth: '2px',
              boxShadow: '4px 4px 0 #FFE17C',
            },
          },
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: '2px solid #000',
          borderRadius: '999px',
          fontWeight: 700,
        },
        colorSuccess: {
          backgroundColor: '#FFE17C',
          color: '#000',
        },
        colorWarning: {
          backgroundColor: '#B7C6C2',
          color: '#000',
        },
        colorError: {
          backgroundColor: '#171E19',
          color: '#fff',
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '2px solid #000',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 #000',
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '2px solid #000',
          borderColor: '#000',
        },
        head: {
          fontWeight: 800,
          backgroundColor: '#171E19',
          color: '#fff',
          fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
          textTransform: 'uppercase',
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#000',
          height: '4px',
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#000',
            backgroundColor: '#FFE17C',
            border: '2px solid #000',
            borderBottom: 'none',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '2px solid #000',
          boxShadow: '8px 8px 0 #000',
          borderRadius: '16px',
        }
      }
    }
  }
});

export default theme;
