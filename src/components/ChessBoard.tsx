import React from 'react';
import { Piece } from '../engine';

interface ChessBoardProps {
  board: Piece[][];
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  onSquareClick: (r: number, c: number) => void;
  isCheck: boolean;
  kingLocation: [number, number];
}

const PIECE_SYMBOLS: Record<string, string> = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟',
  '--': ''
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
  isCheck,
  kingLocation
}) => {
  return (
    <div className="grid grid-cols-8 border-4 border-zinc-800 shadow-2xl overflow-hidden rounded-lg">
      {board.map((row, r) =>
        row.map((piece, c) => {
          const isDark = (r + c) % 2 === 1;
          const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
          const isValidMove = validMoves.some(m => m[0] === r && m[1] === c);
          const isKingInCheck = isCheck && kingLocation[0] === r && kingLocation[1] === c;

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onSquareClick(r, c)}
              className={`
                relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer select-none transition-colors duration-200
                ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}
                ${isSelected ? 'bg-yellow-400/80' : ''}
                ${isKingInCheck ? 'bg-red-500/80' : ''}
                hover:opacity-90
              `}
            >
              <span className={`text-4xl sm:text-5xl ${piece[0] === 'w' ? 'text-white drop-shadow-md' : 'text-black'}`}>
                {PIECE_SYMBOLS[piece]}
              </span>
              
              {isValidMove && (
                <div className="absolute w-4 h-4 bg-emerald-500/40 rounded-full" />
              )}

              {/* Coordinates for edge squares */}
              {c === 0 && (
                <span className="absolute top-0.5 left-0.5 text-[10px] font-bold opacity-30">
                  {8 - r}
                </span>
              )}
              {r === 7 && (
                <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-30 uppercase">
                  {String.fromCharCode(97 + c)}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
