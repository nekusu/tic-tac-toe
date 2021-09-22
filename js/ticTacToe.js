const playersBoxes = players.querySelectorAll('.player');
const menuContainer = document.querySelector('#menu-container');
const inputName = document.querySelector('#name');
const nameForm = document.forms['edit-name'];
const switchAIButton = document.querySelector('#switch-ai');
const tiles = board.querySelectorAll('.tile');
const restartButton = restart;

const Player = (name, type, marker) => {
	function getMarker() {
		return marker;
	}

	return { name, type, getMarker };
};

const boardController = (() => {
	const markers = { x: 'close', o: 'circle' };
	let restartRotation = 0;

	function activePlayer(index) {
		for (const box of playersBoxes) {
			if (box === playersBoxes[index]) {
				box.classList.add('active');
			} else {
				box.classList.remove('active');
			}
		}
	}

	function showMenu(index) {
		menuContainer.classList.remove('hidden');
		menuContainer.dataset.id = index;
		inputName.value = gameController.getPlayerInfo(index, 'name');
		inputName.focus();
		switchAIButton.firstElementChild.textContent = gameController.getPlayerInfo(index, 'type') === 'human' ? 'AI' : 'HUMAN';
	}

	function saveName() {
		const index = menuContainer.dataset.id;
		if (inputName.checkValidity()) {
			gameController.setPlayerInfo(index, 'name', inputName.value);
			playersBoxes[index].firstChild.textContent = inputName.value;
		}
	}

	function toggleAI() {
		const index = menuContainer.dataset.id;
		const playerType = gameController.getPlayerInfo(index, 'type');
		const newType = playerType === 'human' ? 'ai' : 'human';
		gameController.setPlayerInfo(index, 'type', newType);
		playersBoxes[index].classList.remove(playerType);
		playersBoxes[index].classList.add(newType);
		switchAIButton.firstElementChild.textContent = playerType.toUpperCase();
	}

	function closeMenu(e) {
		e.preventDefault();
		if ((e.target === menuContainer.firstElementChild || e.target === nameForm) && nameForm.reportValidity()) {
			menuContainer.classList.add('hidden');
			gameController.playBot();
		}
	}

	function addMarker(index, marker) {
		tiles[index].firstElementChild.textContent = markers[marker];
		tiles[index].classList.add('marked');
	}

	function showWinTiles(indexes) {
		for (const i of indexes) {
			tiles[i].classList.add('win');
		}
	}

	function showWinner(index) {
		playersBoxes[index].classList.add('winner');
	}

	function clear() {
		restartRotation -= 360;
		restartButton.firstElementChild.style.transform = `rotateZ(${restartRotation}deg)`;
		for (const tile of tiles) {
			tile.classList.remove('marked', 'win');
			if (tile.firstElementChild.textContent) {
				tile.addEventListener('transitionend', () => tile.firstElementChild.textContent = '', { once: true });
			}
		}
		for (const box of playersBoxes) {
			box.classList.remove('winner');
		}
	}

	return { activePlayer, showMenu, saveName, toggleAI, closeMenu, addMarker, showWinTiles, showWinner, clear };
})();

const gameController = (() => {
	let board = ['', '', '', '', '', '', '', '', ''];
	const winCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	const players = [Player('Player One', 'human', 'x'), Player('Player Two', 'ai', 'o')];
	let currentPlayer = 0;
	let botIsPlaying = false;
	let gameFinished = false;
	let botTimeout;
	let restartTimeout;

	function getPlayerInfo(index, key) {
		return players[index][key];
	}

	function setPlayerInfo(index, key, value) {
		players[index][key] = value;
	}

	function switchPlayer() {
		currentPlayer = currentPlayer === 0 ? 1 : 0;
		boardController.activePlayer(currentPlayer);
		playBot();
	}

	function checkWinner() {
		for (const combo of winCombos) {
			const [a, b, c] = [board[combo[0]], board[combo[1]], board[combo[2]]];
			if (a && a === b && b === c) {
				return { result: 'win', marker: a, combo };
			}
		}
		if (board.every(marker => marker)) {
			return { result: 'tie' };
		}
		return { result: '' };
	}

	function minimax(player, depth, isMax) {
		const playerMarker = player.getMarker();
		const winner = checkWinner();
		if (winner.result === 'tie') {
			return 0;
		} else if (winner.result === 'win') {
			return winner.marker === playerMarker ? 10 - depth : -10 + depth;
		}
		let bestValue = isMax ? -Infinity : Infinity;
		for (let i = 0; i < board.length; i++) {
			if (!board[i]) {
				const minimaxFunction = minimax.bind(this, player, depth + 1, !isMax);
				board[i] = playerMarker;
				bestValue = isMax ? Math.max(bestValue, minimaxFunction()) : Math.min(bestValue, minimaxFunction());
				board[i] = '';
			}
		}
		return bestValue;
	}

	function findBestMove(player) {
		const playerMarker = player.getMarker();
		let bestValue = -Infinity;
		let bestMoves = [];
		let bestMove;
		for (let i = 0; i < board.length; i++) {
			if (!board[i]) {
				board[i] = playerMarker;
				const moveValue = minimax(player, 0, false);
				board[i] = '';
				if (moveValue > bestValue) {
					bestValue = moveValue;
					bestMove = i;
					bestMoves = [];
				} else if (moveValue === bestValue) {
					bestMoves.push(i);
				}
			}
		}
		if (bestMoves.length) {
			bestMoves.push(bestMove);
			bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
		}
		botIsPlaying = false;
		return bestMove;
	}

	function playBot() {
		if (!gameFinished && !botIsPlaying && players[currentPlayer].type === 'ai') {
			botIsPlaying = true;
			botTimeout = setTimeout(() => addMarker(findBestMove(players[currentPlayer])), 500);
		}
	}

	function finishGame(winner) {
		if (winner.result) {
			gameFinished = true;
			if (winner.result === 'win') {
				boardController.showWinTiles(winner.combo);
				boardController.showWinner(currentPlayer);
			}
			if (players.every(player => player.type === 'ai')) {
				restartTimeout = setTimeout(restart, 1000);
			}
		} else {
			switchPlayer();
		}
	}

	function addMarker(index) {
		if (!board[index] && (!botIsPlaying || this === window) && !gameFinished) {
			playerMarker = players[currentPlayer].getMarker();
			board[index] = playerMarker;
			boardController.addMarker(index, playerMarker);
			finishGame(checkWinner());
		}
	}

	function restart() {
		clearTimeout(botTimeout);
		clearTimeout(restartTimeout);
		board = ['', '', '', '', '', '', '', '', ''];
		boardController.clear();
		botIsPlaying = false;
		if (gameFinished) {
			gameFinished = false;
			switchPlayer();
		} else {
			playBot();
		}
	}

	return { getPlayerInfo, setPlayerInfo, playBot, addMarker, restart };
})();

playersBoxes.forEach((box, index) => box.addEventListener('click', boardController.showMenu.bind(box, index)));
inputName.addEventListener('input', boardController.saveName);
nameForm.addEventListener('submit', boardController.closeMenu);
switchAIButton.addEventListener('click', boardController.toggleAI);
menuContainer.addEventListener('click', boardController.closeMenu);
tiles.forEach((tile, index) => tile.addEventListener('click', gameController.addMarker.bind(tile, index)));
restartButton.addEventListener('click', gameController.restart);
