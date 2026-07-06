import SearchIcon from '@mui/icons-material/Search'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'

const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e50914',
    },
    background: {
      default: '#09090b',
      paper: '#18181b',
    },
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
})

function getPosterUrl(path, size = 'w342') {
  if (!path) {
    return null
  }

  return `${IMAGE_BASE_URL}/${size}${path}`
}

function App() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    async function fetchNowPlayingMovies() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/now_playing',
          {
            params: {
              language: 'ko-KR',
              region: 'KR',
            },
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
          },
        )

        setMovies(response.data.results)
      } catch (error) {
        console.error(error)
        setErrorMessage('현재 상영작을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNowPlayingMovies()
  }, [])

  async function handleSearch(event) {
    event.preventDefault()

    if (query.trim() === '') {
      alert('검색어를 입력해주세요.')
      return
    }

    setHasSearched(true)
    setIsLoading(true)
    setMovies([])
    setSelectedMovie(null)
    setErrorMessage('')

    try {
      const response = await axios.get(
        'https://api.themoviedb.org/3/search/movie',
        {
          params: {
            query: query.trim(),
            language: 'ko-KR',
          },
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        },
      )

      setMovies(response.data.results)
    } catch (error) {
      console.error(error)
      setErrorMessage('영화 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchSuggestions(value) {
    if (value.trim() === '') {
      setSuggestions([])
      return
    }

    try {
      const response = await axios.get(
        'https://api.themoviedb.org/3/search/movie',
        {
          params: {
            query: value.trim(),
            language: 'ko-KR',
          },
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        },
      )

      setSuggestions(response.data.results.slice(0, 5))
    } catch (error) {
      console.error(error)
      setSuggestions([])
    }
  }

  const sectionTitle = hasSearched
    ? `"${query.trim()}" 검색 결과`
    : '현재 상영작'

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Box
          component="header"
          sx={{
            mb: 5,
            textAlign: 'center',
          }}
        >
          <Chip
            label="TMDB Movie Search"
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography
            component="h1"
            variant="h2"
            fontWeight={800}
            sx={{
              fontSize: { xs: 38, md: 64 },
              letterSpacing: 0,
            }}
          >
            Movie Finder
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1.5, mb: 3, fontSize: { xs: 16, md: 18 } }}
          >
            현재 상영작을 둘러보고, 보고 싶은 영화를 바로 검색해보세요.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              gap: 1,
              mx: 'auto',
              maxWidth: 680,
              p: 1,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 3,
            }}
          >
            <Autocomplete
              freeSolo
              fullWidth
              options={suggestions}
              inputValue={query}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option
                }

                return option.title
              }}
              onInputChange={(event, newValue) => {
                setQuery(newValue)
                fetchSuggestions(newValue)
              }}
              onChange={(event, selectedOption) => {
                if (selectedOption && typeof selectedOption !== 'string') {
                  setQuery(selectedOption.title)
                  setSelectedMovie(selectedOption)
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="영화 제목을 입력하세요"
                  size="small"
                />
              )}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{ px: 2.5, whiteSpace: 'nowrap' }}
            >
              검색
            </Button>
          </Box>
        </Box>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography component="h2" variant="h5" fontWeight={700}>
            {sectionTitle}
          </Typography>

          {isLoading && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={22} />
              <Typography color="text.secondary">
                영화 정보를 불러오는 중...
              </Typography>
            </Stack>
          )}

          {errorMessage !== '' && (
            <Alert severity="error">{errorMessage}</Alert>
          )}

          {!isLoading && hasSearched && movies.length === 0 && (
            <Alert severity="info">검색 결과가 없습니다.</Alert>
          )}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2.5,
          }}
        >
          {movies.map((movie) => {
            const posterUrl = getPosterUrl(movie.poster_path)

            return (
              <Card
                key={movie.id}
                elevation={0}
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  bgcolor: 'rgba(24, 24, 27, 0.92)',
                  transition: 'transform 160ms ease, border-color 160ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedMovie(movie)}
                  sx={{ height: '100%', alignItems: 'stretch' }}
                >
                  {posterUrl ? (
                    <CardMedia
                      component="img"
                      image={posterUrl}
                      alt={movie.title}
                      sx={{
                        aspectRatio: '2 / 3',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        aspectRatio: '2 / 3',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        color: 'text.secondary',
                      }}
                    >
                      포스터 없음
                    </Box>
                  )}

                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        minHeight: 48,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {movie.title}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        icon={<StarRoundedIcon />}
                        label={movie.vote_average.toFixed(1)}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={movie.release_date || '개봉일 없음'}
                        variant="outlined"
                      />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })}
        </Box>

        <Dialog
          open={selectedMovie !== null}
          onClose={() => setSelectedMovie(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedMovie && (
            <>
              <DialogContent
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
                  gap: 3,
                  p: { xs: 2, md: 3 },
                }}
              >
                {getPosterUrl(selectedMovie.poster_path, 'w500') ? (
                  <Box
                    component="img"
                    src={getPosterUrl(selectedMovie.poster_path, 'w500')}
                    alt={selectedMovie.title}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      minHeight: 360,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: 'text.secondary',
                    }}
                  >
                    포스터 없음
                  </Box>
                )}

                <Box>
                  <Typography variant="h4" fontWeight={800}>
                    {selectedMovie.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                    <Chip
                      icon={<StarRoundedIcon />}
                      label={`평점 ${selectedMovie.vote_average.toFixed(1)}`}
                      color="primary"
                    />
                    <Chip
                      label={selectedMovie.release_date || '개봉일 없음'}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {selectedMovie.overview || '줄거리 정보가 없습니다.'}
                  </Typography>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setSelectedMovie(null)}
                >
                  닫기
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </ThemeProvider>
  )
}

export default App
