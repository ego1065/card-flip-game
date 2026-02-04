import { useEffect, useRef, useState } from 'react'
import './App.css'
import { newGameDeck } from './game/deck'
import type { CardModel } from './game/types'
import { Card } from './components/Card'

function App() {
  const [deck, setDeck] = useState<CardModel[]>(() => newGameDeck(8))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isCleared, setIsCleared] = useState(false)

  const timerRef = useRef<number | null>(null)
  const flipTimeoutRef = useRef<number | null>(null)

  const startTimer = () => {
    if (timerRef.current !== null) return
    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
  }

  // 타이머 시작 및 정리
  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // 클리어되면 타이머 정지
  useEffect(() => {
    if (!isCleared) return
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isCleared])

  const resetGame = () => {
    // 진행 중인 타이머/타임아웃 정리
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (flipTimeoutRef.current !== null) {
      clearTimeout(flipTimeoutRef.current)
      flipTimeoutRef.current = null
    }

    setDeck(newGameDeck(8))
    setSelectedIds([])
    setLock(false)
    setMoves(0)
    setSeconds(0)
    setIsCleared(false)
    startTimer()
  }

  const handleCardClick = (cardId: string) => {
    if (isCleared) return
    if (lock) return

    const clickedCard = deck.find((card) => card.id === cardId)
    if (!clickedCard) return

    // 이미 매칭된 카드는 클릭 무시
    if (clickedCard.isMatched) return

    // 동일 카드 두 번 클릭 방지
    if (selectedIds.includes(cardId)) return

    // eslint-disable-next-line no-console
    console.log('Card clicked:', { id: clickedCard.id, pairKey: clickedCard.pairKey })

    if (selectedIds.length === 0) {
      // 첫 번째 카드 선택
      setDeck((prevDeck) =>
        prevDeck.map((card) =>
          card.id === cardId ? { ...card, isFlipped: true } : card,
        ),
      )
      setSelectedIds([cardId])
      return
    }

    if (selectedIds.length === 1) {
      // 두 번째 카드 뒤집기: 한 번의 move로 카운트
      setMoves((prev) => prev + 1)

      const firstId = selectedIds[0]
      const firstCard = deck.find((card) => card.id === firstId)
      if (!firstCard) return

      const isMatch = firstCard.pairKey === clickedCard.pairKey

      if (isMatch) {
        // 매칭된 두 카드는 계속 열린 상태 + isMatched = true
        setDeck((prevDeck) => {
          const nextDeck = prevDeck.map((card) => {
            if (card.id === firstId || card.id === cardId) {
              return { ...card, isFlipped: true, isMatched: true }
            }
            return card
          })

          // 모든 카드가 매칭되었는지 확인
          const allMatched = nextDeck.every((card) => card.isMatched)
          if (allMatched) {
            setIsCleared(true)
          }

          return nextDeck
        })
        setSelectedIds([])
      } else {
        // 일단 두 장 모두 뒤집고, 800ms 후에 다시 닫기
        setDeck((prevDeck) =>
          prevDeck.map((card) => {
            if (card.id === firstId || card.id === cardId) {
              return { ...card, isFlipped: true }
            }
            return card
          }),
        )
        setSelectedIds([firstId, cardId])
        setLock(true)

        // 진행 중인 기존 타임아웃이 있다면 정리
        if (flipTimeoutRef.current !== null) {
          clearTimeout(flipTimeoutRef.current)
          flipTimeoutRef.current = null
        }

        flipTimeoutRef.current = window.setTimeout(() => {
          // 최신 상태 기준으로 두 카드만 다시 닫기
          setDeck((prevDeck) =>
            prevDeck.map((card) => {
              if (card.id === firstId || card.id === cardId) {
                // 혹시 그 사이 매칭 상태가 되었으면 닫지 않음
                if (card.isMatched) return card
                return { ...card, isFlipped: false }
              }
              return card
            }),
          )
          setSelectedIds([])
          setLock(false)
          flipTimeoutRef.current = null
        }, 800)
      }
    }
  }

  return (
    <div className="app-root">
      <header className="top-bar">
        <h1 className="app-title">Memory Card Flip Game</h1>
        <div className="top-bar-right">
          <div className="stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{seconds}s</span>
          </div>
          <button type="button" className="reset-button" onClick={resetGame}>
            Reset
          </button>
        </div>
      </header>
      <div className="card-grid">
        {deck.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
      {isCleared && (
        <div className="win-overlay" role="dialog" aria-modal="true">
          <div className="win-dialog">
            <h2>You Win!</h2>
            <p>
              Moves: <strong>{moves}</strong> · Time: <strong>{seconds}s</strong>
            </p>
            <button
              type="button"
              className="play-again-button"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
