import type { CardModel } from '../game/types'

type CardProps = {
  card: CardModel
  onClick: () => void
}

export function Card({ card, onClick }: CardProps) {
  const isFront = card.isFlipped || card.isMatched
  const label = isFront ? String(card.pairKey) : '?'

  return (
    <button
      type="button"
      className="card-button"
      onClick={onClick}
      aria-label={`카드 ${card.pairKey}`}
    >
      {label}
    </button>
  )
}

