import { useState, useEffect } from 'react'
import { players } from './data/players'
import { countryCoordinates } from './data/countryCoordinates'
import './App.css'

function App() {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [correctPlayer, setCorrectPlayer] = useState(() => {
    const randomIndex = Math.floor(Math.random() * players.length)
    return players[randomIndex]
  })

  const resetGame = () => {
    const randomIndex = Math.floor(Math.random() * players.length)
    setCorrectPlayer(players[randomIndex])
    setGuess('')
    setFeedback(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  }

  const [guessCount, setGuessCount] = useState(0)

  const handleGuess = () => {
    const guessedPlayer = players.find(p => p.name.toLowerCase() === guess.toLowerCase())
    
    if (!guessedPlayer) {
      setFeedback({ message: 'Player not found in database', type: 'error' })
      return
    }

    updateCorrectGuesses(guessedPlayer)

    if (guessedPlayer.name === correctPlayer.name) {
      setFeedback({ 
        message: 'Congratulations! You found the correct player!', 
        type: 'success',
        showNextButton: true
      })
      return
    }

    setGuessCount(prev => prev + 1)

    const guessedCoords = countryCoordinates[guessedPlayer.country]
    const correctCoords = countryCoordinates[correctPlayer.country]
    const distance = guessedCoords && correctCoords ? 
      calculateDistance(guessedCoords.lat, guessedCoords.lon, correctCoords.lat, correctCoords.lon) : null

    const feedbackInfo = [
      {
        attribute: 'Country',
        correct: guessedPlayer.country === correctPlayer.country,
        value: guessedPlayer.country,
        distance: distance ? `${distance} km away from the correct country` : null
      },
      {
        attribute: 'Team',
        correct: guessedPlayer.team === correctPlayer.team,
        value: guessedPlayer.team
      },
      {
        attribute: 'League',
        correct: guessedPlayer.league === correctPlayer.league,
        value: guessedPlayer.league
      },
      {
        attribute: 'Position',
        correct: guessedPlayer.position === correctPlayer.position,
        value: guessedPlayer.position
      }
    ]

    setFeedback({
      message: 'Keep trying! Here\'s what matches:',
      type: 'hint',
      details: feedbackInfo,
      showAnswer: guessCount >= 1
    })
  }

  const handleShowAnswer = () => {
    setFeedback({
      message: `The correct player was ${correctPlayer.name}!`,
      type: 'error',
      details: [
        { attribute: 'Country', value: correctPlayer.country, correct: true },
        { attribute: 'Team', value: correctPlayer.team, correct: true },
        { attribute: 'League', value: correctPlayer.league, correct: true },
        { attribute: 'Position', value: correctPlayer.position, correct: true }
      ],
      showNextButton: true
    })
  }

  const [correctGuesses, setCorrectGuesses] = useState({
    country: false,
    team: false,
    league: false,
    position: false
  })

  useEffect(() => {
    setCorrectGuesses({
      country: false,
      team: false,
      league: false,
      position: false
    })
  }, [correctPlayer])

  const updateCorrectGuesses = (guessedPlayer) => {
    setCorrectGuesses(prevGuesses => ({
      country: prevGuesses.country || guessedPlayer.country === correctPlayer.country,
      team: prevGuesses.team || guessedPlayer.team === correctPlayer.team,
      league: prevGuesses.league || guessedPlayer.league === correctPlayer.league,
      position: prevGuesses.position || guessedPlayer.position === correctPlayer.position
    }))
  }

  return (
    <div className="game-container">
      <div className="game-content">
        <h1>Footballer Guessing Game</h1>
      <div className="input-section">
        <div className="input-container">
          <input
            type="text"
            value={guess}
            onChange={(e) => {
              const value = e.target.value
              setGuess(value)
              const filtered = value.trim() === '' ? [] : players.filter(player => {
                const searchValue = value.toLowerCase()
                const playerNameParts = player.name.toLowerCase().split(' ')
                
                // Check if any part of the name (first name or surname) starts with the search value
                return playerNameParts.some(part => part.startsWith(searchValue))
              })
              setSuggestions(filtered)
              setShowSuggestions(true)
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            placeholder="Enter footballer's name"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((player) => (
                <li
                  key={player.id}
                  onClick={() => {
                    setGuess(player.name)
                    setShowSuggestions(false)
                  }}
                >
                  {player.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={handleGuess}>Guess</button>
      </div>
      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          <p>{feedback.message}</p>
          {feedback.details && (
            <div className="feedback-details">
              {feedback.details.map((detail, index) => (
                <div key={index} className={`detail ${detail.correct ? 'correct' : 'incorrect'}`}>
                  <span>{detail.attribute}:</span> {detail.value}
                  {!detail.correct && detail.distance && (
                    <div className="distance-hint">{detail.distance}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {feedback.type === 'hint' && guessCount >= 1 && !feedback.showNextButton && (
            <button onClick={handleShowAnswer} className="show-answer-button">Show Answer</button>
          )}
          {feedback.showNextButton && (
            <button onClick={resetGame} className="next-game-button">Next Game</button>
          )}
        </div>
      )}
    </div>
    <div className="match-box">
      <h2>Correct Matches</h2>
      <div className="match-item">
        <span>Country:</span>
        {correctGuesses.country ? <span className="checkmark">{correctPlayer.country}</span> : null}
      </div>
      <div className="match-item">
        <span>Team:</span>
        {correctGuesses.team ? <span className="checkmark">{correctPlayer.team}</span> : null}
      </div>
      <div className="match-item">
        <span>League:</span>
        {correctGuesses.league ? <span className="checkmark">{correctPlayer.league}</span> : null}
      </div>
      <div className="match-item">
        <span>Position:</span>
        {correctGuesses.position ? <span className="checkmark">{correctPlayer.position}</span> : null}
      </div>
    </div>
  </div>
  )
}

export default App
