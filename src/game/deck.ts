import type { CardModel } from './types'

export function createDeck(pairs: number = 8): CardModel[] {
  const cards: CardModel[] = []

  for (let pairKey = 1; pairKey <= pairs; pairKey++) {
    for (let copyIndex = 0; copyIndex < 2; copyIndex++) {
      const id = `${pairKey}-${copyIndex}-${crypto.randomUUID()}`

      cards.push({
        id,
        pairKey,
        isFlipped: false,
        isMatched: false,
      })
    }
  }

  return cards
}

export function shuffle<T>(cards: T[]): T[] {
  const shuffled = [...cards]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export function newGameDeck(pairs: number = 8): CardModel[] {
  const baseDeck = createDeck(pairs)
  return shuffle(baseDeck)
}

