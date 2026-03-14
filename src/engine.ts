/**
 * Chess Engine Logic
 * Handles board state, move validation, and game rules.
 */

export type PieceColor = 'w' | 'b';
export type PieceType = 'R' | 'N' | 'B' | 'Q' | 'K' | 'P';
export type Piece = string; // e.g., 'wR', 'bP' or '--' for empty

export interface Move {
  from: [number, number];
  to: [number, number];
  pieceMoved: Piece;
  pieceCaptured: Piece;
}

export class ChessEngine {
  board: Piece[][];
  whiteToMove: boolean;
  moveLog: Move[];
  whiteKingLocation: [number, number];
  blackKingLocation: [number, number];
  check: boolean;
  pins: any[];
  checks: any[];

  constructor() {
    this.board = [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      ['--', '--', '--', '--', '--', '--', '--', '--'],
      ['--', '--', '--', '--', '--', '--', '--', '--'],
      ['--', '--', '--', '--', '--', '--', '--', '--'],
      ['--', '--', '--', '--', '--', '--', '--', '--'],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
    ];
    this.whiteToMove = true;
    this.moveLog = [];
    this.whiteKingLocation = [7, 4];
    this.blackKingLocation = [0, 4];
    this.check = false;
    this.pins = [];
    this.checks = [];
  }

  makeMove(move: Move) {
    this.board[move.from[0]][move.from[1]] = '--';
    this.board[move.to[0]][move.to[1]] = move.pieceMoved;
    this.moveLog.push(move);
    this.whiteToMove = !this.whiteToMove;

    // Update king location
    if (move.pieceMoved === 'wK') {
      this.whiteKingLocation = move.to;
    } else if (move.pieceMoved === 'bK') {
      this.blackKingLocation = move.to;
    }
  }

  undoMove() {
    if (this.moveLog.length !== 0) {
      const move = this.moveLog.pop()!;
      this.board[move.from[0]][move.from[1]] = move.pieceMoved;
      this.board[move.to[0]][move.to[1]] = move.pieceCaptured;
      this.whiteToMove = !this.whiteToMove;
      
      if (move.pieceMoved === 'wK') {
        this.whiteKingLocation = move.from;
      } else if (move.pieceMoved === 'bK') {
        this.blackKingLocation = move.from;
      }
    }
  }

  getValidMoves(): Move[] {
    const moves = this.getAllPossibleMoves();
    const validMoves: Move[] = [];
    
    for (const move of moves) {
      this.makeMove(move);
      this.whiteToMove = !this.whiteToMove; // Switch back to check if king is safe
      if (!this.inCheck()) {
        validMoves.push(move);
      }
      this.whiteToMove = !this.whiteToMove; // Switch back for undo
      this.undoMove();
    }
    return validMoves;
  }

  inCheck(): boolean {
    if (this.whiteToMove) {
      return this.squareUnderAttack(this.whiteKingLocation[0], this.whiteKingLocation[1]);
    } else {
      return this.squareUnderAttack(this.blackKingLocation[0], this.blackKingLocation[1]);
    }
  }

  squareUnderAttack(r: number, c: number): boolean {
    this.whiteToMove = !this.whiteToMove; // Switch to opponent's perspective
    const oppMoves = this.getAllPossibleMoves();
    this.whiteToMove = !this.whiteToMove; // Switch back
    for (const move of oppMoves) {
      if (move.to[0] === r && move.to[1] === c) {
        return true;
      }
    }
    return false;
  }

