const tiles = board.querySelectorAll('.tile');
const restartButton = restart;

const Player = (marker) => {
	function getMarker() {
		return marker;
	}

	return { getMarker };
};

const boardController = (() => {
	const playersBoxes = players.querySelectorAll('.player');
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

	return { activePlayer, addMarker, showWinTiles, showWinner, clear };
})();

const gameController = (() => {
	let board = ['', '', '', '', '', '', '', '', ''];
	const winCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	const players = [Player('x'), Player('o')];
	let currentPlayer = 0;
	let gameFinished = false;

	function switchPlayer() {
		currentPlayer = currentPlayer === 0 ? 1 : 0;
		boardController.activePlayer(currentPlayer);
	}

	function checkWinner() {
		for (const combo of winCombos) {
			const [a, b, c] = [board[combo[0]], board[combo[1]], board[combo[2]]];
			if (a && b && c && a === b && b === c) {
				gameFinished = true;
				boardController.showWinTiles(combo);
				boardController.showWinner(currentPlayer);
			}
		}
		if (board.every(marker => marker)) {
			gameFinished = true;
		}
	}

	function addMarker(index) {
		if (!board[index] && !gameFinished) {
			playerMarker = players[currentPlayer].getMarker();
			board[index] = playerMarker;
			boardController.addMarker(index, playerMarker);
			checkWinner();
			if (!gameFinished) {
				switchPlayer();
			}
		}
	}

	function restart() {
		board = ['', '', '', '', '', '', '', '', ''];
		boardController.clear();
		if (gameFinished) {
			gameFinished = false;
			switchPlayer();
		}
	}

	return { addMarker, restart };
})();

tiles.forEach((tile, index) => tile.addEventListener('click', gameController.addMarker.bind(tile, index)));
restartButton.addEventListener('click', gameController.restart);
