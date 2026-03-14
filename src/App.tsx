import { useState, useEffect, useCallback } from 'react';
import { ChessEngine, Move, Piece } from './engine';
import { ChessBoard } from './components/ChessBoard';
import { Trophy, RotateCcw, History, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [engine, setEngine] = useState(new ChessEngine());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('White to move');
  const [moveLog, setMoveLog] = useState<string[]>([]);

  const updateGameState = useCallback(() => {
    const currentValidMoves = engine.getValidMoves();
    const inCheck = engine.inCheck();
    
    if (currentValidMoves.length === 0) {
      if (inCheck) {
        setStatusMessage(`Checkmate! ${engine.whiteToMove ? 'Black' : 'White'} wins!`);
      } else {
        setStatusMessage('Stalemate!');
      }
    } else {
      if (inCheck) {
        setStatusMessage(`Check! ${engine.whiteToMove ? 'White' : 'Black'}'s turn`);
      } else {
        setStatusMessage(`${engine.whiteToMove ? 'White' : 'Black'}'s turn`);
      }
    }
  }, [engine]);

  const toAlgebraic = (move: Move) => {
    const cols = 'abcdefgh';
    const rows = '87654321';
    const from = `${cols[move.from[1]]}${rows[move.from[0]]}`;
    const to = `${cols[move.to[1]]}${rows[move.to[0]]}`;
    return `${from}-${to}`;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (selectedSquare) {
      const move = validMoves.find(m => 
        m.from[0] === selectedSquare[0] && 
        m.from[1] === selectedSquare[1] && 
        m.to[0] === r && 
        m.to[1] === c
      );

      if (move) {
        engine.makeMove(move);
        setMoveLog(prev => [...prev, toAlgebraic(move)]);
        setSelectedSquare(null);
        setValidMoves([]);
        updateGameState();
      } else {
        // If clicking another of own pieces, select that instead
        const piece = engine.board[r][c];
        if (piece !== '--' && ((piece[0] === 'w' && engine.whiteToMove) || (piece[0] === 'b' && !engine.whiteToMove))) {
          setSelectedSquare([r, c]);
          const allMoves = engine.getValidMoves();
          setValidMoves(allMoves.filter(m => m.from[0] === r && m.from[1] === c));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
          if (piece !== '--') setStatusMessage('Invalid Move');
        }
      }
    } else {
      const piece = engine.board[r][c];
      if (piece !== '--' && ((piece[0] === 'w' && engine.whiteToMove) || (piece[0] === 'b' && !engine.whiteToMove))) {
        setSelectedSquare([r, c]);
        const allMoves = engine.getValidMoves();
        setValidMoves(allMoves.filter(m => m.from[0] === r && m.from[1] === c));
      }
    }
  };

  const resetGame = () => {
    const newEngine = new ChessEngine();
    setEngine(newEngine);
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveLog([]);
    setStatusMessage('White to move');
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans p-4 sm:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Grandmaster Chess
        </h1>
        <p className="text-zinc-500 font-medium text-sm tracking-widest uppercase mt-1">
          Strategic Board Engine v1.0
        </p>
      </header>

      <main className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl w-full">
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center">
          <ChessBoard
            board={engine.board}
            selectedSquare={selectedSquare}
            validMoves={validMoves.map(m => m.to)}
            onSquareClick={handleSquareClick}
            isCheck={engine.inCheck()}
            kingLocation={engine.whiteToMove ? engine.whiteKingLocation : engine.blackKingLocation}
          />
          
          <div className="mt-6 w-full max-w-md flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${engine.whiteToMove ? 'bg-zinc-400' : 'bg-zinc-900'}`} />
              <span className="font-bold text-lg">{statusMessage}</span>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              RESET
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-bottom border-zinc-100">
              <History className="w-5 h-5 text-zinc-400" />
              <h2 className="font-bold uppercase tracking-wider text-sm">Move Log</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {moveLog.length === 0 && (
                <p className="text-zinc-400 italic text-sm text-center mt-10">No moves yet...</p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Array.from({ length: Math.ceil(moveLog.length / 2) }).map((_, i) => (
                  <div key={i} className="contents">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-300 font-mono w-4">{i + 1}.</span>
                      <span className="font-medium">{moveLog[i * 2]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{moveLog[i * 2 + 1] || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 text-white rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed opacity-80">
              <p className="font-bold mb-1 text-white opacity-100">HOW TO PLAY</p>
              Click a piece to select it. Valid moves will be highlighted. Click a target square to move.
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
}
