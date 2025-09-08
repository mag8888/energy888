import { useEffect, useState } from 'react';

export default function useTurnState(initialTime = 120) {
  const [state, setState] = useState('yourTurn'); // yourTurn | rolled | waitingOther
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [dice, setDice] = useState(1);
  const [rolledAt, setRolledAt] = useState(null);

  const roll = () => {
    if (isRolling || isMoving || state !== 'yourTurn') return;
    setIsRolling(true);
    const v = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
      setDice(v);
      setIsRolling(false);
      setState('rolled');
      setRolledAt(Date.now());
    }, 500);
  };

  const pass = () => {
    if (state !== 'rolled') return;
    setState('waitingOther');
    setTimeout(() => {
      setTimeLeft(initialTime);
      setState('yourTurn');
    }, 1200);
  };

  useEffect(() => {
    if (state === 'waitingOther') return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          clearInterval(id);
          if (state === 'rolled') pass();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const canPass = state === 'rolled' && rolledAt && Date.now() - rolledAt >= 10000; // 10s after roll

  return { state, timeLeft, isRolling, isMoving, dice, roll, pass, setIsMoving, canPass };
}