  getAllPossibleMoves(): Move[] {
    const moves: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const turn = this.board[r][c][0];
        if ((turn === 'w' && this.whiteToMove) || (turn === 'b' && !this.whiteToMove)) {
          const piece = this.board[r][c][1];
          if (piece === 'P') this.getPawnMoves(r, c, moves);
          else if (piece === 'R') this.getRookMoves(r, c, moves);
          else if (piece === 'N') this.getKnightMoves(r, c, moves);
          else if (piece === 'B') this.getBishopMoves(r, c, moves);
          else if (piece === 'Q') this.getQueenMoves(r, c, moves);
          else if (piece === 'K') this.getKingMoves(r, c, moves);
        }
      }
    }
    return moves;
  }

  getPawnMoves(r: number, c: number, moves: Move[]) {
    if (this.whiteToMove) {
      if (r - 1 >= 0 && this.board[r - 1][c] === '--') {
        moves.push({ from: [r, c], to: [r - 1, c], pieceMoved: 'wP', pieceCaptured: '--' });
        if (r === 6 && this.board[r - 2][c] === '--') {
          moves.push({ from: [r, c], to: [r - 2, c], pieceMoved: 'wP', pieceCaptured: '--' });
        }
      }
      // Captures
      if (c - 1 >= 0 && r - 1 >= 0 && this.board[r - 1][c - 1][0] === 'b') {
        moves.push({ from: [r, c], to: [r - 1, c - 1], pieceMoved: 'wP', pieceCaptured: this.board[r - 1][c - 1] });
      }
      if (c + 1 <= 7 && r - 1 >= 0 && this.board[r - 1][c + 1][0] === 'b') {
        moves.push({ from: [r, c], to: [r - 1, c + 1], pieceMoved: 'wP', pieceCaptured: this.board[r - 1][c + 1] });
      }
    } else {
      if (r + 1 <= 7 && this.board[r + 1][c] === '--') {
        moves.push({ from: [r, c], to: [r + 1, c], pieceMoved: 'bP', pieceCaptured: '--' });
        if (r === 1 && this.board[r + 2][c] === '--') {
          moves.push({ from: [r, c], to: [r + 2, c], pieceMoved: 'bP', pieceCaptured: '--' });
        }
      }
      // Captures
      if (c - 1 >= 0 && r + 1 <= 7 && this.board[r + 1][c - 1][0] === 'w') {
        moves.push({ from: [r, c], to: [r + 1, c - 1], pieceMoved: 'bP', pieceCaptured: this.board[r + 1][c - 1] });
      }
      if (c + 1 <= 7 && r + 1 <= 7 && this.board[r + 1][c + 1][0] === 'w') {
        moves.push({ from: [r, c], to: [r + 1, c + 1], pieceMoved: 'bP', pieceCaptured: this.board[r + 1][c + 1] });
      }
    }
  }

  getRookMoves(r: number, c: number, moves: Move[]) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const enemyColor = this.whiteToMove ? 'b' : 'w';
    for (const d of directions) {
      for (let i = 1; i < 8; i++) {
        const endR = r + d[0] * i;
        const endC = c + d[1] * i;
        if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
          const endPiece = this.board[endR][endC];
          if (endPiece === '--') {
            moves.push({ from: [r, c], to: [endR, endC], pieceMoved: this.board[r][c], pieceCaptured: '--' });
          } else if (endPiece[0] === enemyColor) {
            moves.push({ from: [r, c], to: [endR, endC], pieceMoved: this.board[r][c], pieceCaptured: endPiece });
            break;
          } else break;
        } else break;
      }
    }
  }

  getKnightMoves(r: number, c: number, moves: Move[]) {
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    const allyColor = this.whiteToMove ? 'w' : 'b';
    for (const m of knightMoves) {
      const endR = r + m[0];
      const endC = c + m[1];
      if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
        const endPiece = this.board[endR][endC];
        if (endPiece[0] !== allyColor) {
          moves.push({ from: [r, c], to: [endR, endC], pieceMoved: this.board[r][c], pieceCaptured: endPiece });
        }
      }
    }
  }

  getBishopMoves(r: number, c: number, moves: Move[]) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const enemyColor = this.whiteToMove ? 'b' : 'w';
    for (const d of directions) {
      for (let i = 1; i < 8; i++) {
        const endR = r + d[0] * i;
        const endC = c + d[1] * i;
        if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
          const endPiece = this.board[endR][endC];
          if (endPiece === '--') {
            moves.push({ from: [r, c], to: [endR, endC], pieceMoved: this.board[r][c], pieceCaptured: '--' });
          } else if (endPiece[0] === enemyColor) {
            moves.push({ from: [r, c], to: [endR, endC], pieceMoved: this.board[r][c], pieceCaptured: endPiece });
            break;
          } else break;
        } else break;
      }
    }
  }

  getQueenMoves(r: number, c: number, moves: Move[]) {
    this.getRookMoves(r, c, moves);
    this.getBishopMoves(r, c, moves);
  }

  getKingMoves(r: number, c: number, moves: Move[]) {
    const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    const allyColor = this.whiteToMove ? 'w' : 'b';
    for (const m of kingMoves) {
      const endR = r + m[0];
      const endC = c + m[1];
      if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
        const endPiece = this.board[endR][endC];
        if (endPiece[0] !== allyColor) {
          moves.push({ from: [r, c], to: [endR, endC], pieceMoved: this.board[r][c], pieceCaptured: endPiece });
        }
      }
    }
  }
}
