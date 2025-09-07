import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../../../socket.js';

export const useGameState = (roomId, playerData) => {
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  // Основное состояние игры
  const [gamePlayers, setGamePlayers] = useState([
    { id: 1, username: 'Алексей', color: '#FF6B6B', socketId: 'socket1', balance: 2500, assets: [{ name: 'Дом', value: 150000 }] },
    { id: 2, username: 'Мария', color: '#4ECDC4', socketId: 'socket2', balance: 1800, assets: [{ name: 'Акции', value: 25000 }] },
    { id: 3, username: 'Дмитрий', color: '#45B7D1', socketId: 'socket3', balance: 3200, assets: [{ name: 'Бизнес', value: 80000 }] },
    { id: 4, username: 'Анна', color: '#96CEB4', socketId: 'socket4', balance: 1200, assets: [] }
  ]);
  const [turnOrder, setTurnOrder] = useState(['socket1', 'socket2', 'socket3', 'socket4']);
  const [currentTurn, setCurrentTurn] = useState('socket1');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isHost, setIsHost] = useState(true);
  const [hostCanRoll, setHostCanRoll] = useState(true);
  const [gameState, setGameState] = useState('playing');
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [gameEndTime, setGameEndTime] = useState(null);

  // Состояние для дебаунсинга обновлений игроков
  const [playersUpdateTimeout, setPlayersUpdateTimeout] = useState(null);

  // Инициализация данных игрока
  const initializePlayerData = useCallback((player, allPlayers = []) => {
    const existingPlayer = allPlayers.find(p => p.socketId === player.socketId);
    if (existingPlayer) {
      return {
        ...existingPlayer,
        ...player,
        assets: existingPlayer.assets || [],
        balance: existingPlayer.balance || 0,
        color: existingPlayer.color || assignPlayerColor(allPlayers.length),
        isHost: existingPlayer.isHost || false,
        isCurrentTurn: existingPlayer.isCurrentTurn || false
      };
    }

    return {
      ...player,
      assets: player.assets || [],
      balance: player.balance || 0,
      color: assignPlayerColor(allPlayers.length),
      isHost: player.isHost || false,
      isCurrentTurn: player.isCurrentTurn || false
    };
  }, []);

  // Синхронизация данных игрока
  const syncPlayerData = useCallback((playerId, updatedData) => {
    setGamePlayers(prev => 
      prev.map(player => 
        player.socketId === playerId 
          ? { ...player, ...updatedData }
          : player
      )
    );
  }, []);

  // Получение активов текущего игрока
  const getCurrentPlayerAssets = useCallback(() => {
    const currentPlayerData = gamePlayers.find(p => p.socketId === socket?.id);
    if (!currentPlayerData) return [];
    return currentPlayerData.assets || [];
  }, [gamePlayers]);

  // Обновление активов текущего игрока
  const updateCurrentPlayerAssets = useCallback((newAssets) => {
    const currentPlayerData = gamePlayers.find(p => p.socketId === socket?.id);
    if (currentPlayerData) {
      syncPlayerData(currentPlayerData.socketId, { assets: newAssets });
    }
  }, [gamePlayers, syncPlayerData]);

  // Обработчики событий сокета
  const handlePlayersUpdate = useCallback((playersList) => {
    if (playersUpdateTimeout) {
      clearTimeout(playersUpdateTimeout);
    }

    const timeout = setTimeout(() => {
      if (playersList && Array.isArray(playersList)) {
        const initializedPlayers = playersList.map((player, index) => 
          initializePlayerData(player, playersList)
        );
        setGamePlayers(initializedPlayers);
      }
    }, 100);

    setPlayersUpdateTimeout(timeout);
  }, [playersUpdateTimeout, initializePlayerData]);

  const handleRoomData = useCallback((roomData) => {
    if (roomData && roomData.currentPlayers) {
      const initializedPlayers = roomData.currentPlayers.map((player, index) => 
        initializePlayerData(player, roomData.currentPlayers)
      );
      setGamePlayers(initializedPlayers);
    }
  }, [initializePlayerData]);

  const handlePlayerPositionUpdate = useCallback((data) => {
    if (data && data.playerId) {
      syncPlayerData(data.playerId, { position: data.position });
    }
  }, [syncPlayerData]);

  const handlePlayerTurnChanged = useCallback((data) => {
    if (data) {
      setCurrentTurn(data.currentPlayer);
      setCurrentTurnIndex(data.turnIndex);
      setTurnTimeLeft(data.turnTimeLeft || 0);
      
      // Обновляем состояние игроков
      setGamePlayers(prev => 
        prev.map(player => ({
          ...player,
          isCurrentTurn: player.socketId === data.currentPlayer
        }))
      );
    }
  }, []);

  // Настройка слушателей событий
  useEffect(() => {
    socket.on('playersUpdate', handlePlayersUpdate);
    socket.on('roomData', handleRoomData);
    socket.on('roomJoined', handleRoomData);
    socket.on('playerPositionUpdate', handlePlayerPositionUpdate);
    socket.on('playerTurnChanged', handlePlayerTurnChanged);

    return () => {
      socket.off('playersUpdate', handlePlayersUpdate);
      socket.off('roomData', handleRoomData);
      socket.off('roomJoined', handleRoomData);
      socket.off('playerPositionUpdate', handlePlayerPositionUpdate);
      socket.off('playerTurnChanged', handlePlayerTurnChanged);
    };
  }, [handlePlayersUpdate, handleRoomData, handlePlayerPositionUpdate, handlePlayerTurnChanged]);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (playersUpdateTimeout) {
        clearTimeout(playersUpdateTimeout);
      }
    };
  }, [playersUpdateTimeout]);

  return {
    gamePlayers,
    setGamePlayers,
    turnOrder,
    setTurnOrder,
    currentTurn,
    setCurrentTurn,
    currentTurnIndex,
    setCurrentTurnIndex,
    isHost,
    setIsHost,
    hostCanRoll,
    setHostCanRoll,
    gameState,
    setGameState,
    turnTimeLeft,
    setTurnTimeLeft,
    isGameFinished,
    setIsGameFinished,
    gameEndTime,
    setGameEndTime,
    initializePlayerData,
    syncPlayerData,
    getCurrentPlayerAssets,
    updateCurrentPlayerAssets
  };
};
